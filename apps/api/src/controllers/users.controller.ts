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
  const { name, avatarUrl } = req.body as { name?: string; avatarUrl?: string };
  const user = await UserModel.findByIdAndUpdate(
    req.auth.sub,
    { ...(name && { name }), ...(avatarUrl && { avatarUrl }) },
    { new: true },
  );
  if (!user) throw AppError.notFound('User not found');
  res.json({ success: true, data: toUserDTO(user), requestId: req.requestId });
}
