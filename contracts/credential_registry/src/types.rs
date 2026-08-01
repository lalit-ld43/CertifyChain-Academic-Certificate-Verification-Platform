use soroban_sdk::{contracttype, Address, BytesN, Symbol};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum InstitutionStatus {
    Pending,
    Approved,
    Suspended,
}

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum CredentialStatus {
    Active,
    Revoked,
    // Expired is derived at read time from expires_at vs. the ledger
    // timestamp — it is never written to storage as its own state.
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct InstitutionRecord {
    pub institution: Address,
    pub metadata_hash: BytesN<32>,
    pub status: InstitutionStatus,
    pub registered_at: u64,
    pub approved_at: u64,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct CredentialRecord {
    pub credential_id: BytesN<32>,
    pub issuer: Address,
    pub student: Address,
    pub credential_hash: BytesN<32>,
    pub credential_type: Symbol,
    pub issued_at: u64,
    pub expires_at: u64, // 0 means no expiry
    pub status: CredentialStatus,
    pub claimed: bool,
    pub revoke_reason_hash: BytesN<32>, // zeroed if not revoked
}

/// Storage keys. Instance storage holds the singleton Admin; persistent
/// storage holds per-institution and per-credential records, each with TTL
/// extension applied on write/read (see storage.rs).
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Institution(Address),
    Credential(BytesN<32>),
}
