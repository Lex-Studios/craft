import { Horizon, Transaction } from 'stellar-sdk';
import { config } from './config';
import { parseStellarError, formatError } from './errors';

export type StellarAccount = Horizon.HorizonApi.AccountResponse;
export type StellarBalance = StellarAccount['balances'][number];
export type SubmitTransactionResult = Horizon.HorizonApi.SubmitTransactionResponse;

// Initialize Stellar Server
export const server = new Horizon.Server(config.stellar.horizonUrl);

// Network configuration
export const networkPassphrase = config.stellar.networkPassphrase;

/**
 * Load account data from the Stellar network.
 *
 * @param publicKey - The public key of the account to load
 * @returns Account data including balances and sequence number
 * @throws {Error} Descriptive error with remediation guidance
 *
 * @example
 * ```typescript
 * const account = await loadAccount('GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ');
 * ```
 */
export async function loadAccount(publicKey: string): Promise<StellarAccount> {
    try {
        return await server.loadAccount(publicKey) as StellarAccount;
    } catch (error) {
        const parsed = parseStellarError(error);
        throw new Error(
            `Failed to load account: ${parsed.message}\n${formatError(error, true)}`
        );
    }
}

/**
 * Get the balance of a Stellar account.
 *
 * @param publicKey - The public key of the account
 * @returns Array of account balances for all assets
 * @throws {Error} Descriptive error with remediation guidance
 *
 * @example
 * ```typescript
 * const balances = await getAccountBalance('GCEZWK...');
 * console.log(balances);
 * ```
 */
export async function getAccountBalance(publicKey: string): Promise<StellarBalance[]> {
    try {
        const account = await loadAccount(publicKey);
        return account.balances as StellarBalance[];
    } catch (error) {
        const parsed = parseStellarError(error);
        throw new Error(
            `Failed to get account balance: ${parsed.message}\n${formatError(error, true)}`
        );
    }
}

/**
 * Submit a signed transaction to the Stellar network.
 *
 * @param transaction - The signed transaction to submit
 * @returns Transaction response from Horizon
 * @throws {Error} Descriptive error with remediation guidance
 *
 * @example
 * ```typescript
 * const response = await submitTransaction(signedTransaction);
 * console.log('Transaction submitted:', response.id);
 * ```
 */
export async function submitTransaction(transaction: Transaction): Promise<SubmitTransactionResult> {
    const txHash = typeof (transaction as any)?.hash === 'function'
        ? (transaction as any).hash()
        : undefined;

    try {
        return await server.submitTransaction(transaction) as SubmitTransactionResult;
    } catch (error) {
        const parsed = parseStellarError(error, txHash);
        throw new Error(
            `Failed to submit transaction: ${parsed.message}\n${formatError(error, true)}`
        );
    }
}