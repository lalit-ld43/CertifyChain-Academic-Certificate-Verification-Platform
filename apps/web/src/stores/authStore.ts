import { create } from 'zustand';
import type { UserDTO } from '@certifychain/shared';

interface AuthState {
  user: UserDTO | null;
  accessToken: string | null;
  isHydrating: boolean;
  setUser: (user: UserDTO | null) => void;
  setAccessToken: (token: string | null) => void;
  setHydrating: (v: boolean) => void;
  clear: () => void;
}

/**
 * Access token lives in memory only (never localStorage) — refresh token is
 * an httpOnly cookie the browser handles automatically. This avoids XSS
 * token theft while still surviving a page reload via the refresh flow.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrating: true,
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setHydrating: (isHydrating) => set({ isHydrating }),
  clear: () => set({ user: null, accessToken: null }),
}));
