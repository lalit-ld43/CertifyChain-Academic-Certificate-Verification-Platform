import { createHash } from 'node:crypto';

/** Hash an IP address before storing it (spec: avoid storing raw IPs). */
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

/** Reduce a user-agent string to a coarse, non-fingerprinting summary. */
export function summarizeUserAgent(ua: string | undefined): string | null {
  if (!ua) return null;
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet/i.test(ua)) return 'tablet';
  return 'desktop';
}

export function toUserDTO(user: any) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    walletAddress: user.walletAddress,
    walletVerifiedAt: user.walletVerifiedAt,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}
