import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { UserRole } from '@certifychain/shared';
import * as adminController from '../controllers/admin.controller.js';

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole(UserRole.ADMIN));

adminRouter.get('/stats', asyncHandler(adminController.stats));
adminRouter.get('/institutions', asyncHandler(adminController.listInstitutions));
adminRouter.get('/institutions/:id', asyncHandler(adminController.getInstitution));
adminRouter.patch('/institutions/:id/approve', asyncHandler(adminController.approveInstitution));
adminRouter.patch('/institutions/:id/reject', asyncHandler(adminController.rejectInstitution));
adminRouter.patch('/institutions/:id/suspend', asyncHandler(adminController.suspendInstitution));
adminRouter.get('/users', asyncHandler(adminController.listUsers));
adminRouter.get('/credentials', asyncHandler(adminController.listCredentials));
adminRouter.get('/feedback', asyncHandler(adminController.listFeedback));
