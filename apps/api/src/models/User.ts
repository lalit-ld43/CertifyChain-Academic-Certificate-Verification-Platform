import { Schema, model, Types } from 'mongoose';
import { UserRole } from '@certifychain/shared';

export interface UserDoc {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  walletAddress: string | null;
  walletVerifiedAt: Date | null;
  avatarUrl: string | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), required: true, index: true },
    walletAddress: { type: String, default: null, unique: true, sparse: true },
    walletVerifiedAt: { type: Date, default: null },
    avatarUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const UserModel = model<UserDoc>('User', userSchema);
