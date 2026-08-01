import type {
  CredentialStatus,
  CredentialType,
  InstitutionStatus,
  UserRole,
  VerificationMethod,
  VerificationResult,
} from './enums.js';

/** Standard success envelope returned by every API endpoint. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  requestId: string;
}

/** Standard error envelope returned by every API endpoint. */
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[]>;
    requestId: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress: string | null;
  walletVerifiedAt: string | null;
  avatarUrl: string | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface InstitutionDTO {
  id: string;
  ownerUserId: string;
  legalName: string;
  displayName: string;
  institutionType: string;
  website: string;
  contactEmail: string;
  description: string;
  logoUrl: string | null;
  country: string;
  walletAddress: string | null;
  status: InstitutionStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export interface CredentialDTO {
  id: string;
  credentialId: string;
  studentUserId: string | null;
  studentWalletAddress: string;
  institutionId: string;
  institutionName: string;
  issuerWalletAddress: string;
  credentialType: CredentialType;
  courseName: string;
  qualificationLevel: string | null;
  grade: string | null;
  issueDate: string;
  expiryDate: string | null;
  certificateNumber: string;
  metadataHash: string;
  documentHash: string;
  documentUrl: string | null;
  contractId: string;
  issueTxHash: string | null;
  revokeTxHash: string | null;
  status: CredentialStatus;
  revocationReason: string | null;
  issuedAt: string | null;
  revokedAt: string | null;
}

export interface VerificationResultDTO {
  result: VerificationResult;
  credential: Pick<
    CredentialDTO,
    | 'credentialId'
    | 'institutionName'
    | 'credentialType'
    | 'issueDate'
    | 'expiryDate'
    | 'status'
    | 'courseName'
  > | null;
  checkedAt: string;
  method: VerificationMethod;
  hashMatched?: boolean;
}

export interface ShareLinkDTO {
  id: string;
  credentialId: string;
  token: string; // only ever returned once, at creation
  expiresAt: string | null;
  maxViews: number | null;
  viewCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface FeedbackDTO {
  id: string;
  role: UserRole | 'guest';
  rating: number;
  usabilityRating: number;
  trustRating: number;
  message: string;
  improvementSuggestion: string | null;
  consentToPublish: boolean;
  createdAt: string;
}

export interface WalletInteractionDTO {
  id: string;
  walletAddress: string;
  action: string;
  txHash: string | null;
  contractFunction: string;
  network: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: string;
}

/** Canonical metadata object hashed before on-chain issuance. See docs/contract.md */
export interface CanonicalCredentialMetadata {
  schemaVersion: '1.0';
  credentialId: string;
  institutionId: string;
  studentWallet: string;
  credentialType: CredentialType;
  courseName: string;
  issueDate: string; // ISO date, no time
  expiryDate: string | null;
  certificateNumber: string;
}
