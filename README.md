# Solana Trading Terminal

Full-stack decentralized trading platform on Solana: Anchor (Rust) programs for AMM swap and liquidity, Node.js backend, Next.js web app with wallet connect and portfolio view. For learners and engineers building on-chain DeFi.

## Concepts

- **AMM (Automated Market Maker):** Constant-product (x·y=k) pools; swap and add/remove liquidity on-chain.
- **Swap:** Token-for-token exchange via program; slippage and price impact.
- **Liquidity:** Pool state and LP tokens; fee collection.
- **Wallet / RPC:** Phantom, Solflare; Solana RPC for reads and transaction submission.

## Quick start

```bash
# Clone and enter repo
git clone https://github.com/mbaneshi/solana-trading-terminal.git
cd solana-trading-terminal

# Dependencies
npm install && cd app && npm install && cd .. && cd backend && npm install && cd ..

# Env
cp .env.example .env && cp app/.env.example app/.env.local && cp backend/.env.example backend/.env

# Build program
anchor build

# Run (Terminal 1) local validator
solana-test-validator

# (Terminal 2) Deploy and note Program ID, then set in app/.env.local and backend/.env
anchor deploy

# (Terminal 3) Backend
cd backend && npm run start:dev

# (Terminal 4) Frontend
cd app && npm run dev
```

Open [http://localhost:3000](http://localhost:3000). See [QUICKSTART.md](QUICKSTART.md) and [docs/tutorial-01-setup.md](docs/tutorial-01-setup.md) for details.

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/architecture.md](docs/architecture.md) | Components and data flow |
| [docs/domain-concepts.md](docs/domain-concepts.md) | AMM, swap, liquidity, Solana primitives |
| [docs/tutorial-01-setup.md](docs/tutorial-01-setup.md) | Prerequisites and run locally |
| [docs/tutorial-02-first-swap.md](docs/tutorial-02-first-swap.md) | First swap walkthrough |
| [docs/TESTING.md](docs/TESTING.md) | Test suite and coverage |
| [docs/SECURITY_AUDIT_CHECKLIST.md](docs/SECURITY_AUDIT_CHECKLIST.md) | Security checklist |

## Tech stack

- **On-chain:** Rust, Anchor, SPL token
- **Backend:** Node.js, TypeScript
- **Frontend:** Next.js, Tailwind, @solana/wallet-adapter

## Testing

```bash
# Frontend
cd app && npm test

# Backend
cd backend && npm test

# Program (with validator running)
anchor test
```

See [docs/TESTING.md](docs/TESTING.md).

## Security

Before mainnet: review [docs/SECURITY_AUDIT_CHECKLIST.md](docs/SECURITY_AUDIT_CHECKLIST.md), run tests on devnet, consider a professional audit.

## License

MIT. Original project scope and deliverables are documented in [docs/ORIGINAL_SCOPE.md](docs/ORIGINAL_SCOPE.md).
