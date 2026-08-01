import { Schema, model, Types } from 'mongoose';

export interface ShareLinkDoc {
  _id: Types.ObjectId;
  credentialId: Types.ObjectId;
  ownerUserId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date | null;
  maxViews: number | null;
  viewCount: number;
  isActive: boolean;
  createdAt: Date;
  revokedAt: Date | null;
}

const shareLinkSchema = new Schema<ShareLinkDoc>(
  {
    credentialId: { type: Schema.Types.ObjectId, ref: 'Credential', required: true, index: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, default: null },
    maxViews: { type: Number, default: null },
    viewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const ShareLinkModel = model<ShareLinkDoc>('ShareLink', shareLinkSchema);
