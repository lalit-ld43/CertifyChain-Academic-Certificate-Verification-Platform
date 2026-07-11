import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler.js';
import { optionalAuthenticate } from '../middleware/auth.js';
import * as feedbackController from '../controllers/feedback.controller.js';

export const feedbackRouter = Router();

feedbackRouter.post('/', optionalAuthenticate, asyncHandler(feedbackController.submitFeedback));
