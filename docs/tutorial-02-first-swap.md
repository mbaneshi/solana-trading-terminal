# Tutorial 02: First swap

Walkthrough for executing your first swap on the Solana Trading Terminal (local or devnet).

## Prerequisites

- [Tutorial 01: Setup](tutorial-01-setup.md) completed: validator running, program deployed, backend and frontend up.
- Wallet (e.g. Phantom) connected to devnet with SOL and the pool tokens (or use scripts to create a pool and mint test tokens).

## Steps

1. **Open the app**  
   Go to [http://localhost:3000](http://localhost:3000) and connect your wallet.

2. **Select tokens**  
   In the swap UI, choose the input token (e.g. SOL) and output token (e.g. USDC or a test token). Ensure the pool for that pair exists and has liquidity (see program scripts or `initialize_pool`).

3. **Enter amount**  
   Enter the amount to swap. The UI will show estimated output and price impact (if implemented).

4. **Slippage**  
   Set slippage tolerance (e.g. 0.5% or 1%) to allow for small price moves between quote and execution.

5. **Execute**  
   Click Swap, approve the transaction in your wallet. After confirmation, the swap is on-chain; balances and history should update.

## What happens on-chain

- The frontend (or backend) builds a **swap** instruction for the Anchor program.
- The program checks pool state, computes output amount from the AMM formula, applies fees and slippage.
- It moves tokens from user and pool vaults and updates pool state.
- The transaction is sent via RPC and signed by the user’s wallet.

## Troubleshooting

- **Insufficient liquidity:** Ensure the pool is initialized and has liquidity for the pair.
- **Slippage exceeded:** Increase slippage or use a smaller amount.
- **Wallet / RPC:** Confirm wallet is on devnet if you deployed to devnet; confirm RPC URL in env.

## Next

- [Domain concepts](domain-concepts.md) — AMM, swap, liquidity
- [Architecture](architecture.md) — Components and data flow
