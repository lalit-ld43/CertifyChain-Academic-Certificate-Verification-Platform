import { createHash } from 'node:crypto';
import { stableStringify, buildCanonicalMetadata } from '@certifychain/shared';
import type { CanonicalCredentialMetadata } from '@certifychain/shared';

/** Node-side SHA-256 (mirrors packages/shared/hashing.ts's Web Crypto version). */
export function sha256HexNode(data: string): string {
  return createHash('sha256').update(data, 'utf8').digest('hex');
}

export function hashCanonicalMetadataNode(metadata: CanonicalCredentialMetadata): string {
  return sha256HexNode(stableStringify(metadata));
}

export { buildCanonicalMetadata };
