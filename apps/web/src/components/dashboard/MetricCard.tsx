import type { LucideIcon } from 'lucide-react';

export function MetricCard({
  label,
  value,
  Icon,
  loading,
}: {
  label: string;
  value: string | number;
  Icon: LucideIcon;
  loading?: boolean;
}) {
  return (
    <div className="rounded-xl2 border border-primary-100 p-5 shadow-card dark:border-primary-800">
      <div className="flex items-center justify-between">
        <span className="text-sm text-primary-500">{label}</span>
        <Icon className="h-4 w-4 text-accent-500" />
      </div>
      <div className="mt-2 text-2xl font-bold text-primary-900 dark:text-white">
        {loading ? <span className="inline-block h-6 w-12 animate-pulse rounded bg-primary-100 dark:bg-primary-800" /> : value}
      </div>
    </div>
  );
}
