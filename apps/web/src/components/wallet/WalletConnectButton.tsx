import { useState } from 'react';
import { Wallet, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useWalletStore } from '@/stores/walletStore';
import {
  connectFreighter,
  shortenAddress,
  FreighterNotInstalledError,
  WrongNetworkError,
  SignatureRejectedError,
} from '@/services/freighter';
import { track } from '@/services/analytics';
import { AnalyticsEvent } from '@certifychain/shared';

export function WalletConnectButton() {
  const { status, publicKey, setStatus, setConnected, setError } = useWalletStore();
  const [busy, setBusy] = useState(false);

  async function handleConnect() {
    setBusy(true);
    setStatus('connecting');
    track(AnalyticsEvent.WALLET_CONNECTION_STARTED);
    try {
      const { publicKey: pk, network } = await connectFreighter();
      setConnected(pk, network);
      track(AnalyticsEvent.WALLET_CONNECTED);
      toast.success('Wallet connected');
    } catch (err) {
      if (err instanceof FreighterNotInstalledError) {
        setStatus('not_installed');
        toast.error('Freighter is not installed. Install it from freighter.app to continue.');
      } else if (err instanceof WrongNetworkError) {
        setStatus('wrong_network');
        toast.error(err.message);
      } else if (err instanceof SignatureRejectedError) {
        setStatus('rejected');
        toast.error('Connection request was rejected.');
      } else {
        setError(err instanceof Error ? err.message : 'Could not connect wallet');
        toast.error('Something went wrong connecting your wallet.');
      }
    } finally {
      setBusy(false);
    }
  }

  if (status === 'connected' && publicKey) {
    return (
      <span className="inline-flex items-center gap-2 rounded-lg border border-status-valid/30 bg-status-valid/5 px-4 py-2 text-sm font-medium text-status-valid">
        <CheckCircle2 className="h-4 w-4" /> {shortenAddress(publicKey)}
      </span>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
      {busy ? 'Connecting…' : 'Connect Freighter'}
    </button>
  );
}
