import posthog from 'posthog-js';
import type { AnalyticsEvent } from '@certifychain/shared';
import { appEnv } from '@/utils/env';

const CONSENT_KEY = 'certifychain_analytics_consent';

let initialized = false;

export function hasAnalyticsConsent(): boolean {
  return localStorage.getItem(CONSENT_KEY) === 'granted';
}

export function setAnalyticsConsent(granted: boolean): void {
  localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
  if (granted) initAnalytics();
  else posthog.opt_out_capturing();
}

export function initAnalytics(): void {
  if (initialized || !appEnv.posthogKey || !hasAnalyticsConsent()) return;
  posthog.init(appEnv.posthogKey, {
    api_host: appEnv.posthogHost,
    capture_pageview: true,
    autocapture: false, // explicit events only — avoids accidentally capturing form field values
    persistence: 'localStorage',
  });
  initialized = true;
}

/**
 * Tracks a product event. Properties must never contain names, emails,
 * registration numbers, certificate numbers, full wallet addresses, grades,
 * or certificate contents (spec §22) — pass only anonymized/internal ids.
 */
export function track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>): void {
  if (!initialized) return;
  posthog.capture(event, properties);
}
