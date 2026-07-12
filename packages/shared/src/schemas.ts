import { z } from 'zod';
import { CredentialType, UserRole } from './enums.js';

/** Stellar/Soroban public keys (G...) — 56 chars, base32, starts with G */
export const stellarAddressSchema = z
  .string()
  .regex(/^G[A-Z2-7]{55}$/, 'Must be a valid Stellar public address (starts with G)');

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address');

export const passwordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .regex(/[A-Z]/, 'Include at least one uppercase letter')
  .regex(/[0-9]/, 'Include at least one number');

export const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    email: emailSchema,
    password: passwordSchema,
    role: z.enum([UserRole.STUDENT, UserRole.INSTITUTION, UserRole.RECRUITER]),
  })
  .strict();
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z
  .object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  })
  .strict();
export type LoginInput = z.infer<typeof loginSchema>;

export const walletChallengeRequestSchema = z
  .object({
    walletAddress: stellarAddressSchema,
  })
  .strict();

export const walletVerifyRequestSchema = z
  .object({
    walletAddress: stellarAddressSchema,
    nonce: z.string().min(16),
    signedTransactionXdr: z.string().min(1, 'Signed transaction is required'),
  })
  .strict();

export const institutionApplicationSchema = z
  .object({
    legalName: z.string().trim().min(2).max(200),
    displayName: z.string().trim().min(2).max(120),
    institutionType: z.enum(['university', 'college', 'training_provider', 'bootcamp', 'other']),
    registrationNumber: z.string().trim().min(2).max(100),
    website: z.string().url('Enter a valid URL'),
    contactEmail: emailSchema,
    description: z.string().trim().min(30).max(2000),
    country: z.string().trim().min(2).max(100),
    address: z.string().trim().min(5).max(300),
  })
  .strict();
export type InstitutionApplicationInput = z.infer<typeof institutionApplicationSchema>;

const dateStringSchema = z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Invalid date');

export const credentialIssueSchema = z
  .object({
    studentWalletAddress: stellarAddressSchema,
    studentEmail: emailSchema.optional(),
    credentialType: z.enum([
      CredentialType.DEGREE,
      CredentialType.DIPLOMA,
      CredentialType.CERTIFICATE,
      CredentialType.TRANSCRIPT,
      CredentialType.MICROCREDENTIAL,
    ]),
    courseName: z.string().trim().min(2).max(200),
    qualificationLevel: z.string().trim().max(100).optional(),
    grade: z.string().trim().max(50).optional(),
    issueDate: dateStringSchema,
    expiryDate: dateStringSchema.nullable().optional(),
    certificateNumber: z.string().trim().min(2).max(100),
    issuerWalletAddress: stellarAddressSchema.optional(),
  })
  .strict()
  .refine((data) => !data.expiryDate || new Date(data.expiryDate) > new Date(data.issueDate), {
    message: 'Expiry date must be after issue date',
    path: ['expiryDate'],
  });
export type CredentialIssueInput = z.infer<typeof credentialIssueSchema>;

export const shareLinkCreateSchema = z
  .object({
    expiresInHours: z
      .number()
      .int()
      .min(1)
      .max(24 * 90)
      .optional(),
    maxViews: z.number().int().min(1).max(10000).optional(),
  })
  .strict();

export const revokeCredentialSchema = z
  .object({
    reason: z.string().trim().min(5).max(500),
  })
  .strict();

export const feedbackSchema = z
  .object({
    role: z.enum([
      UserRole.STUDENT,
      UserRole.INSTITUTION,
      UserRole.RECRUITER,
      UserRole.ADMIN,
      'guest',
    ]),
    rating: z.number().int().min(1).max(5),
    usabilityRating: z.number().int().min(1).max(5),
    trustRating: z.number().int().min(1).max(5),
    message: z.string().trim().min(5).max(2000),
    improvementSuggestion: z.string().trim().max(2000).optional(),
    consentToPublish: z.boolean(),
  })
  .strict();
export type FeedbackInput = z.infer<typeof feedbackSchema>;

export const paginationSchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().max(200).optional(),
  })
  .strict();

export const fileHashCompareSchema = z.object({
  credentialId: z.string().uuid(),
});
