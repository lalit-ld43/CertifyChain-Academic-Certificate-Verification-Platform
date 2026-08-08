/**
 * Central accessor for VITE_* env vars with startup validation. Throws a
 * clear error in the console (dev) rather than failing silently at some
 * unrelated call site (e.g. a blank contract ID breaking every tx build).
 */
function required(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name];
  if (!value) {
    // eslint-disable-next-line no-console
    console.error(`Missing required env var: ${name}. Check apps/web/.env.example.`);
    return '';
  }
  return value;
}

export const appEnv = {
  apiUrl: required('VITE_API_URL'),
  stellarNetwork: (import.meta.env.VITE_STELLAR_NETWORK?.toUpperCase() || 'TESTNET') as
    'TESTNET' | 'PUBLIC',
  stellarNetworkPassphrase: required('VITE_STELLAR_NETWORK_PASSPHRASE'),
  stellarRpcUrl: required('VITE_STELLAR_RPC_URL'),
  horizonUrl: required('VITE_HORIZON_URL'),
  contractId: import.meta.env.VITE_CONTRACT_ID || '',
  posthogKey: import.meta.env.VITE_POSTHOG_KEY || '',
  posthogHost: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
  sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
};
