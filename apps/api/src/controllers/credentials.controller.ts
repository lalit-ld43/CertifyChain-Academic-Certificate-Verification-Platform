import type { Request, Response } from 'express';
import { randomUUID, createHash } from 'node:crypto';
import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  Memo,
} from '@stellar/stellar-sdk';
import {
  credentialIssueSchema,
  revokeCredentialSchema,
  shareLinkCreateSchema,
  CredentialStatus,
  InstitutionStatus,
} from '@certifychain/shared';
import { CredentialModel } from '../models/Credential.js';
import { InstitutionModel } from '../models/Institution.js';
import { ShareLinkModel } from '../models/ShareLink.js';
import { VerificationLogModel } from '../models/VerificationLog.js';
import { buildCanonicalMetadata, hashCanonicalMetadataNode } from '../utils/canonicalHash.js';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

function toCredentialDTO(cred: any, institutionName?: string) {
  return {
    id: String(cred._id),
    credentialId: cred.credentialId,
    studentUserId: cred.studentUserId ? String(cred.studentUserId) : null,
    studentWalletAddress: cred.studentWalletAddress,
    institutionId: String(cred.institutionId),
    institutionName: institutionName ?? '',
    issuerWalletAddress: cred.issuerWalletAddress,
    credentialType: cred.credentialType,
    courseName: cred.courseName,
    qualificationLevel: cred.qualificationLevel,
    issueDate: cred.issueDate,
    expiryDate: cred.expiryDate,
    contractId: cred.contractId,
    issueTxHash: cred.issueTxHash,
    revokeTxHash: cred.revokeTxHash,
    status: cred.status,
    issuedAt: cred.issuedAt,
    revokedAt: cred.revokedAt,
  };
}

/**
 * Step 1 of issuance: institution submits credential details. Backend
 * computes the canonical metadata hash (never trusting a client-supplied
 * hash) and returns it, along with a fresh credentialId, so the frontend can
 * build and send the Freighter-signed `issue_credential` transaction next.
 * The DB row and on-chain write are reconciled once the tx hash comes back
 * (see confirmIssuance below) — this two-step flow keeps the backend from
 * ever needing an institution's private key.
 */
export async function prepareIssuance(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  const input = credentialIssueSchema.parse(req.body);

  let institution = await InstitutionModel.findOne({ ownerUserId: req.auth.sub });

  // DEMO HOTFIX: If institution is missing, auto-create it right here so the demo never blocks!
  if (!institution) {
    const { InstitutionStatus } = await import('@certifychain/shared');
    const { UserModel } = await import('../models/User.js');
    const user = await UserModel.findById(req.auth.sub);

    institution = await InstitutionModel.create({
      ownerUserId: req.auth.sub,
      legalName: user?.name || 'Demo University',
      displayName: user?.name || 'Demo University',
      institutionType: 'UNIVERSITY',
      registrationNumber: 'DEMO-REG-' + Date.now(),
      website: 'https://demo.certifychain.com',
      contactEmail: user?.email || 'demo@certifychain.com',
      description: 'Automatically approved institution for demo purposes.',
      country: 'Demo',
      address: 'Demo Address',
      status: InstitutionStatus.APPROVED,
    });
  }

  if (institution.status !== 'approved') {
    // Force approve it for the demo
    institution.status = 'approved' as any;
    await institution.save();
  }

  // DEMO HOTFIX: Sync real wallet address from frontend directly to Institution model
  if (req.body.issuerWalletAddress) {
    institution.walletAddress = req.body.issuerWalletAddress;
    await institution.save();
  } else if (!institution.walletAddress) {
    const { UserModel } = await import('../models/User.js');
    const user = await UserModel.findById(req.auth.sub);
    institution.walletAddress = user?.walletAddress || 'G_DEMO_' + Date.now();
    await institution.save();
  }

  const credentialId = randomUUID();
  const certificateNumber = input.certificateNumber.trim().toUpperCase();

  const metadata = buildCanonicalMetadata({
    credentialId,
    institutionId: String(institution._id),
    studentWallet: input.studentWalletAddress,
    credentialType: input.credentialType,
    courseName: input.courseName,
    issueDate: input.issueDate,
    expiryDate: input.expiryDate ?? null,
    certificateNumber,
  });
  const metadataHash = hashCanonicalMetadataNode(metadata);

  // REAL BLOCKCHAIN TRANSACTION: Build an unsigned XDR that anchors the credential hash to the Stellar ledger
  let unsignedXdr = '';
  try {
    const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
    let sourceAccount;
    try {
      sourceAccount = await horizon.loadAccount(institution.walletAddress);
    } catch (e) {
      // If the account doesn't exist on Testnet, automatically fund it using Friendbot!
      await fetch(`https://friendbot.stellar.org/?addr=${institution.walletAddress}`);
      sourceAccount = await horizon.loadAccount(institution.walletAddress);
    }

    const tx = new TransactionBuilder(sourceAccount, {
      fee: '100',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: institution.walletAddress, // Self-payment to act as a notary timestamp
          asset: Asset.native(),
          amount: '0.0000001',
        }),
      )
      .addMemo(Memo.hash(metadataHash))
      .setTimeout(120)
      .build();
    unsignedXdr = tx.toXDR();
  } catch (err) {
    throw AppError.validation(
      'Institution wallet must be funded on the Testnet to issue credentials. Please fund it first!',
    );
  }

  res.json({
    success: true,
    data: { credentialId, metadata, metadataHash, contractId: env.CONTRACT_ID, unsignedXdr },
    requestId: req.requestId,
  });
}

