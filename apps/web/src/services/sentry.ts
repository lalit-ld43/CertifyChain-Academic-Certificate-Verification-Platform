import * as Sentry from '@sentry/react';
import { appEnv } from '@/utils/env';

export function initSentry(): void {
  if (!appEnv.sentryDsn) return;
  Sentry.init({
    dsn: appEnv.sentryDsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      // Strip anything that could contain PII/secrets before it leaves the browser.
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['Cookie'];
      }
      return event;
    },
  });
}

export { Sentry };
