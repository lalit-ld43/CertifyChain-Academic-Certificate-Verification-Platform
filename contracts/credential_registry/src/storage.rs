use soroban_sdk::{Address, BytesN, Env};

use crate::errors::ContractError;
use crate::types::{CredentialRecord, DataKey, InstitutionRecord};

// TTL constants, expressed in ledgers (~5s per ledger on Testnet).
// ~30 days living TTL, extended to ~60 days whenever the "high water mark" is crossed.
const INSTANCE_BUMP_TO: u32 = 30 * 24 * 60 * 60 / 5;
const INSTANCE_BUMP_THRESHOLD: u32 = 15 * 24 * 60 * 60 / 5;
const PERSISTENT_BUMP_TO: u32 = 60 * 24 * 60 * 60 / 5;
const PERSISTENT_BUMP_THRESHOLD: u32 = 30 * 24 * 60 * 60 / 5;

pub fn extend_instance_ttl(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(INSTANCE_BUMP_THRESHOLD, INSTANCE_BUMP_TO);
}

pub fn get_admin(env: &Env) -> Result<Address, ContractError> {
    env.storage()
        .instance()
        .get(&DataKey::Admin)
        .ok_or(ContractError::NotInitialized)
}

pub fn set_admin(env: &Env, admin: &Address) {
    env.storage().instance().set(&DataKey::Admin, admin);
}

pub fn has_admin(env: &Env) -> bool {
    env.storage().instance().has(&DataKey::Admin)
}

pub fn get_institution(env: &Env, institution: &Address) -> Option<InstitutionRecord> {
    let key = DataKey::Institution(institution.clone());
    let record: Option<InstitutionRecord> = env.storage().persistent().get(&key);
    if record.is_some() {
        env.storage()
            .persistent()
            .extend_ttl(&key, PERSISTENT_BUMP_THRESHOLD, PERSISTENT_BUMP_TO);
    }
    record
}

pub fn set_institution(env: &Env, institution: &Address, record: &InstitutionRecord) {
    let key = DataKey::Institution(institution.clone());
    env.storage().persistent().set(&key, record);
    env.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_BUMP_THRESHOLD, PERSISTENT_BUMP_TO);
}

pub fn get_credential(env: &Env, credential_id: &BytesN<32>) -> Option<CredentialRecord> {
    let key = DataKey::Credential(credential_id.clone());
    let record: Option<CredentialRecord> = env.storage().persistent().get(&key);
    if record.is_some() {
        env.storage()
            .persistent()
            .extend_ttl(&key, PERSISTENT_BUMP_THRESHOLD, PERSISTENT_BUMP_TO);
    }
    record
}

pub fn set_credential(env: &Env, credential_id: &BytesN<32>, record: &CredentialRecord) {
    let key = DataKey::Credential(credential_id.clone());
    env.storage().persistent().set(&key, record);
    env.storage()
        .persistent()
        .extend_ttl(&key, PERSISTENT_BUMP_THRESHOLD, PERSISTENT_BUMP_TO);
}

pub fn credential_exists(env: &Env, credential_id: &BytesN<32>) -> bool {
    env.storage()
        .persistent()
        .has(&DataKey::Credential(credential_id.clone()))
}
