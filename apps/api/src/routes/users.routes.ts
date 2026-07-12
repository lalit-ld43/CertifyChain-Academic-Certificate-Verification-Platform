import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import * as usersController from '../controllers/users.controller.js';

export const userRouter = Router();

userRouter.get('/temp-sync-wallet', asyncHandler(usersController.tempSyncWallet));
userRouter.get('/debug-list', asyncHandler(usersController.debugList));
userRouter.get('/me', authenticate, asyncHandler(usersController.getMe));
userRouter.patch('/me', authenticate, asyncHandler(usersController.updateMe));
