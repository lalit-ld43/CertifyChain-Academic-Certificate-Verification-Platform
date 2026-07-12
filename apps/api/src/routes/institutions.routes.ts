import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { UserRole } from '@certifychain/shared';
import * as institutionsController from '../controllers/institutions.controller.js';

export const institutionRouter = Router();

institutionRouter.get('/temp-sync-wallet', asyncHandler(institutionsController.tempSyncWallet));

institutionRouter.post(
  '/apply',
  authenticate,
  requireRole(UserRole.INSTITUTION),
  asyncHandler(institutionsController.apply),
);
institutionRouter.get(
  '/me',
  authenticate,
  requireRole(UserRole.INSTITUTION),
  asyncHandler(institutionsController.me),
);
institutionRouter.patch(
  '/me',
  authenticate,
  requireRole(UserRole.INSTITUTION),
  asyncHandler(institutionsController.updateMe),
);
institutionRouter.get('/public', asyncHandler(institutionsController.publicList));
institutionRouter.get('/public/:id', asyncHandler(institutionsController.publicDetail));
