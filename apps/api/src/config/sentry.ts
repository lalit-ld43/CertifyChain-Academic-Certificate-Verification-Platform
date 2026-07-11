import * as Sentry from '@sentry/node';
import { env } from './env.js';

/**
 * Initializes Sentry for the backend. No-ops safely if SENTRY_DSN is not
 * configured (e.g. local dev), so the app never crashes because monitoring
 * isn't set up yet.
 *
 * IMPORTANT: never attach passwords, JWTs, full wallet addresses, certificate
 * content, or personal metadata to Sentry events (spec §23). Use
 * utils/sanitize.ts helpers before calling Sentry.captureException with
 * extra context.
 */
export function initSentry(): void {
  if (!env.SENTRY_DSN) return;

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.NODE_ENV,
    tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    beforeSend(event) {
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers['authorization'];
          delete event.request.headers['cookie'];
        }
      }
      return event;
    },
  });
}

export { Sentry };
