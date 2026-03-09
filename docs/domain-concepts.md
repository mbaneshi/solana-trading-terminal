# Domain concepts

Short glossary for reading the code and docs.

## AMM (Automated Market Maker)

A pool that quotes prices from reserves (e.g. two token amounts). No order book; swaps move the pool state. This repo uses the **constant product** rule: `x * y = k`. Swap amount in one token changes the other token’s amount so that the product stays constant (before fees).

## Swap

A trade that takes one token from the user and gives another from the pool (or vice versa). The program computes the output amount from the AMM formula and applies slippage checks.

## Liquidity / pool

The on-chain state holding two token reserves (and often LP token mint). **Add liquidity:** user deposits both tokens, receives LP tokens. **Remove liquidity:** user burns LP tokens, receives both tokens back. Liquidity providers earn from swap fees.

## Slippage and price impact

- **Slippage:** Maximum acceptable difference between expected and actual output (e.g. 0.5%).
- **Price impact:** Large swaps move the pool price; the effective execution price can be worse than the current spot price.

## Solana primitives (relevant here)

- **Program:** On-chain code (this project uses Anchor). Programs are stateless; state lives in **accounts**.
- **Accounts:** Hold pool state, token vaults, user LP positions, etc. The program reads/writes them.
- **SPL Token:** Standard for minting and transferring tokens; pool vaults and LP tokens are SPL.
- **RPC:** Backend/frontend talk to Solana via RPC (get account data, send transactions).

## Wallet

Users connect Phantom, Solflare, etc. The frontend uses `@solana/wallet-adapter` to get the public key and sign transactions; private keys never leave the wallet.
