import type { Request, Response } from 'express';
import { UserModel } from '../models/User.js';
import { toUserDTO } from '../utils/sanitize.js';
import { AppError } from '../utils/AppError.js';

export async function getMe(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  const user = await UserModel.findById(req.auth.sub);
  if (!user) throw AppError.notFound('User not found');
  res.json({ success: true, data: toUserDTO(user), requestId: req.requestId });
}

export async function updateMe(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  const { name, avatarUrl, walletAddress } = req.body as {
    name?: string;
    avatarUrl?: string;
    walletAddress?: string;
  };
  const user = await UserModel.findByIdAndUpdate(
    req.auth.sub,
    {
      ...(name && { name }),
      ...(avatarUrl && { avatarUrl }),
      ...(walletAddress && { walletAddress }),
    },
    { new: true },
  );
  if (!user) throw AppError.notFound('User not found');
  res.json({ success: true, data: toUserDTO(user), requestId: req.requestId });
}

export async function tempSyncWallet(req: Request, res: Response) {
  const { email, walletAddress } = req.query as { email: string; walletAddress: string };
  if (!email || !walletAddress) {
    throw AppError.validation('Missing email or walletAddress query parameters.');
  }
  const user = await UserModel.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    { walletAddress },
    { new: true },
  );
  if (!user) throw AppError.notFound('User not found with this email');
  res.json({
    success: true,
    message: `Wallet successfully set to ${walletAddress} for user ${user.name}`,
  });
}
