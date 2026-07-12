import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { PlusCircle, FileText, Activity } from 'lucide-react';

export default function InstitutionDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-primary-900 dark:text-white">
            Welcome, {user?.name || 'Institution'}
          </h1>
          <p className="mt-1 text-sm text-primary-500">
            Manage your academic credentials and monitor verifications.
          </p>
        </div>
        <Link
          to="/institution/credentials/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-700"
        >
          <PlusCircle className="size-4" />
          Issue New Credential
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-primary-200 bg-white p-6 shadow-sm dark:border-primary-800 dark:bg-primary-900">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
              <FileText className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-500">Total Issued</p>
              <p className="text-2xl font-bold text-primary-900 dark:text-white">--</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-primary-200 bg-white p-6 shadow-sm dark:border-primary-800 dark:bg-primary-900">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Activity className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary-500">Total Verifications</p>
              <p className="text-2xl font-bold text-primary-900 dark:text-white">--</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-primary-200 bg-white p-8 text-center shadow-sm dark:border-primary-800 dark:bg-primary-900">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-800">
          <FileText className="size-8 text-primary-400" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-primary-900 dark:text-white">
          No credentials issued yet
        </h3>
        <p className="mt-2 text-sm text-primary-500">
          Get started by issuing your first verifiable academic credential on the Stellar network.
        </p>
        <Link
          to="/institution/credentials/new"
          className="mt-6 inline-flex items-center gap-2 font-medium text-accent-600 hover:text-accent-700"
        >
          Issue a credential <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
