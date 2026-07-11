/**
 * Enums shared between apps/web, apps/api, and mirrored conceptually in the
 * Soroban contract (contracts/credential_registry/src/types.rs).
 * Keep these in sync manually — the contract cannot import TS.
 */

export const UserRole = {
  STUDENT: 'student',
  INSTITUTION: 'institution',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const InstitutionStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
} as const;
export type InstitutionStatus = (typeof InstitutionStatus)[keyof typeof InstitutionStatus];

export const CredentialStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
} as const;
export type CredentialStatus = (typeof CredentialStatus)[keyof typeof CredentialStatus];

export const VerificationResult = {
  VALID: 'valid',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
  INVALID: 'invalid',
  NOT_FOUND: 'not_found',
} as const;
export type VerificationResult = (typeof VerificationResult)[keyof typeof VerificationResult];

export const VerificationMethod = {
  ID: 'id',
  QR: 'qr',
  LINK: 'link',
  FILE_HASH: 'file_hash',
} as const;
export type VerificationMethod = (typeof VerificationMethod)[keyof typeof VerificationMethod];

export const CredentialType = {
  DEGREE: 'DEGREE',
  DIPLOMA: 'DIPLOMA',
  CERTIFICATE: 'CERTIFICATE',
  TRANSCRIPT: 'TRANSCRIPT',
  MICROCREDENTIAL: 'MICROCREDENTIAL',
} as const;
export type CredentialType = (typeof CredentialType)[keyof typeof CredentialType];

export const WalletAction = {
  INSTITUTION_REGISTERED: 'institution_registered',
  INSTITUTION_APPROVED: 'institution_approved',
  INSTITUTION_SUSPENDED: 'institution_suspended',
  CREDENTIAL_ISSUED: 'credential_issued',
  CREDENTIAL_CLAIMED: 'credential_claimed',
  CREDENTIAL_REVOKED: 'credential_revoked',
} as const;
export type WalletAction = (typeof WalletAction)[keyof typeof WalletAction];
