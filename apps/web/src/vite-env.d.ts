/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_STELLAR_NETWORK: 'TESTNET' | 'PUBLIC';
  readonly VITE_STELLAR_NETWORK_PASSPHRASE: string;
  readonly VITE_STELLAR_RPC_URL: string;
  readonly VITE_HORIZON_URL: string;
  readonly VITE_CONTRACT_ID: string;
  readonly VITE_POSTHOG_KEY: string;
  readonly VITE_POSTHOG_HOST: string;
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_APP_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
