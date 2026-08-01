import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SentryReact from '@sentry/react';
import App from './App';
import { initSentry } from '@/services/sentry';
import { initAnalytics } from '@/services/analytics';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/services/api';
import type { ApiResponse, UserDTO } from '@certifychain/shared';
import './index.css';

initSentry();
initAnalytics();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function Root() {
  useEffect(() => {
    // Attempt silent session restore via refresh cookie on first load.
    (async () => {
      try {
        const res = await api.get<ApiResponse<{ accessToken: string; user: UserDTO }>>(
          '/auth/refresh',
        );
        if (res.data.success) {
          useAuthStore.getState().setAccessToken(res.data.data.accessToken);
          useAuthStore.getState().setUser(res.data.data.user);
        }
      } catch {
        // no valid session — user stays logged out
      } finally {
        useAuthStore.getState().setHydrating(false);
      }
    })();
  }, []);

  return (
    <SentryReact.ErrorBoundary
      fallback={
        <div className="flex min-h-screen items-center justify-center p-8 text-center">
          <div>
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-primary-500">
              We&apos;ve been notified and are looking into it. Please refresh the page.
            </p>
          </div>
        </div>
      }
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </SentryReact.ErrorBoundary>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
