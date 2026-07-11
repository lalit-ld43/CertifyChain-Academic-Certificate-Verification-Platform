import axios, { AxiosError, type AxiosInstance } from 'axios';
import type { ApiResponse } from '@certifychain/shared';
import { appEnv } from '@/utils/env';
import { useAuthStore } from '@/stores/authStore';

export const api: AxiosInstance = axios.create({
  baseURL: appEnv.apiUrl,
  withCredentials: true, // send refresh-token httpOnly cookie
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await axios.post<ApiResponse<{ accessToken: string }>>(
      `${appEnv.apiUrl}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    if (res.data.success) {
      useAuthStore.getState().setAccessToken(res.data.data.accessToken);
      return res.data.data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      refreshPromise ??= refreshAccessToken();
      const newToken = await refreshPromise;
      refreshPromise = null;
      if (newToken) {
        original.headers = original.headers ?? {};
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (original.headers as Record<string, unknown>).Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      useAuthStore.getState().clear();
    }
    return Promise.reject(error);
  },
);

/** Extracts a user-friendly message from a failed ApiResponse, falling back gracefully. */
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined;
    if (data && !data.success) return data.error.message;
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (!error.response) return 'Network error — check your connection and try again.';
  }
  return 'Something went wrong. Please try again.';
}
