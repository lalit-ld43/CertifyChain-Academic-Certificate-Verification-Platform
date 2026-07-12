import type { Request, Response } from 'express';
import { createHash } from 'node:crypto';
import multer from 'multer';
import {
  VerificationMethod,
  VerificationResult,
  CredentialStatus,
  MAX_UPLOAD_BYTES,
  ALLOWED_UPLOAD_MIME_TYPES,
} from '@certifychain/shared';
import { CredentialModel } from '../models/Credential.js';
import { InstitutionModel } from '../models/Institution.js';
import { ShareLinkModel } from '../models/ShareLink.js';
import { VerificationLogModel } from '../models/VerificationLog.js';
import { hashIp, summarizeUserAgent } from '../utils/sanitize.js';
import { AppError } from '../utils/AppError.js';

export const uploadMiddleware = multer({
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!(ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
      return cb(new Error('UNSUPPORTED_FILE_TYPE'));
    }
    cb(null, true);
  },
});

function deriveResult(credential: any): VerificationResult {
  if (credential.status === CredentialStatus.REVOKED) return VerificationResult.REVOKED;
  if (credential.expiryDate && new Date(credential.expiryDate) < new Date()) {
    return VerificationResult.EXPIRED;
  }
  return VerificationResult.VALID;
}

async function logVerification(
  req: Request,
  credentialDocId: string | null,
  result: VerificationResult,
  method: VerificationMethod,
) {
  await VerificationLogModel.create({
    credentialId: credentialDocId,
    verifierUserId: req.auth?.sub ?? null,
    result,
    method,
    verifierIpHash: req.ip ? hashIp(req.ip) : null,
    userAgentSummary: summarizeUserAgent(req.header('user-agent')),
  });
}

export async function verifyByCredentialId(req: Request, res: Response) {
  const { Types } = await import('mongoose');
  let credential = await CredentialModel.findOne({ credentialId: req.params.credentialId });
  if (!credential && Types.ObjectId.isValid(req.params.credentialId)) {
    credential = await CredentialModel.findById(req.params.credentialId);
  }

  if (!credential) {
    await logVerification(req, null, VerificationResult.NOT_FOUND, VerificationMethod.ID);
    return res.json({
      success: true,
      data: { result: VerificationResult.NOT_FOUND, credential: null, checkedAt: new Date() },
      requestId: req.requestId,
    });
  }

  const institution = await InstitutionModel.findById(credential.institutionId).select(
    'displayName',
  );
  const result = deriveResult(credential);
  await logVerification(req, String(credential._id), result, VerificationMethod.ID);

  res.json({
    success: true,
    data: {
      result,
      credential: {
        credentialId: credential.credentialId,
        institutionName: institution?.displayName ?? 'Unknown institution',
        credentialType: credential.credentialType,
        issueDate: credential.issueDate,
        expiryDate: credential.expiryDate,
        status: credential.status,
        courseName: credential.courseName,
      },
      checkedAt: new Date(),
      method: VerificationMethod.ID,
    },
    requestId: req.requestId,
  });
}

export async function verifyByShareToken(req: Request, res: Response) {
  const tokenHash = createHash('sha256')
    .update(req.params.token ?? '')
    .digest('hex');
  const share = await ShareLinkModel.findOne({ tokenHash });
  if (!share || !share.isActive) {
    throw new AppError('SHARE_LINK_INACTIVE' as any, 'This share link is no longer active', 410);
  }
  if (share.expiresAt && share.expiresAt < new Date()) {
    throw new AppError('SHARE_LINK_EXPIRED' as any, 'This share link has expired', 410);
  }
  if (share.maxViews && share.viewCount >= share.maxViews) {
    throw new AppError(
      'SHARE_LINK_EXPIRED' as any,
      'This share link has reached its view limit',
      410,
    );
  }

  share.viewCount += 1;
  await share.save();

  const credential = await CredentialModel.findById(share.credentialId);
  if (!credential) throw AppError.notFound('Credential not found');
  const institution = await InstitutionModel.findById(credential.institutionId).select(
    'displayName',
  );
  const result = deriveResult(credential);
  await logVerification(req, String(credential._id), result, VerificationMethod.LINK);

  res.json({
    success: true,
    data: {
      result,
      credential: {
        credentialId: credential.credentialId,
        institutionName: institution?.displayName ?? 'Unknown institution',
        credentialType: credential.credentialType,
        issueDate: credential.issueDate,
        expiryDate: credential.expiryDate,
        status: credential.status,
        courseName: credential.courseName,
      },
      checkedAt: new Date(),
      method: VerificationMethod.LINK,
    },
    requestId: req.requestId,
  });
}

export async function verifyByFile(req: Request, res: Response) {
  const { credentialId } = req.body as { credentialId: string };
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) throw AppError.validation('A certificate file is required.');

  const documentHash = createHash('sha256').update(file.buffer).digest('hex');
  const credential = await CredentialModel.findOne({ credentialId });

  if (!credential) {
    await logVerification(req, null, VerificationResult.NOT_FOUND, VerificationMethod.FILE_HASH);
    return res.json({
      success: true,
      data: { result: VerificationResult.NOT_FOUND, credential: null, checkedAt: new Date() },
      requestId: req.requestId,
    });
  }

  const hashMatched = credential.documentHash === documentHash;
  const baseResult = deriveResult(credential);
  const result = hashMatched ? baseResult : VerificationResult.INVALID;
  await logVerification(req, String(credential._id), result, VerificationMethod.FILE_HASH);

  res.json({
    success: true,
    data: {
      result,
      hashMatched,
      credential: {
        credentialId: credential.credentialId,
        credentialType: credential.credentialType,
        issueDate: credential.issueDate,
        status: credential.status,
      },
      checkedAt: new Date(),
      method: VerificationMethod.FILE_HASH,
    },
    requestId: req.requestId,
  });
}
