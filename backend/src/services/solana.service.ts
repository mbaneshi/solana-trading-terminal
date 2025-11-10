import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { logger } from '../utils/logger';

export class SolanaService {
  private connection: Connection;

  constructor() {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    logger.info(`Connected to Solana RPC: ${rpcUrl}`);
  }

  async getBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error: any) {
      logger.error(`Error fetching balance: ${error.message}`);
      throw error;
    }
  }

  async getTokenAccounts(walletAddress: string) {
    try {
      const publicKey = new PublicKey(walletAddress);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      return tokenAccounts.value.map(account => ({
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
      }));
    } catch (error: any) {
      logger.error(`Error fetching token accounts: ${error.message}`);
      throw error;
    }
  }

  async getTransactionHistory(
    walletAddress: string,
    limit: number = 20
  ): Promise<any[]> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );

      const transactions = await Promise.all(
        signatures.map(async sig => {
          const tx = await this.connection.getParsedTransaction(
            sig.signature,
            { maxSupportedTransactionVersion: 0 }
          );

          return {
            signature: sig.signature,
            blockTime: sig.blockTime,
            slot: sig.slot,
            err: sig.err,
            memo: sig.memo,
          };
        })
      );

      return transactions.filter(tx => tx !== null);
    } catch (error: any) {
      logger.error(`Error fetching transactions: ${error.message}`);
      throw error;
    }
  }

  async confirmTransaction(signature: string): Promise<boolean> {
    try {
      const confirmation = await this.connection.confirmTransaction(
        signature,
        'confirmed'
      );
      return !confirmation.value.err;
    } catch (error: any) {
      logger.error(`Error confirming transaction: ${error.message}`);
      return false;
    }
  }

  subscribeToAccount(
    walletAddress: string,
    callback: (accountInfo: any) => void
  ): number {
    const publicKey = new PublicKey(walletAddress);
    return this.connection.onAccountChange(publicKey, callback, 'confirmed');
  }

  unsubscribe(subscriptionId: number): void {
    this.connection.removeAccountChangeListener(subscriptionId);
  }

  getConnection(): Connection {
    return this.connection;
  }
}
