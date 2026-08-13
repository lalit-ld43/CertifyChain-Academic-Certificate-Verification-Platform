import {
  isConnected,
  isAllowed,
  setAllowed,
  getAddress,
  getNetwork,
  signTransaction,
} from '@stellar/freighter-api';
import { appEnv } from '@/utils/env';

export class FreighterNotInstalledError extends Error {
  constructor() {
    super('Freighter wallet extension is not installed.');
    this.name = 'FreighterNotInstalledError';
  }
}

export class WrongNetworkError extends Error {
  constructor(public readonly currentNetwork: string) {
    super(`Freighter is set to ${currentNetwork}. Please switch to Stellar Testnet.`);
    this.name = 'WrongNetworkError';
  }
}

export class SignatureRejectedError extends Error {
  constructor() {
    super('You rejected the signature request in Freighter.');
    this.name = 'SignatureRejectedError';
  }
}

/** Detects whether the Freighter browser extension is present at all. */
export async function detectFreighter(): Promise<boolean> {
  try {
    const result = await isConnected();
    return !result.error;
  } catch {
    return false;
  }
}

/** Requests account access and returns the connected public key. Throws typed errors on failure. */
export async function connectFreighter(): Promise<{ publicKey: string; network: string }> {
  const available = await detectFreighter();
  if (!available) throw new FreighterNotInstalledError();

  const allowed = await isAllowed();
  if (!allowed.isAllowed) {
    const granted = await setAllowed();
    if (!granted.isAllowed) throw new SignatureRejectedError();
  }

  const addressResult = await getAddress();
  if (addressResult.error || !addressResult.address) {
    throw new Error('Could not retrieve wallet address from Freighter.');
  }

  const networkResult = await getNetwork();
  if (networkResult.error) {
    throw new Error('Could not determine Freighter network.');
  }
  if (networkResult.network !== appEnv.stellarNetwork) {
    throw new WrongNetworkError(networkResult.network);
  }

  return { publicKey: addressResult.address, network: networkResult.network };
}

/** Signs an XDR transaction envelope with Freighter. Maps user rejection to a typed error. */
export async function signWithFreighter(
  xdr: string,
  opts: { networkPassphrase: string; address: string },
): Promise<string> {
  const result = await signTransaction(xdr, {
    network: 'TESTNET',
    networkPassphrase: opts.networkPassphrase || 'Test SDF Network ; September 2015',
    accountToSign: opts.address,
  } as any);
  if (result.error) {
    const message = String(result.error.message ?? '').toLowerCase();
    if (message.includes('reject') || message.includes('declin')) {
      throw new SignatureRejectedError();
    }
    throw new Error(result.error.message ?? 'Freighter failed to sign the transaction.');
  }
  return result.signedTxXdr;
}

export function shortenAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
