import clsx from 'clsx';
import { CheckCircle2, XCircle, Clock, HelpCircle, ShieldAlert } from 'lucide-react';
import type { VerificationResult } from '@certifychain/shared';

const config: Record<VerificationResult, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
  valid: { label: 'Valid', className: 'status-badge-valid', Icon: CheckCircle2 },
  revoked: { label: 'Revoked', className: 'status-badge-revoked', Icon: XCircle },
  expired: { label: 'Expired', className: 'status-badge-expired', Icon: Clock },
  invalid: { label: 'Invalid', className: 'status-badge-revoked', Icon: ShieldAlert },
  not_found: { label: 'Not Found', className: 'status-badge-pending', Icon: HelpCircle },
};

export function StatusBadge({ result }: { result: VerificationResult }) {
  const { label, className, Icon } = config[result];
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold',
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </span>
  );
}
