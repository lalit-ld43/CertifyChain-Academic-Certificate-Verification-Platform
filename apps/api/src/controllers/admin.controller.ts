import type { Request, Response } from 'express';
import { InstitutionStatus, CredentialStatus, paginationSchema } from '@certifychain/shared';
import { UserModel } from '../models/User.js';
import { InstitutionModel } from '../models/Institution.js';
import { CredentialModel } from '../models/Credential.js';
import { VerificationLogModel } from '../models/VerificationLog.js';
import { WalletInteractionModel } from '../models/WalletInteraction.js';
import { FeedbackModel } from '../models/Feedback.js';
import { AppError } from '../utils/AppError.js';

export async function stats(_req: Request, res: Response) {
  const [
    totalUsers,
    pendingInstitutions,
    approvedInstitutions,
    credentialsIssued,
    revokedCredentials,
    totalVerifications,
    walletInteractions,
    feedbackAgg,
  ] = await Promise.all([
    UserModel.countDocuments(),
    InstitutionModel.countDocuments({ status: InstitutionStatus.PENDING }),
    InstitutionModel.countDocuments({ status: InstitutionStatus.APPROVED }),
    CredentialModel.countDocuments(),
    CredentialModel.countDocuments({ status: CredentialStatus.REVOKED }),
    VerificationLogModel.countDocuments(),
    WalletInteractionModel.countDocuments(),
    FeedbackModel.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }]),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      pendingInstitutions,
      approvedInstitutions,
      credentialsIssued,
      revokedCredentials,
      totalVerifications,
      walletInteractions,
      feedbackAverageRating: feedbackAgg[0]?.avg ?? null,
      feedbackCount: feedbackAgg[0]?.count ?? 0,
    },
    requestId: (_req as Request).requestId,
  });
}

export async function listInstitutions(req: Request, res: Response) {
  const { page, pageSize, q } = paginationSchema.parse(req.query);
  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;
  if (q) filter.displayName = { $regex: q, $options: 'i' };

  const [items, total] = await Promise.all([
    InstitutionModel.find(filter).skip((page - 1) * pageSize).limit(pageSize),
    InstitutionModel.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId: req.requestId,
  });
}

export async function getInstitution(req: Request, res: Response) {
  const institution = await InstitutionModel.findById(req.params.id).select('+verificationDocuments');
  if (!institution) throw AppError.notFound('Institution not found');
  res.json({ success: true, data: institution, requestId: req.requestId });
}

export async function approveInstitution(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  const institution = await InstitutionModel.findByIdAndUpdate(
    req.params.id,
    {
      status: InstitutionStatus.APPROVED,
      reviewedBy: req.auth.sub,
      reviewedAt: new Date(),
      rejectionReason: null,
    },
    { new: true },
  );
  if (!institution) throw AppError.notFound('Institution not found');
  res.json({ success: true, data: institution, requestId: req.requestId });
}

export async function rejectInstitution(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  const { reason } = req.body as { reason: string };
  const institution = await InstitutionModel.findByIdAndUpdate(
    req.params.id,
    {
      status: InstitutionStatus.REJECTED,
      reviewedBy: req.auth.sub,
      reviewedAt: new Date(),
      rejectionReason: reason,
    },
    { new: true },
  );
  if (!institution) throw AppError.notFound('Institution not found');
  res.json({ success: true, data: institution, requestId: req.requestId });
}

export async function suspendInstitution(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  const institution = await InstitutionModel.findByIdAndUpdate(
    req.params.id,
    { status: InstitutionStatus.SUSPENDED, reviewedBy: req.auth.sub, reviewedAt: new Date() },
    { new: true },
  );
  if (!institution) throw AppError.notFound('Institution not found');
  res.json({ success: true, data: institution, requestId: req.requestId });
}

export async function listUsers(req: Request, res: Response) {
  const { page, pageSize, q } = paginationSchema.parse(req.query);
  const filter: Record<string, unknown> = {};
  if (q) filter.email = { $regex: q, $options: 'i' };

  const [items, total] = await Promise.all([
    UserModel.find(filter).skip((page - 1) * pageSize).limit(pageSize),
    UserModel.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId: req.requestId,
  });
}

export async function listCredentials(req: Request, res: Response) {
  const { page, pageSize } = paginationSchema.parse(req.query);
  const [items, total] = await Promise.all([
    CredentialModel.find().sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize),
    CredentialModel.countDocuments(),
  ]);
  res.json({
    success: true,
    data: { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId: req.requestId,
  });
}

export async function listFeedback(req: Request, res: Response) {
  const { page, pageSize } = paginationSchema.parse(req.query);
  const [items, total] = await Promise.all([
    FeedbackModel.find().sort({ createdAt: -1 }).skip((page - 1) * pageSize).limit(pageSize),
    FeedbackModel.countDocuments(),
  ]);
  res.json({
    success: true,
    data: { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId: req.requestId,
  });
}