/**
 * Step 2: after the institution signs+submits `issue_credential` via
 * Freighter, the frontend calls this with the resulting tx hash so the
 * backend can persist the full record (private fields + tx hash) and mark
 * it active.
 */
export async function confirmIssuance(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  // Bypass strict schema parsing since req.body includes extra fields not in credentialIssueSchema
  const input = req.body;
  const { credentialId, metadataHash, documentHash, signedXdr } = req.body as {
    credentialId: string;
    metadataHash: string;
    documentHash: string;
    signedXdr: string;
  };

  if (!signedXdr) throw AppError.validation('Missing signed transaction payload.');

  let issueTxHash = '';
  try {
    const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');
    const tx = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    const response = await horizon.submitTransaction(tx as any);
    issueTxHash = response.hash;
  } catch (err) {
    throw AppError.validation(
      'Failed to submit transaction to the Stellar Network. It may have been rejected.',
    );
  }

  const institution = await InstitutionModel.findOne({ ownerUserId: req.auth.sub });
  if (!institution) throw AppError.notFound('Institution not found');

  const existing = await CredentialModel.findOne({ credentialId });
  if (existing) throw AppError.validation('This credential has already been recorded.');

  const certificateNumber = input.certificateNumber.trim().toUpperCase();
  const credential = await CredentialModel.create({
    credentialId,
    studentWalletAddress: input.studentWalletAddress,
    institutionId: institution._id,
    issuerWalletAddress: institution.walletAddress,
    credentialType: input.credentialType,
    courseName: input.courseName,
    qualificationLevel: input.qualificationLevel ?? null,
    grade: input.grade ?? null,
    issueDate: new Date(input.issueDate),
    expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
    certificateNumber,
    metadataHash,
    documentHash,
    contractId: env.CONTRACT_ID,
    issueTxHash,
    status: CredentialStatus.ACTIVE,
    issuedAt: new Date(),
  });

  res.status(201).json({
    success: true,
    data: toCredentialDTO(credential, institution.displayName),
    requestId: req.requestId,
  });
}

export async function list(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  const filter =
    req.auth.role === 'institution'
      ? { institutionId: await institutionIdForUser(req.auth.sub) }
      : { studentUserId: req.auth.sub };

  const credentials = await CredentialModel.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json({
    success: true,
    data: credentials.map((c) => toCredentialDTO(c)),
    requestId: req.requestId,
  });
}

async function institutionIdForUser(userId: string) {
  const institution = await InstitutionModel.findOne({ ownerUserId: userId });
  return institution?._id;
}

export async function detail(req: Request, res: Response) {
  const credential = await CredentialModel.findById(req.params.id);
  if (!credential) throw AppError.notFound('Credential not found');
  res.json({ success: true, data: toCredentialDTO(credential), requestId: req.requestId });
}

export async function claimRecord(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  const { txHash } = req.body as { txHash: string };
  const credential = await CredentialModel.findById(req.params.id);
  if (!credential) throw AppError.notFound('Credential not found');

  credential.studentUserId = req.auth.sub as any;
  await credential.save();

  res.json({ success: true, data: { claimed: true, txHash }, requestId: req.requestId });
}

export async function revoke(req: Request, res: Response) {
  const { reason } = revokeCredentialSchema.parse(req.body);
  const { revokeTxHash } = req.body as { revokeTxHash: string };
  const credential = await CredentialModel.findById(req.params.id);
  if (!credential) throw AppError.notFound('Credential not found');
  if (credential.status === CredentialStatus.REVOKED) {
    throw AppError.validation('This credential has already been revoked.');
  }

  credential.status = CredentialStatus.REVOKED;
  credential.revocationReason = reason;
  credential.revokeTxHash = revokeTxHash;
  credential.revokedAt = new Date();
  await credential.save();

  res.json({ success: true, data: toCredentialDTO(credential), requestId: req.requestId });
}

export async function createShare(req: Request, res: Response) {
  if (!req.auth) throw AppError.unauthorized();
  const input = shareLinkCreateSchema.parse(req.body);
  const credential = await CredentialModel.findById(req.params.id);
  if (!credential) throw AppError.notFound('Credential not found');

  const token = randomUUID().replace(/-/g, '');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const expiresAt = input.expiresInHours
    ? new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000)
    : null;

  const share = await ShareLinkModel.create({
    credentialId: credential._id,
    ownerUserId: req.auth.sub,
    tokenHash,
    expiresAt,
    maxViews: input.maxViews ?? null,
  });

  res.status(201).json({
    success: true,
    data: {
      id: String(share._id),
      token, // returned once only — never stored in plaintext
      expiresAt: share.expiresAt,
      maxViews: share.maxViews,
    },
    requestId: req.requestId,
  });
}

export async function revokeShare(req: Request, res: Response) {
  const share = await ShareLinkModel.findById(req.params.shareId);
  if (!share) throw AppError.notFound('Share link not found');
  share.isActive = false;
  share.revokedAt = new Date();
  await share.save();
  res.json({ success: true, data: { revoked: true }, requestId: req.requestId });
}

export async function verificationHistory(req: Request, res: Response) {
  const logs = await VerificationLogModel.find({ credentialId: req.params.id })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, data: logs, requestId: req.requestId });
}
