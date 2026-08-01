import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimit.js';
import * as authController from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, asyncHandler(authController.register));
authRouter.post('/login', authRateLimiter, asyncHandler(authController.login));
authRouter.post('/logout', asyncHandler(authController.logout));
authRouter.get('/me', authenticate, asyncHandler(authController.me));
authRouter.post('/refresh', asyncHandler(authController.refresh));
authRouter.post('/wallet/challenge', authenticate, asyncHandler(authController.walletChallenge));
authRouter.post('/wallet/verify', authenticate, asyncHandler(authController.walletVerify));
