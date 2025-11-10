import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
);

export const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet';

export const RPC_ENDPOINT = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
  (NETWORK === 'mainnet-beta'
    ? 'https://api.mainnet-beta.solana.com'
    : 'https://api.devnet.solana.com');

export const DEFAULT_SLIPPAGE = 1; // 1%

export const TOKEN_DECIMALS = 9;

export const EXPLORER_URL = NETWORK === 'mainnet-beta'
  ? 'https://explorer.solana.com'
  : 'https://explorer.solana.com?cluster=devnet';
