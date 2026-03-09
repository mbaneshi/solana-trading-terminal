# Tutorial 01: Setup

Get the Solana Trading Terminal running locally.

## Prerequisites

- **Node.js** 18+
- **Rust** (e.g. `rustup`)
- **Solana CLI** 1.16+
- **Anchor CLI** 0.28+

Install Solana and Anchor:

```bash
# Solana
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

## Clone and install

```bash
git clone https://github.com/mbaneshi/solana-trading-terminal.git
cd solana-trading-terminal

npm install
cd app && npm install && cd ..
cd backend && npm install && cd ..
```

## Environment

```bash
cp .env.example .env
cp app/.env.example app/.env.local
cp backend/.env.example backend/.env
```

Edit `.env`, `app/.env.local`, and `backend/.env` as needed. For local dev, default RPC is often `http://127.0.0.1:8899` (local validator).

## Build the program

```bash
anchor build
```

## Run locally

1. **Terminal 1 — Validator**

   ```bash
   solana-test-validator
   ```

2. **Terminal 2 — Deploy program**

   ```bash
   anchor deploy
   ```

   Copy the Program ID from the output. Set it in `app/.env.local` as `NEXT_PUBLIC_PROGRAM_ID` and in `backend/.env` as `PROGRAM_ID`.

3. **Terminal 3 — Backend**

   ```bash
   cd backend && npm run start:dev
   ```

4. **Terminal 4 — Frontend**

   ```bash
   cd app && npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000), connect a wallet (devnet), and ensure the wallet has devnet SOL and test tokens if required.

## Optional: automated setup

From the repo root:

```bash
./scripts/setup.sh
```

Then start validator, deploy, backend, and frontend as above.

## Next

- [Tutorial 02: First swap](tutorial-02-first-swap.md)
- [Architecture](architecture.md)
- [Domain concepts](domain-concepts.md)
