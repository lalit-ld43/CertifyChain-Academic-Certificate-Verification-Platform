import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { UserRole } from '@certifychain/shared';
import * as credentialsController from '../controllers/credentials.controller.js';

export const credentialRouter = Router();

credentialRouter.post(
  '/prepare',
  authenticate,
  requireRole(UserRole.INSTITUTION),
  asyncHandler(credentialsController.prepareIssuance),
);
credentialRouter.post(
  '/',
  authenticate,
  requireRole(UserRole.INSTITUTION),
  asyncHandler(credentialsController.confirmIssuance),
);
credentialRouter.get('/', authenticate, asyncHandler(credentialsController.list));
credentialRouter.get('/:id', authenticate, asyncHandler(credentialsController.detail));
credentialRouter.post(
  '/:id/claim-record',
  authenticate,
  requireRole(UserRole.STUDENT),
  asyncHandler(credentialsController.claimRecord),
);
credentialRouter.post(
  '/:id/revoke',
  authenticate,
  requireRole(UserRole.INSTITUTION, UserRole.ADMIN),
  asyncHandler(credentialsController.revoke),
);
credentialRouter.post('/:id/share', authenticate, asyncHandler(credentialsController.createShare));
credentialRouter.delete(
  '/:id/share/:shareId',
  authenticate,
  asyncHandler(credentialsController.revokeShare),
);
credentialRouter.get(
  '/:id/verification-history',
  authenticate,
  asyncHandler(credentialsController.verificationHistory),
);
