import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Upload, Loader2, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import type { ApiResponse, VerificationResultDTO } from '@certifychain/shared';
import { AnalyticsEvent } from '@certifychain/shared';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { StatusBadge } from '@/components/verification/StatusBadge';
import { api, extractErrorMessage } from '@/services/api';
import { track } from '@/services/analytics';

export default function VerifyCredentialPage() {
  const { credentialId = '' } = useParams();
  const [fileComparing, setFileComparing] = useState(false);
  const [fileResult, setFileResult] = useState<VerificationResultDTO | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['verify', credentialId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<VerificationResultDTO>>(`/verify/${credentialId}`);
      if (!res.data.success) throw new Error(res.data.error.message);
      track(AnalyticsEvent.CREDENTIAL_VERIFIED, { method: 'id' });
      return res.data.data;
    },
    enabled: !!credentialId,
    retry: false,
  });

  const handleFileUpload = useCallback(
    async (file: File) => {
      setFileComparing(true);
      setFileResult(null);
      try {
        const form = new FormData();
        form.append('file', file);
        form.append('credentialId', credentialId);
        const res = await api.post<ApiResponse<VerificationResultDTO>>('/verify/file', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (!res.data.success) throw new Error(res.data.error.message);
        setFileResult(res.data.data);
        track(AnalyticsEvent.CERTIFICATE_FILE_COMPARED);
      } catch (err) {
        toast.error(extractErrorMessage(err));
      } finally {
        setFileComparing(false);
      }
    },
    [credentialId],
  );

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-primary-900 dark:text-white">
          Verification result
        </h1>
        <p className="mt-1 break-all text-xs text-primary-400">Credential ID: {credentialId}</p>

        {isLoading && (
          <div className="mt-8 flex items-center gap-2 rounded-xl2 border border-primary-100 p-6 text-primary-500 dark:border-primary-800">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking the registry…
          </div>
        )}

        {isError && (
          <div className="mt-8 rounded-xl2 border border-status-revoked/30 bg-status-revoked/5 p-6 text-status-revoked">
            {extractErrorMessage(error)}
          </div>
        )}

        {data && (
          <div className="mt-8 rounded-xl2 border border-primary-100 p-6 shadow-card dark:border-primary-800">
            <StatusBadge result={data.result} />
            {data.credential ? (
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <dt className="text-primary-400">Institution</dt>
                <dd className="font-medium text-primary-800 dark:text-white">
                  {data.credential.institutionName}
                </dd>
                <dt className="text-primary-400">Credential type</dt>
                <dd className="font-medium text-primary-800 dark:text-white">
                  {data.credential.credentialType}
                </dd>
                <dt className="text-primary-400">Course / Program</dt>
                <dd className="font-medium text-primary-800 dark:text-white">
                  {data.credential.courseName}
                </dd>
                <dt className="text-primary-400">Issue date</dt>
                <dd className="font-medium text-primary-800 dark:text-white">
                  {new Date(data.credential.issueDate).toLocaleDateString()}
                </dd>
                {data.credential.expiryDate && (
                  <>
                    <dt className="text-primary-400">Expiry date</dt>
                    <dd className="font-medium text-primary-800 dark:text-white">
                      {new Date(data.credential.expiryDate).toLocaleDateString()}
                    </dd>
                  </>
                )}
              </dl>
            ) : (
              <p className="mt-4 text-sm text-primary-500">
                No credential exists with this ID. Double-check the ID and try again.
              </p>
            )}
            <button
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-accent-600 hover:underline"
              onClick={() => {
                track(AnalyticsEvent.VERIFICATION_REPORT_DOWNLOADED);
                toast.info('Report generation wires up jsPDF in the full build.');
              }}
            >
              <FileDown className="h-4 w-4" /> Download verification report
            </button>
          </div>
        )}

        <div className="mt-8 rounded-xl2 border border-dashed border-primary-200 p-6 text-center dark:border-primary-700">
          <Upload className="mx-auto h-6 w-6 text-primary-400" />
          <p className="mt-2 text-sm text-primary-500">
            Have the certificate file? Upload it to confirm its hash matches this record.
          </p>
          <label className="mt-3 inline-block cursor-pointer rounded-lg border border-primary-200 px-4 py-2 text-sm font-medium hover:bg-primary-50 dark:border-primary-700">
            {fileComparing ? 'Comparing…' : 'Choose file'}
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFileUpload(file);
              }}
            />
          </label>

          {fileResult && (
            <div className="mt-4 flex justify-center">
              <StatusBadge result={fileResult.result} />
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
