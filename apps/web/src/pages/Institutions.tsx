import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Globe, Key, Building2 } from 'lucide-react';
import type { ApiResponse } from '@certifychain/shared';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { api } from '@/services/api';

interface Institution {
  id: string;
  legalName: string;
  displayName: string;
  website: string;
  walletAddress: string;
  status: string;
}

export default function InstitutionsPage() {
  const { data: response, isLoading } = useQuery({
    queryKey: ['institutions'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ items: Institution[] }>>(
        '/institutions?page=1&pageSize=100',
      );
      if (!res.data.success) throw new Error(res.data.error.message);
      return res.data.data;
    },
  });

  const institutions = response?.items ?? [];

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-accent-600" />
          <h1 className="mt-4 font-display text-3xl font-bold text-primary-900 dark:text-white sm:text-4xl">
            Registered institutions
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-primary-500">
            These institutions are verified and authorized to issue credentials on the CertifyChain
            platform.
          </p>
        </div>

        {isLoading ? (
          <div className="mt-12 flex justify-center text-primary-400">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-300 border-t-accent-600" />
            <span className="ml-2">Loading institutions…</span>
          </div>
        ) : institutions.length === 0 ? (
          <div className="mt-12 text-center text-primary-400">
            No registered institutions found.
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {institutions.map((inst) => (
              <div
                key={inst.id}
                className="relative overflow-hidden rounded-2xl border border-primary-100 bg-white p-6 shadow-card hover:shadow-md transition-shadow dark:border-primary-800 dark:bg-primary-950"
              >
                <div className="absolute right-0 top-0 -mr-8 -mt-8 h-20 w-20 rounded-full bg-accent-500/5 blur-xl" />

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-semibold text-primary-900 dark:text-white">
                    {inst.displayName}
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-status-active/10 px-2.5 py-0.5 text-2xs font-semibold text-status-active">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                </div>

                <p className="mt-1 text-xs text-primary-400 font-mono break-all">
                  {inst.legalName}
                </p>

                <div className="mt-6 space-y-3 border-t border-primary-50 pt-4 text-sm dark:border-primary-900">
                  <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                    <Globe className="h-4 w-4 shrink-0 text-primary-400" />
                    {inst.website ? (
                      <a
                        href={
                          inst.website.startsWith('http') ? inst.website : `https://${inst.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-xs"
                      >
                        {inst.website}
                      </a>
                    ) : (
                      <span className="text-xs text-primary-400 italic">No website specified</span>
                    )}
                  </div>

                  <div className="flex items-start gap-2 text-primary-600 dark:text-primary-400">
                    <Key className="h-4 w-4 shrink-0 mt-0.5 text-primary-400" />
                    <div className="min-w-0 flex-1">
                      <span className="text-2xs font-medium text-primary-400 uppercase tracking-wider block">
                        Issuing Authority Wallet
                      </span>
                      <span className="font-mono text-2xs break-all text-primary-700 dark:text-primary-300 block mt-0.5">
                        {inst.walletAddress || 'No wallet linked'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
