import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Upload } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function VerifyLandingPage() {
  const navigate = useNavigate();
  const [credentialId, setCredentialId] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = credentialId.trim();
    if (trimmed) navigate(`/verify/${encodeURIComponent(trimmed)}`);
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-3xl font-bold text-primary-900 dark:text-white">
          Verify a certificate
        </h1>
        <p className="mt-3 text-primary-500">
          Enter a credential ID, scan a QR code, or open a share link to check authenticity instantly.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="credentialId" className="sr-only">
            Credential ID
          </label>
          <input
            id="credentialId"
            value={credentialId}
            onChange={(e) => setCredentialId(e.target.value)}
            placeholder="Paste a credential ID (e.g. 4c2f9e1a-...)"
            className="flex-1 rounded-lg border border-primary-200 px-4 py-3 text-sm focus:border-accent-500 focus:outline-none dark:border-primary-700 dark:bg-primary-900"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-800 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            <Search className="h-4 w-4" /> Verify
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-400">
          <Upload className="h-4 w-4" />
          Have the certificate file instead? Open any credential&apos;s verify page to compare its hash.
        </div>
      </div>
    </PublicLayout>
  );
}
