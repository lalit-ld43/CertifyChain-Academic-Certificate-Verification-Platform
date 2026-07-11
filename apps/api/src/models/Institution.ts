import { Schema, model, Types } from 'mongoose';
import { InstitutionStatus } from '@certifychain/shared';

export interface InstitutionDoc {
  _id: Types.ObjectId;
  ownerUserId: Types.ObjectId;
  legalName: string;
  displayName: string;
  institutionType: string;
  registrationNumber: string;
  website: string;
  contactEmail: string;
  description: string;
  logoUrl: string | null;
  country: string;
  address: string;
  walletAddress: string | null;
  status: InstitutionStatus;
  verificationDocuments: string[];
  rejectionReason: string | null;
  reviewedBy: Types.ObjectId | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const institutionSchema = new Schema<InstitutionDoc>(
  {
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    legalName: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    institutionType: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    website: { type: String, required: true },
    contactEmail: { type: String, required: true, lowercase: true },
    description: { type: String, required: true },
    logoUrl: { type: String, default: null },
    country: { type: String, required: true },
    address: { type: String, required: true },
    walletAddress: { type: String, default: null, unique: true, sparse: true },
    status: {
      type: String,
      enum: Object.values(InstitutionStatus),
      default: InstitutionStatus.PENDING,
      index: true,
    },
    verificationDocuments: { type: [String], default: [], select: false },
    rejectionReason: { type: String, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const InstitutionModel = model<InstitutionDoc>('Institution', institutionSchema);
