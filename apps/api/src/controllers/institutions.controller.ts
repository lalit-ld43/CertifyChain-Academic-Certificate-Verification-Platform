import type { Request, Response } from 'express';
import { institutionApplicationSchema, paginationSchema, InstitutionStatus } from '@certifychain/shared';
import { InstitutionModel } from '../models/Institution.js';
import { AppError } from '../utils/AppError.js';

function toInstitutionDTO(inst: any) {
  return {
    id: String(inst._id),
    ownerUserId: String(inst.ownerUserId),
    legalName: inst.legalName,
    displayName: inst.displayName,
    institutionType: inst.institutionType,
    website: inst.website,
    contactEmail: inst.contactEmail,
    description: inst.description,
    logoUrl: inst.logoUrl,
    country: inst.country,
    walletAddress: inst.walletAddress,
    status: inst.status,
    rejectionReason: inst.rejectionReason,
    createdAt: inst.createdAt,
  };
}

export async function apply(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  const input = institutionApplicationSchema.parse(req.body);

  const existing = await InstitutionModel.findOne({ ownerUserId: req.auth.sub });
  if (existing) throw AppError.validation('You have already submitted an institution application.');

  const institution = await InstitutionModel.create({ ...input, ownerUserId: req.auth.sub });
  res.status(201).json({ success: true, data: toInstitutionDTO(institution), requestId: req.requestId });
}

export async function me(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  const institution = await InstitutionModel.findOne({ ownerUserId: req.auth.sub });
  if (!institution) throw AppError.notFound('No institution application found for this account');
  res.json({ success: true, data: toInstitutionDTO(institution), requestId: req.requestId });
}

export async function updateMe(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  const institution = await InstitutionModel.findOneAndUpdate(
    { ownerUserId: req.auth.sub },
    { $set: req.body },
    { new: true },
  );
  if (!institution) throw AppError.notFound('Institution not found');
  res.json({ success: true, data: toInstitutionDTO(institution), requestId: req.requestId });
}

export async function publicList(req: Request, res: Response) {
  const { page, pageSize } = paginationSchema.parse(req.query);
  const filter = { status: InstitutionStatus.APPROVED };
  const [items, total] = await Promise.all([
    InstitutionModel.find(filter)
      .select('displayName institutionType country logoUrl website description')
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    InstitutionModel.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: { items, page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    requestId: req.requestId,
  });
}

export async function publicDetail(req: Request, res: Response) {
  const institution = await InstitutionModel.findOne({
    _id: req.params.id,
    status: InstitutionStatus.APPROVED,
  }).select('displayName institutionType country logoUrl website description');
  if (!institution) throw AppError.notFound('Institution not found');
  res.json({ success: true, data: institution, requestId: req.requestId });
}
