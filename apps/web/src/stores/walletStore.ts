import { create } from 'zustand';

export type WalletConnectionStatus =
  | 'idle'
  | 'detecting'
  | 'not_installed'
  | 'connecting'
  | 'connected'
  | 'wrong_network'
  | 'rejected'
  | 'error';

interface WalletState {
  status: WalletConnectionStatus;
  publicKey: string | null;
  network: string | null;
  error: string | null;
  setStatus: (status: WalletConnectionStatus) => void;
  setConnected: (publicKey: string, network: string) => void;
  setError: (message: string) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  status: 'idle',
  publicKey: null,
  network: null,
  error: null,
  setStatus: (status) => set({ status, error: null }),
  setConnected: (publicKey, network) =>
    set({ status: 'connected', publicKey, network, error: null }),
  setError: (message) => set({ status: 'error', error: message }),
  disconnect: () => set({ status: 'idle', publicKey: null, network: null, error: null }),
}));
