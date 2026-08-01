import { Schema, model, Types } from 'mongoose';
import { CredentialStatus, CredentialType } from '@certifychain/shared';

export interface CredentialDoc {
  _id: Types.ObjectId;
  credentialId: string;
  studentUserId: Types.ObjectId | null;
  studentWalletAddress: string;
  institutionId: Types.ObjectId;
  issuerWalletAddress: string;
  credentialType: CredentialType;
  courseName: string;
  qualificationLevel: string | null;
  grade: string | null;
  issueDate: Date;
  expiryDate: Date | null;
  certificateNumber: string;
  metadataHash: string;
  documentHash: string;
  documentUrl: string | null;
  contractId: string;
  issueTxHash: string | null;
  revokeTxHash: string | null;
  status: CredentialStatus;
  revocationReason: string | null;
  issuedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const credentialSchema = new Schema<CredentialDoc>(
  {
    credentialId: { type: String, required: true, unique: true, index: true },
    studentUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    studentWalletAddress: { type: String, required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    issuerWalletAddress: { type: String, required: true },
    credentialType: { type: String, enum: Object.values(CredentialType), required: true },
    courseName: { type: String, required: true },
    qualificationLevel: { type: String, default: null },
    grade: { type: String, default: null, select: false },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, default: null },
    certificateNumber: { type: String, required: true, select: false },
    metadataHash: { type: String, required: true },
    documentHash: { type: String, required: true },
    documentUrl: { type: String, default: null, select: false },
    contractId: { type: String, required: true },
    issueTxHash: { type: String, default: null },
    revokeTxHash: { type: String, default: null },
    status: {
      type: String,
      enum: Object.values(CredentialStatus),
      default: CredentialStatus.PENDING,
      index: true,
    },
    revocationReason: { type: String, default: null },
    issuedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const CredentialModel = model<CredentialDoc>('Credential', credentialSchema);
