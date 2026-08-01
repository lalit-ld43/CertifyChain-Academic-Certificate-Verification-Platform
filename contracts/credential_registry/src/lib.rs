#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, BytesN, Env, Symbol};

mod errors;
mod storage;
mod types;

#[cfg(test)]
mod test;

pub use errors::ContractError;
pub use types::{CredentialRecord, CredentialStatus, DataKey, InstitutionRecord, InstitutionStatus};

use storage::{
    credential_exists as storage_credential_exists, extend_instance_ttl, get_admin,
    get_credential, get_institution, has_admin, set_admin, set_credential, set_institution,
};

#[contract]
pub struct CredentialRegistry;

#[contractimpl]
impl CredentialRegistry {
    /// Runs exactly once. Sets the contract administrator.
    pub fn initialize(env: Env, admin: Address) -> Result<(), ContractError> {
        if has_admin(&env) {
            return Err(ContractError::AlreadyInitialized);
        }
        admin.require_auth();
        set_admin(&env, &admin);
        extend_instance_ttl(&env);
        Ok(())
    }

    /// An institution registers itself with a hash of its off-chain
    /// verification metadata. Starts in `Pending` status.
    pub fn register_institution(
        env: Env,
        institution: Address,
        metadata_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        institution.require_auth();

        if get_institution(&env, &institution).is_some() {
            return Err(ContractError::InstitutionAlreadyRegistered);
        }

        let record = InstitutionRecord {
            institution: institution.clone(),
            metadata_hash,
            status: InstitutionStatus::Pending,
            registered_at: env.ledger().timestamp(),
            approved_at: 0,
        };
        set_institution(&env, &institution, &record);
        extend_instance_ttl(&env);

        env.events().publish(
            (symbol_short!("inst_reg"), institution.clone()),
            env.ledger().timestamp(),
        );
        Ok(())
    }

    /// Admin-only. Moves an institution from Pending/Suspended to Approved.
    pub fn approve_institution(env: Env, institution: Address) -> Result<(), ContractError> {
        let admin = get_admin(&env)?;
        admin.require_auth();

        let mut record =
            get_institution(&env, &institution).ok_or(ContractError::InstitutionNotFound)?;
        record.status = InstitutionStatus::Approved;
        record.approved_at = env.ledger().timestamp();
        set_institution(&env, &institution, &record);

        env.events().publish(
            (symbol_short!("inst_appr"), institution.clone()),
            env.ledger().timestamp(),
        );
        Ok(())
    }

    /// Admin-only. Suspends a previously approved institution, blocking new issuance.
    pub fn suspend_institution(env: Env, institution: Address) -> Result<(), ContractError> {
        let admin = get_admin(&env)?;
        admin.require_auth();

        let mut record =
            get_institution(&env, &institution).ok_or(ContractError::InstitutionNotFound)?;
        record.status = InstitutionStatus::Suspended;
        set_institution(&env, &institution, &record);

        env.events().publish(
            (symbol_short!("inst_susp"), institution.clone()),
            env.ledger().timestamp(),
        );
        Ok(())
    }

    /// Issues a new credential. Requires the issuing institution's
    /// authorization and approved status. Fails if the credential_id already
    /// exists (no re-issuance under the same id).
    #[allow(clippy::too_many_arguments)]
    pub fn issue_credential(
        env: Env,
        issuer: Address,
        credential_id: BytesN<32>,
        student: Address,
        credential_hash: BytesN<32>,
        credential_type: Symbol,
        issued_at: u64,
        expires_at: u64,
    ) -> Result<(), ContractError> {
        issuer.require_auth();

        let institution = get_institution(&env, &issuer).ok_or(ContractError::InstitutionNotFound)?;
        match institution.status {
            InstitutionStatus::Approved => {}
            InstitutionStatus::Suspended => return Err(ContractError::InstitutionSuspended),
            InstitutionStatus::Pending => return Err(ContractError::InstitutionNotApproved),
        }

        if storage_credential_exists(&env, &credential_id) {
            return Err(ContractError::CredentialAlreadyExists);
        }

        if expires_at != 0 && expires_at <= issued_at {
            return Err(ContractError::InvalidExpiry);
        }

        let zero_hash = BytesN::from_array(&env, &[0u8; 32]);
        let record = CredentialRecord {
            credential_id: credential_id.clone(),
            issuer: issuer.clone(),
            student: student.clone(),
            credential_hash,
            credential_type,
            issued_at,
            expires_at,
            status: CredentialStatus::Active,
            claimed: false,
            revoke_reason_hash: zero_hash,
        };
        set_credential(&env, &credential_id, &record);

        env.events().publish(
            (symbol_short!("cred_iss"), issuer, student),
            credential_id,
        );
        Ok(())
    }

    /// The assigned student claims/acknowledges their credential. Only the
    /// exact student address recorded at issuance may claim it.
    pub fn claim_credential(env: Env, credential_id: BytesN<32>) -> Result<(), ContractError> {
        let mut record =
            get_credential(&env, &credential_id).ok_or(ContractError::CredentialNotFound)?;

        record.student.require_auth();

        if record.claimed {
            return Err(ContractError::AlreadyClaimed);
        }
        record.claimed = true;
        set_credential(&env, &credential_id, &record);

        env.events().publish(
            (symbol_short!("cred_clm"), record.student.clone()),
            credential_id,
        );
        Ok(())
    }

    /// The issuing institution (or admin) revokes a credential permanently.
    /// A revoked credential can never become active again.
    pub fn revoke_credential(
        env: Env,
        caller: Address,
        credential_id: BytesN<32>,
        reason_hash: BytesN<32>,
    ) -> Result<(), ContractError> {
        caller.require_auth();

        let mut record =
            get_credential(&env, &credential_id).ok_or(ContractError::CredentialNotFound)?;

        let admin = get_admin(&env)?;
        if caller != record.issuer && caller != admin {
            return Err(ContractError::NotIssuer);
        }

        if let CredentialStatus::Revoked = record.status {
            return Err(ContractError::AlreadyRevoked);
        }

        record.status = CredentialStatus::Revoked;
        record.revoke_reason_hash = reason_hash;
        set_credential(&env, &credential_id, &record);

        env.events()
            .publish((symbol_short!("cred_rev"), caller), credential_id);
        Ok(())
    }

    /// Public read: returns the full credential record for verification.
    /// Callers should compare `expires_at` against wall-clock time
    /// themselves (or use the backend's derived `status`), since the
    /// contract only stores `Active`/`Revoked` on-chain.
    pub fn verify_credential(
        env: Env,
        credential_id: BytesN<32>,
    ) -> Result<CredentialRecord, ContractError> {
        get_credential(&env, &credential_id).ok_or(ContractError::CredentialNotFound)
    }

    pub fn credential_exists(env: Env, credential_id: BytesN<32>) -> bool {
        storage_credential_exists(&env, &credential_id)
    }

    pub fn get_institution(env: Env, institution: Address) -> Result<InstitutionRecord, ContractError> {
        get_institution(&env, &institution).ok_or(ContractError::InstitutionNotFound)
    }

    pub fn get_credential(env: Env, credential_id: BytesN<32>) -> Result<CredentialRecord, ContractError> {
        get_credential(&env, &credential_id).ok_or(ContractError::CredentialNotFound)
    }
}
