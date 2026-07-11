use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    NotAdmin = 3,
    InstitutionNotFound = 4,
    InstitutionAlreadyRegistered = 5,
    InstitutionNotApproved = 6,
    InstitutionSuspended = 7,
    NotInstitutionOwner = 8,
    CredentialAlreadyExists = 9,
    CredentialNotFound = 10,
    NotAssignedStudent = 11,
    AlreadyClaimed = 12,
    NotIssuer = 13,
    AlreadyRevoked = 14,
    InvalidExpiry = 15,
}
