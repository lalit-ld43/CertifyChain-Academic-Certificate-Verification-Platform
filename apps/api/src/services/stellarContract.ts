import { Contract, rpc, TransactionBuilder, Networks, xdr } from '@stellar/stellar-sdk';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const server = new rpc.Server(env.STELLAR_RPC_URL);
const contract = new Contract(env.CONTRACT_ID);

/**
 * Simulates and/or reads contract state without requiring a signature —
 * used for read-only calls like verify_credential from the public
 * verification endpoint. Institution-signed write calls (issue/claim/revoke)
 * are built here but *signed client-side with Freighter*; the backend never
 * holds a signing key for institution/student accounts.
 */
export async function simulateReadOnlyCall(fnName: string, args: xdr.ScVal[]) {
  try {
    // Building a throwaway source account transaction purely for simulation.
    const account = await server.getAccount(await getAnyFundedSourceAccount());
    const tx = new TransactionBuilder(account, {
      fee: '100',
      networkPassphrase: env.STELLAR_NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(fnName, ...args))
      .setTimeout(30)
      .build();

    const sim = await server.simulateTransaction(tx);
    return sim;
  } catch (err) {
    logger.error({ err, fnName }, 'Contract simulation failed');
    throw err;
  }
}

// Placeholder: in production this should be a dedicated, funded "reader"
// account used only for simulation (never for signing real state changes).
async function getAnyFundedSourceAccount(): Promise<string> {
  throw new Error('Configure a dedicated Testnet reader account for read-only simulation calls.');
}

export { server, contract, Networks };
