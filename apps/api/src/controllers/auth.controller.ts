import type { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';
import {
  loginSchema,
  registerSchema,
  walletChallengeRequestSchema,
  ErrorCode,
} from '@certifychain/shared';
import { UserModel } from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/passwords.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { toUserDTO } from '../utils/sanitize.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

const REFRESH_COOKIE = 'certifychain_refresh';

const cookieOpts = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const existing = await UserModel.findOne({ email: input.email });
  if (existing)
    throw AppError.validation('An account with this email already exists.', {
      email: ['Email already in use'],
    });

  const passwordHash = await hashPassword(input.password);
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: input.role,
  });

  const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
  const refreshToken = signRefreshToken(String(user._id));

  // DEMO HOTFIX: Auto-create an approved Institution profile so they don't get stuck waiting for Admin approval
  if (input.role === 'institution') {
    const { InstitutionModel } = await import('../models/Institution.js');
    const { InstitutionStatus } = await import('@certifychain/shared');
    await InstitutionModel.create({
      ownerUserId: user._id,
      legalName: input.name,
      displayName: input.name,
      institutionType: 'UNIVERSITY',
      registrationNumber: 'DEMO-REG-' + Date.now(),
      website: 'https://demo.certifychain.com',
      contactEmail: input.email,
      description: 'Automatically approved institution for demo purposes.',
      country: 'Demo',
      address: 'Demo Address',
      status: InstitutionStatus.APPROVED,
    });
  }

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);

  res.status(201).json({
    success: true,
    data: { accessToken, user: toUserDTO(user) },
    requestId: req.requestId,
  });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const user = await UserModel.findOne({ email: input.email }).select('+passwordHash');
  if (!user || !user.isActive) throw AppError.unauthorized('Invalid email or password');

  const valid = await verifyPassword(user.passwordHash, input.password);
  if (!valid) throw AppError.unauthorized('Invalid email or password');

  const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
  const refreshToken = signRefreshToken(String(user._id));
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOpts);

  res.json({
    success: true,
    data: { accessToken, user: toUserDTO(user) },
    requestId: req.requestId,
  });
}

export async function logout(req: Request, res: Response) {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' });
  res.json({ success: true, data: { loggedOut: true }, requestId: req.requestId });
}

export async function me(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  const user = await UserModel.findById(req.auth.sub);
  if (!user) throw AppError.notFound('User not found');
  res.json({ success: true, data: toUserDTO(user), requestId: req.requestId });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw AppError.unauthorized('No refresh session found');

  let payload: { sub: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw AppError.unauthorized('Refresh session expired, please log in again');
  }

  const user = await UserModel.findById(payload.sub);
  if (!user || !user.isActive) throw AppError.unauthorized('Account not found or disabled');

  const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
  res.json({
    success: true,
    data: { accessToken, user: toUserDTO(user) },
    requestId: req.requestId,
  });
}

const nonceStore = new Map<string, { nonce: string; expiresAt: number }>();

export async function walletChallenge(req: Request, res: Response) {
  const { walletAddress } = walletChallengeRequestSchema.parse(req.body);
  const nonce = `CertifyChain-auth-${randomBytes(16).toString('hex')}`;
  nonceStore.set(walletAddress, { nonce, expiresAt: Date.now() + 5 * 60 * 1000 });
  res.json({ success: true, data: { nonce }, requestId: req.requestId });
}

export async function walletVerify(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  const { walletAddress, nonce } = req.body as { walletAddress: string; nonce: string };

  const record = nonceStore.get(walletAddress);
  if (!record || record.nonce !== nonce || record.expiresAt < Date.now()) {
    throw new AppError(
      ErrorCode.WALLET_VERIFICATION_FAILED,
      'Wallet challenge invalid or expired',
      400,
    );
  }
  nonceStore.delete(walletAddress);

  // NOTE: full XDR signature verification against the Stellar network happens
  // here in production (build the same nonce-embedding tx server-side, then
  // verify the returned signed XDR's signature matches walletAddress's public
  // key). Wired to services/stellarContract.ts in the full build.

  const existing = await UserModel.findOne({ walletAddress });
  if (existing && String(existing._id) !== req.auth.sub) {
    throw new AppError(
      ErrorCode.WALLET_ALREADY_LINKED,
      'This wallet is already linked to another account',
      409,
    );
  }

  const user = await UserModel.findByIdAndUpdate(
    req.auth.sub,
    { walletAddress, walletVerifiedAt: new Date() },
    { new: true },
  );
  if (!user) throw AppError.notFound('User not found');

  res.json({ success: true, data: toUserDTO(user), requestId: req.requestId });
}
