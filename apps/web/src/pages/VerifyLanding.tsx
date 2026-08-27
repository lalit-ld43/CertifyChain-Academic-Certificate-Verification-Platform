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
          Enter a credential ID, scan a QR code, or open a share link to check authenticity
          instantly.
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
          Have the certificate file instead? Open any credential&apos;s verify page to compare its
          hash.
        </div>

        <div className="mt-12 rounded-xl border border-primary-200 bg-primary-50 p-6 flex flex-col items-center dark:border-primary-800 dark:bg-primary-950/50">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-accent-100 p-2 text-accent-600 dark:bg-accent-900/30">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.001 20.957v-6.957h-3.999v6.52c-2.457-.965-4.498-2.73-5.599-5.02h6.598v-3.5h-7.616c-.227-1.025-.383-2.091-.383-3.2 0-3.666 1.706-6.945 4.364-9.066v9.066h3.999v-6.619c2.306-1.037 5.031-1.038 7.338-.002v6.621h4.001v-9.065c2.657 2.122 4.363 5.401 4.363 9.066 0 1.109-.156 2.175-.383 3.2h-7.617v3.5h6.598c-1.102 2.29-3.142 4.055-5.599 5.02v-6.52h-4.001v6.957c-.649.096-1.317.15-2.001.15-.683 0-1.35-.054-1.999-.15z"/></svg>
            </div>
            <h3 className="text-lg font-bold text-primary-900 dark:text-white font-display">CertifyChain Browser Extension</h3>
          </div>
          <p className="mt-2 text-sm text-primary-600 text-center max-w-md dark:text-primary-400">
            Verify credentials directly inline on LinkedIn, Indeed, and applicant tracking systems without ever switching tabs.
          </p>
          <button
            onClick={() => window.open('https://chrome.google.com/webstore', '_blank')}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-800 shadow-sm hover:bg-primary-50 dark:bg-primary-900 dark:border-primary-700 dark:text-white dark:hover:bg-primary-800"
          >
            Add to Browser — It's Free
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}
