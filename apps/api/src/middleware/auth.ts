import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { UserRole } from '@certifychain/shared';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export interface AccessTokenPayload {
  sub: string; // user id
  role: UserRole;
  institutionId?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload;
    }
  }
}

/** Verifies the JWT access token from the Authorization header. Never trust client-claimed role without this. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Missing or malformed Authorization header');
  }
  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    req.auth = payload;
    next();
  } catch {
    throw AppError.unauthorized('Invalid or expired access token');
  }
}

/** Optional auth: attaches req.auth if a valid token is present, but never throws. Used on public verify routes. */
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  if (header?.startsWith('Bearer ')) {
    try {
      req.auth = jwt.verify(header.slice(7), env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    } catch {
      // ignore invalid token on optional routes
    }
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) throw AppError.unauthorized();
    if (!roles.includes(req.auth.role)) {
      throw AppError.forbidden(`This action requires one of these roles: ${roles.join(', ')}`);
    }
    next();
  };
}
