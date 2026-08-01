import type { Request, Response } from 'express';
import { feedbackSchema } from '@certifychain/shared';
import { FeedbackModel } from '../models/Feedback.js';

export async function submitFeedback(req: Request, res: Response) {
  const input = feedbackSchema.parse(req.body);
  const feedback = await FeedbackModel.create({
    ...input,
    userId: req.auth?.sub ?? null,
  });
  res.status(201).json({
    success: true,
    data: { id: String(feedback._id), createdAt: feedback.createdAt },
    requestId: req.requestId,
  });
}
