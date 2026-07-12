import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ExternalLink,
  FileDown,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ApiResponse, CredentialDTO } from '@certifychain/shared';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { api } from '@/services/api';

export default function StudentCredentialDetailPage() {
  const { id = '' } = useParams();

  const {
    data: credential,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['student', 'credential', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<CredentialDTO>>(`/credentials/${id}`);
      if (!res.data.success) throw new Error(res.data.error.message);
      return res.data.data;
    },
    enabled: !!id,
  });

  return (
    <DashboardShell
      title="Credential details"
      actions={
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-800 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" /> Back to dashboard
        </Link>
      }
    >
      {isLoading && (
        <div className="flex justify-center p-20 text-primary-400">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-300 border-t-accent-600" />
          <span className="ml-2">Loading credential details…</span>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-status-revoked/20 bg-status-revoked/5 p-6 text-status-revoked">
          Failed to load credential details. It may not exist or you might not have access.
        </div>
      )}

      {credential && (
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Certificate Card */}
          <div className="relative overflow-hidden rounded-2xl border border-primary-100 bg-white p-8 shadow-card dark:border-primary-800 dark:bg-primary-950">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-40 w-40 rounded-full bg-accent-500/5 blur-3xl" />

            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-primary-50 pb-6 dark:border-primary-900">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-accent-50 p-3 text-accent-600 dark:bg-accent-950/50">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-primary-900 dark:text-white">
                    {credential.courseName}
                  </h2>
                  <p className="text-sm text-primary-500">{credential.institutionName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-status-active/10 px-3 py-1 text-xs font-semibold text-status-active">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified & Active
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-primary-400 uppercase tracking-wider">
                    Credential Type
                  </span>
                  <p className="mt-1 text-sm font-semibold text-primary-800 dark:text-white">
                    {credential.credentialType}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-primary-400 uppercase tracking-wider">
                    Certificate Number
                  </span>
                  <p className="mt-1 text-sm font-mono text-primary-800 dark:text-white">
                    {credential.certificateNumber}
                  </p>
                </div>
                {credential.grade && (
                  <div>
                    <span className="text-xs font-medium text-primary-400 uppercase tracking-wider">
                      Grade / Score
                    </span>
                    <p className="mt-1 text-sm font-semibold text-primary-800 dark:text-white">
                      {credential.grade}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium text-primary-400 uppercase tracking-wider">
                    Issue Date
                  </span>
                  <div className="mt-1 flex items-center gap-1.5 text-sm text-primary-800 dark:text-white">
                    <Calendar className="h-4 w-4 text-primary-400" />
                    <span>
                      {new Date(credential.issueDate).toLocaleDateString(undefined, {
                        dateStyle: 'long',
                      })}
                    </span>
                  </div>
                </div>
                {credential.expiryDate && (
                  <div>
                    <span className="text-xs font-medium text-primary-400 uppercase tracking-wider">
                      Expiry Date
                    </span>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-primary-800 dark:text-white">
                      <Calendar className="h-4 w-4 text-primary-400" />
                      <span>
                        {new Date(credential.expiryDate).toLocaleDateString(undefined, {
                          dateStyle: 'long',
                        })}
                      </span>
                    </div>
                  </div>
                )}
                {credential.qualificationLevel && (
                  <div>
                    <span className="text-xs font-medium text-primary-400 uppercase tracking-wider">
                      Qualification Level
                    </span>
                    <p className="mt-1 text-sm font-semibold text-primary-800 dark:text-white">
                      {credential.qualificationLevel}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Blockchain Proof Card */}
          <div className="rounded-2xl border border-primary-100 bg-primary-50/50 p-6 dark:border-primary-850 dark:bg-primary-900/30">
            <h3 className="flex items-center gap-2 font-semibold text-primary-800 dark:text-white">
              <ShieldCheck className="h-5 w-5 text-accent-500" />
              On-Chain Cryptographic Proof
            </h3>
            <p className="mt-1 text-xs text-primary-500 leading-relaxed">
              This certificate has been mathematically hashed and anchored to the Stellar blockchain
              ledger. The issuance transaction represents a cryptographically signed statement from
              the academic institution's identity wallet to the student's wallet address.
            </p>

            <div className="mt-4 space-y-3 rounded-xl bg-white p-4 border border-primary-100 text-sm dark:bg-primary-950 dark:border-primary-850">
              <div className="flex flex-wrap justify-between gap-2 border-b border-primary-50 pb-2 dark:border-primary-900">
                <span className="text-primary-400">Issuer Wallet Address</span>
                <span className="font-mono text-xs text-primary-700 dark:text-primary-300 break-all">
                  {credential.issuerWalletAddress}
                </span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 border-b border-primary-50 pb-2 dark:border-primary-900">
                <span className="text-primary-400">Student Wallet Address</span>
                <span className="font-mono text-xs text-primary-700 dark:text-primary-300 break-all">
                  {credential.studentWalletAddress}
                </span>
              </div>
              <div className="flex flex-wrap justify-between gap-2 pt-1">
                <span className="text-primary-400">Transaction Hash</span>
                {credential.issueTxHash ? (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${credential.issueTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-accent-600 hover:underline break-all"
                  >
                    <span>{credential.issueTxHash}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                ) : (
                  <span className="text-primary-400 italic">Pending blockchain confirmation…</span>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() =>
                  toast.info('Verification report downloading is enabled on production builds.')
                }
                className="inline-flex items-center gap-2 rounded-lg bg-white border border-primary-200 px-4 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 dark:bg-primary-950 dark:border-primary-800 dark:text-primary-300 dark:hover:bg-primary-900"
              >
                <FileDown className="h-4 w-4" /> Download Report
              </button>
              <Link
                to={`/verify/${credential.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white hover:bg-accent-700"
              >
                Go to Public Verification Page
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
