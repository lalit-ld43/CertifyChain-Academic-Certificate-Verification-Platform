import type { PropsWithChildren, ReactNode } from 'react';

export function DashboardShell({
  title,
  actions,
  children,
}: PropsWithChildren<{ title: string; actions?: ReactNode }>) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-primary-900 dark:text-white">
          {title}
        </h1>
        {actions}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
