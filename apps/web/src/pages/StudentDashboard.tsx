import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Eye, Activity, Wallet } from 'lucide-react';
import type { ApiResponse, CredentialDTO } from '@certifychain/shared';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { api } from '@/services/api';

export default function StudentDashboardPage() {
  const { data: credentials, isLoading } = useQuery({
    queryKey: ['student', 'credentials'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CredentialDTO[]>>('/credentials');
      if (!res.data.success) throw new Error(res.data.error.message);
      return res.data.data;
    },
  });

  const total = credentials?.length ?? 0;
  const active = credentials?.filter((c) => c.status === 'active').length ?? 0;
  const claimed = credentials?.filter((c) => !!c.studentUserId).length ?? 0;

  return (
    <DashboardShell title="Your credentials" actions={<WalletConnectButton />}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total credentials" value={total} Icon={Award} loading={isLoading} />
        <MetricCard label="Active" value={active} Icon={CheckCircle2} loading={isLoading} />
        <MetricCard label="Claimed" value={claimed} Icon={Wallet} loading={isLoading} />
        <MetricCard label="Share views" value={0} Icon={Eye} loading={isLoading} />
      </div>

      <div className="mt-8 rounded-xl2 border border-primary-100 dark:border-primary-800">
        <div className="border-b border-primary-100 p-4 font-semibold text-primary-800 dark:border-primary-800 dark:text-white">
          Recent credentials
        </div>
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-primary-50 dark:bg-primary-900" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-primary-500">
            <Activity className="h-8 w-8 text-primary-300" />
            No credentials yet. Once an institution issues one to your wallet, it will appear here.
          </div>
        ) : (
          <ul className="divide-y divide-primary-100 dark:divide-primary-800">
            {credentials!.map((c) => (
              <li key={c.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="font-medium text-primary-800 dark:text-white">{c.courseName}</div>
                  <div className="text-xs text-primary-400">{c.institutionName}</div>
                </div>
                <Link
                  to={`/student/credentials/${c.id}`}
                  className="text-sm font-medium text-accent-600 hover:underline"
                >
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
}
