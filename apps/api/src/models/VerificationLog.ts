import { Schema, model, Types } from 'mongoose';
import { VerificationMethod, VerificationResult } from '@certifychain/shared';

export interface VerificationLogDoc {
  _id: Types.ObjectId;
  credentialId: Types.ObjectId | null;
  verifierUserId: Types.ObjectId | null;
  result: VerificationResult;
  method: VerificationMethod;
  verifierIpHash: string | null;
  userAgentSummary: string | null;
  createdAt: Date;
}

const verificationLogSchema = new Schema<VerificationLogDoc>(
  {
    credentialId: { type: Schema.Types.ObjectId, ref: 'Credential', default: null, index: true },
    verifierUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    result: { type: String, enum: Object.values(VerificationResult), required: true },
    method: { type: String, enum: Object.values(VerificationMethod), required: true },
    verifierIpHash: { type: String, default: null },
    userAgentSummary: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const VerificationLogModel = model<VerificationLogDoc>(
  'VerificationLog',
  verificationLogSchema,
);
