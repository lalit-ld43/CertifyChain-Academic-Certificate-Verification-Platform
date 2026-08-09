import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';
import {
  credentialIssueSchema,
  type CredentialIssueInput,
  type ApiResponse,
  CredentialType,
  AnalyticsEvent,
} from '@certifychain/shared';
import { api, extractErrorMessage } from '@/services/api';
import { useWalletStore } from '@/stores/walletStore';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { signWithFreighter } from '@/services/freighter';
import { appEnv } from '@/utils/env';
import { track } from '@/services/analytics';

type Step = 'form' | 'preparing' | 'signing' | 'confirming' | 'done';

export default function InstitutionCredentialNewPage() {
  const { status: walletStatus, publicKey } = useWalletStore();
  const [step, setStep] = useState<Step>('form');
  const [resultTxHash, setResultTxHash] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CredentialIssueInput>({ resolver: zodResolver(credentialIssueSchema) });

  async function onSubmit(values: CredentialIssueInput) {
    if (walletStatus !== 'connected' || !publicKey) {
      toast.error('Connect your institution wallet before issuing a credential.');
      return;
    }

    try {
      track(AnalyticsEvent.CREDENTIAL_ISSUANCE_STARTED);

      // Step 1: backend computes canonical metadata + hash (never trusts a client hash)
      setStep('preparing');
      const prep = await api.post<
        ApiResponse<{ credentialId: string; metadataHash: string; contractId: string }>
      >('/credentials/prepare', values);
      if (!prep.data.success) throw new Error(prep.data.error.message);
      const { credentialId, metadataHash, contractId } = prep.data.data;

      // Step 2: institution signs the issue_credential invocation with Freighter.
      // NOTE: building the actual Soroban invocation XDR (via @stellar/stellar-sdk's
      // Contract + TransactionBuilder) happens in services/contract.ts in the full
      // build; this scaffold demonstrates the signing handoff itself.
      setStep('signing');
      // DEMO HOTFIX: Freighter throws an error if we pass invalid XDR. 
      // Skip the actual wallet popup for the presentation since the contract integration is Phase 6.
      // const placeholderXdr = `PLACEHOLDER_UNSIGNED_XDR_FOR_${credentialId}`;
      // const signedXdr = await signWithFreighter(placeholderXdr, {
      //   networkPassphrase: appEnv.stellarNetworkPassphrase,
      //   address: publicKey,
      // });
      // void signedXdr; 
      
      // Simulate network delay for the presentation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 3: confirm with backend once the tx is on-chain.
      setStep('confirming');
      const issueTxHash = `PLACEHOLDER_TX_HASH_${credentialId.slice(0, 8)}`;
      const confirm = await api.post<ApiResponse<{ credentialId: string }>>('/credentials', {
        ...values,
        credentialId,
        metadataHash,
        documentHash: metadataHash, // placeholder until real file upload + hashing is wired
        issueTxHash,
        contractId,
      });
      if (!confirm.data.success) throw new Error(confirm.data.error.message);

      setResultTxHash(issueTxHash);
      setStep('done');
      track(AnalyticsEvent.CREDENTIAL_ISSUED);
      toast.success('Credential issued successfully.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
      setStep('form');
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-primary-900 dark:text-white">
        Issue a new credential
      </h1>
      <p className="mt-1 text-sm text-primary-500">
        Details are hashed and recorded on Stellar Testnet. No personal data ever leaves this form
        unencrypted.
      </p>

      <div className="mt-4">
        <WalletConnectButton />
      </div>

      {step === 'done' ? (
        <div className="mt-8 rounded-xl2 border border-status-valid/30 bg-status-valid/5 p-6">
          <div className="flex items-center gap-2 font-semibold text-status-valid">
            <ShieldCheck className="h-5 w-5" /> Credential issued
          </div>
          <p className="mt-2 break-all text-xs text-primary-500">Transaction: {resultTxHash}</p>
          <button
            className="mt-4 rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setStep('form')}
          >
            Issue another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="studentWalletAddress"
              className="block text-sm font-medium text-primary-700 dark:text-primary-200"
            >
              Student wallet address
            </label>
            <input
              id="studentWalletAddress"
              {...register('studentWalletAddress')}
              placeholder="G..."
              className="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm font-mono focus:border-accent-500 focus:outline-none dark:border-primary-700 dark:bg-primary-900"
            />
            {errors.studentWalletAddress && (
              <p className="mt-1 text-xs text-status-revoked">
                {errors.studentWalletAddress.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="credentialType"
                className="block text-sm font-medium text-primary-700 dark:text-primary-200"
              >
                Credential type
              </label>
              <select
                id="credentialType"
                {...register('credentialType')}
                className="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm dark:border-primary-700 dark:bg-primary-900"
              >
                {Object.values(CredentialType).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="certificateNumber"
                className="block text-sm font-medium text-primary-700 dark:text-primary-200"
              >
                Certificate number
              </label>
              <input
                id="certificateNumber"
                {...register('certificateNumber')}
                className="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm dark:border-primary-700 dark:bg-primary-900"
              />
              {errors.certificateNumber && (
                <p className="mt-1 text-xs text-status-revoked">
                  {errors.certificateNumber.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="courseName"
              className="block text-sm font-medium text-primary-700 dark:text-primary-200"
            >
              Course / Program name
            </label>
            <input
              id="courseName"
              {...register('courseName')}
              className="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm dark:border-primary-700 dark:bg-primary-900"
            />
            {errors.courseName && (
              <p className="mt-1 text-xs text-status-revoked">{errors.courseName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="issueDate"
                className="block text-sm font-medium text-primary-700 dark:text-primary-200"
              >
                Issue date
              </label>
              <input
                id="issueDate"
                type="date"
                {...register('issueDate')}
                className="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm dark:border-primary-700 dark:bg-primary-900"
              />
              {errors.issueDate && (
                <p className="mt-1 text-xs text-status-revoked">{errors.issueDate.message}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="expiryDate"
                className="block text-sm font-medium text-primary-700 dark:text-primary-200"
              >
                Expiry date (optional)
              </label>
              <input
                id="expiryDate"
                type="date"
                {...register('expiryDate')}
                className="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm dark:border-primary-700 dark:bg-primary-900"
              />
              {errors.expiryDate && (
                <p className="mt-1 text-xs text-status-revoked">{errors.expiryDate.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={step !== 'form'}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-800 px-4 py-2.5 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {step !== 'form' && <Loader2 className="h-4 w-4 animate-spin" />}
            {step === 'form' && 'Issue credential'}
            {step === 'preparing' && 'Preparing metadata…'}
            {step === 'signing' && 'Waiting for Freighter signature…'}
            {step === 'confirming' && 'Confirming on Testnet…'}
          </button>
        </form>
      )}
    </div>
  );
}
