import type { CanonicalCredentialMetadata } from './types.js';

/**
 * Deterministically stringifies an object: keys sorted recursively,
 * so identical data always produces identical bytes before hashing.
 * Works the same in the browser and in Node 20+ (both expose
 * globalThis.crypto.subtle), so this file is imported unmodified by
 * apps/web and apps/api.
 */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((v) => stableStringify(v)).join(',')}]`;
  }
  const keys = Object.keys(value as Record<string, unknown>).sort();
  const entries = keys.map(
    (k) => `${JSON.stringify(k)}:${stableStringify((value as Record<string, unknown>)[k])}`,
  );
  return `{${entries.join(',')}}`;
}

/** Normalizes an ISO-ish date string to YYYY-MM-DD (UTC), or null. */
export function normalizeDate(input: string | null | undefined): string | null {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${input}`);
  return d.toISOString().slice(0, 10);
}

export function buildCanonicalMetadata(input: {
  credentialId: string;
  institutionId: string;
  studentWallet: string;
  credentialType: string;
  courseName: string;
  issueDate: string;
  expiryDate?: string | null;
  certificateNumber: string;
}): CanonicalCredentialMetadata {
  return {
    schemaVersion: '1.0',
    credentialId: input.credentialId.trim(),
    institutionId: input.institutionId.trim(),
    studentWallet: input.studentWallet.trim(),
    credentialType: input.credentialType as CanonicalCredentialMetadata['credentialType'],
    courseName: input.courseName.trim().replace(/\s+/g, ' '),
    issueDate: normalizeDate(input.issueDate) as string,
    expiryDate: normalizeDate(input.expiryDate ?? null),
    certificateNumber: input.certificateNumber.trim().toUpperCase(),
  };
}

/** SHA-256 over UTF-8 bytes of the deterministic serialization. Returns lowercase hex. */
export async function sha256Hex(data: string): Promise<string> {
  const bytes = new TextEncoder().encode(data);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashCanonicalMetadata(
  metadata: CanonicalCredentialMetadata,
): Promise<string> {
  return sha256Hex(stableStringify(metadata));
}

/** Hash raw file bytes (used when a verifier uploads a certificate file to compare). */
export async function sha256HexFromBytes(bytes: Uint8Array): Promise<string> {
  // Copy into a plain ArrayBuffer-backed view to satisfy the BufferSource type
  // regardless of the underlying buffer type (ArrayBuffer vs SharedArrayBuffer).
  const copy = new Uint8Array(bytes.length);
  copy.set(bytes);
  const digest = await crypto.subtle.digest('SHA-256', copy.buffer as ArrayBuffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
