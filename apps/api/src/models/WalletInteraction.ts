import { Schema, model, Types } from 'mongoose';

export interface WalletInteractionDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  walletAddress: string;
  action: string;
  txHash: string | null;
  contractFunction: string;
  network: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: Date;
}

const walletInteractionSchema = new Schema<WalletInteractionDoc>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  walletAddress: { type: String, required: true },
  action: { type: String, required: true },
  txHash: { type: String, default: null },
  contractFunction: { type: String, required: true },
  network: { type: String, required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  timestamp: { type: Date, default: Date.now },
});

export const WalletInteractionModel = model<WalletInteractionDoc>(
  'WalletInteraction',
  walletInteractionSchema,
);
