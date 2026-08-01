/** PostHog event names — spec §22. Keep string values stable once shipped. */
export const AnalyticsEvent = {
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  WALLET_CONNECTION_STARTED: 'wallet_connection_started',
  WALLET_CONNECTED: 'wallet_connected',
  INSTITUTION_APPLICATION_SUBMITTED: 'institution_application_submitted',
  INSTITUTION_APPROVED: 'institution_approved',
  CREDENTIAL_ISSUANCE_STARTED: 'credential_issuance_started',
  CREDENTIAL_ISSUED: 'credential_issued',
  CREDENTIAL_CLAIMED: 'credential_claimed',
  CREDENTIAL_SHARED: 'credential_shared',
  CREDENTIAL_VERIFIED: 'credential_verified',
  CERTIFICATE_FILE_COMPARED: 'certificate_file_compared',
  CREDENTIAL_REVOKED: 'credential_revoked',
  VERIFICATION_REPORT_DOWNLOADED: 'verification_report_downloaded',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
} as const;
export type AnalyticsEvent = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

/** Soroban contract function names — must match contracts/credential_registry/src/lib.rs */
export const ContractFn = {
  INITIALIZE: 'initialize',
  REGISTER_INSTITUTION: 'register_institution',
  APPROVE_INSTITUTION: 'approve_institution',
  SUSPEND_INSTITUTION: 'suspend_institution',
  ISSUE_CREDENTIAL: 'issue_credential',
  CLAIM_CREDENTIAL: 'claim_credential',
  REVOKE_CREDENTIAL: 'revoke_credential',
  VERIFY_CREDENTIAL: 'verify_credential',
  CREDENTIAL_EXISTS: 'credential_exists',
  GET_INSTITUTION: 'get_institution',
  GET_CREDENTIAL: 'get_credential',
} as const;
export type ContractFn = (typeof ContractFn)[keyof typeof ContractFn];

/** Stable API error codes returned in ApiError.error.code */
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CREDENTIAL_NOT_FOUND: 'CREDENTIAL_NOT_FOUND',
  INSTITUTION_NOT_APPROVED: 'INSTITUTION_NOT_APPROVED',
  DUPLICATE_CREDENTIAL: 'DUPLICATE_CREDENTIAL',
  WALLET_ALREADY_LINKED: 'WALLET_ALREADY_LINKED',
  WALLET_VERIFICATION_FAILED: 'WALLET_VERIFICATION_FAILED',
  SHARE_LINK_EXPIRED: 'SHARE_LINK_EXPIRED',
  SHARE_LINK_INACTIVE: 'SHARE_LINK_INACTIVE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE',
  RATE_LIMITED: 'RATE_LIMITED',
  CONTRACT_ERROR: 'CONTRACT_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_UPLOAD_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'] as const;
