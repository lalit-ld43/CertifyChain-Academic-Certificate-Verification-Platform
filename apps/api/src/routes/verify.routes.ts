import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { optionalAuthenticate } from '../middleware/auth.js';
import { verifyRateLimiter, uploadRateLimiter } from '../middleware/rateLimit.js';
import * as verifyController from '../controllers/verify.controller.js';

export const verifyRouter = Router();

verifyRouter.get(
  '/:credentialId',
  verifyRateLimiter,
  optionalAuthenticate,
  asyncHandler(verifyController.verifyByCredentialId),
);
verifyRouter.get(
  '/share/:token',
  verifyRateLimiter,
  optionalAuthenticate,
  asyncHandler(verifyController.verifyByShareToken),
);
verifyRouter.post(
  '/file',
  uploadRateLimiter,
  optionalAuthenticate,
  verifyController.uploadMiddleware.single('file'),
  asyncHandler(verifyController.verifyByFile),
);
