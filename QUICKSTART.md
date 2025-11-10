# Quick Start Guide - Solana DEX Trading Platform

Get up and running in 5 minutes!

## Prerequisites

Ensure you have these installed:
- Node.js 18+
- Rust 1.70+
- Solana CLI 1.16+
- Anchor CLI 0.28+

## Installation Commands

```bash
# Install Solana CLI (if not installed)
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor CLI (if not installed)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

## Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# Clone or navigate to project
cd 07-solana-trading-platform

# Run automated setup script
./scripts/setup.sh
```

This will:
- Install all dependencies
- Copy environment files
- Build smart contract
- Run tests

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install
cd app && npm install && cd ..
cd backend && npm install && cd ..

# 2. Setup environment files
cp .env.example .env
cp app/.env.example app/.env.local
cp backend/.env.example backend/.env

# 3. Build smart contract
anchor build

# 4. Run tests
anchor test
```

## Running Locally

### Terminal 1: Start Solana Validator
```bash
solana-test-validator
```

### Terminal 2: Deploy Smart Contract
```bash
anchor deploy

# Copy the Program ID from output and update:
# - app/.env.local: NEXT_PUBLIC_PROGRAM_ID
# - backend/.env: PROGRAM_ID
```

### Terminal 3: Start Backend
```bash
cd backend
npm run dev

# Backend runs on http://localhost:3001
```

### Terminal 4: Start Frontend
```bash
cd app
npm run dev

# Frontend runs on http://localhost:3000
```

### Terminal 5 (Optional): Initialize Pool
```bash
anchor run initialize-pool
```

## Access Application

Open your browser to: **http://localhost:3000**

1. **Connect Wallet**
   - Click "Connect Wallet" button
   - Select wallet (make sure it's set to Localnet)
   - Approve connection

2. **Fund Wallet** (if using test wallet)
   ```bash
   solana airdrop 10 YOUR_WALLET_ADDRESS
   ```

3. **Start Trading**
   - Select tokens
   - Enter amount
   - Click "Swap"
   - Confirm in wallet

## Deploy to Devnet

```bash
# Deploy to devnet
./scripts/deploy-devnet.sh

# Update environment files with new Program ID
# app/.env.local: NEXT_PUBLIC_PROGRAM_ID=<new-program-id>
# backend/.env: PROGRAM_ID=<new-program-id>

# Restart backend and frontend
```

## Verify Deployment

### Check Smart Contract
```bash
# View program on devnet
solana program show <PROGRAM_ID> --url devnet
```

### Check Backend
```bash
# Health check
curl http://localhost:3001/health
```

### Check Frontend
Visit: http://localhost:3000

## Troubleshooting

### "Program not deployed"
```bash
# Rebuild and redeploy
anchor build
anchor deploy
```

### "Wallet connection fails"
- Ensure wallet extension is installed
- Set wallet network to Localnet/Devnet
- Refresh the page

### "Transaction fails"
- Check wallet has sufficient SOL
- Verify pool is initialized
- Check slippage tolerance

### "RPC connection error"
```bash
# Check validator is running
solana cluster-version

# Or restart validator
killall solana-test-validator
solana-test-validator
```

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Same for app and backend
```

## Using Docker (Alternative)

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Or start everything
docker-compose up -d
```

## Next Steps

After setup is working:

1. **Read Documentation**
   - [README.md](./README.md) - Full overview
   - [REQUIREMENTS.md](./REQUIREMENTS.md) - Specifications
   - [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - What was built

2. **Explore Code**
   - Smart contracts: `programs/trading-platform/src/`
   - Frontend: `app/src/`
   - Backend: `backend/src/`
   - Tests: `tests/`

3. **Customize**
   - Modify token list
   - Adjust fees
   - Add features
   - Style frontend

4. **Deploy**
   - Test on devnet
   - Security audit
   - Deploy to mainnet (see [DEPLOYMENT.md](./DEPLOYMENT.md))

## Common Commands

```bash
# Build smart contract
anchor build

# Run tests
anchor test

# Deploy to localnet
anchor deploy

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Check balance
solana balance

# Airdrop SOL (devnet only)
solana airdrop 5 --url devnet

# View logs
solana logs

# Frontend dev
cd app && npm run dev

# Backend dev
cd backend && npm run dev

# Build frontend for production
cd app && npm run build

# Build backend for production
cd backend && npm run build
```

## Project Structure

```
07-solana-trading-platform/
├── programs/          # Anchor smart contracts
├── app/               # Next.js frontend
├── backend/           # Node.js backend API
├── tests/             # Integration tests
├── scripts/           # Deployment scripts
├── migrations/        # Database schema
└── docs/              # Documentation
```

## Key Files

- `Anchor.toml` - Anchor configuration
- `app/.env.local` - Frontend environment
- `backend/.env` - Backend environment
- `package.json` - Root dependencies
- `REQUIREMENTS.md` - Full specifications

## Support

### Documentation
- Quick Start: This file
- Full README: [README.md](./README.md)
- Requirements: [REQUIREMENTS.md](./REQUIREMENTS.md)
- Deployment: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Security: [SECURITY.md](./SECURITY.md)

### Resources
- Solana Docs: https://docs.solana.com
- Anchor Book: https://book.anchor-lang.com
- Next.js Docs: https://nextjs.org/docs

### Getting Help
1. Check documentation
2. Review error messages
3. Check Solana network status
4. Verify environment variables
5. Restart services

## Success Checklist

- [ ] All dependencies installed
- [ ] Smart contract builds without errors
- [ ] Tests pass
- [ ] Local validator running
- [ ] Smart contract deployed
- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Wallet connects successfully
- [ ] Can view balances
- [ ] Can execute swap

If all checked, you're ready to develop! 🎉

---

**Total Setup Time:** ~5-10 minutes

**Next:** Deploy to devnet with `./scripts/deploy-devnet.sh`

**Need Help?** Check [README.md](./README.md) or [REQUIREMENTS.md](./REQUIREMENTS.md)
