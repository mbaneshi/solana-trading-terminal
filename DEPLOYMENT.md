# Deployment Guide

This guide covers deploying the Solana DEX Trading Platform to both Devnet and Mainnet.

## Prerequisites

- Node.js 18+
- Rust 1.70+
- Solana CLI 1.16+
- Anchor CLI 0.28+
- PostgreSQL 15+
- Redis 7+

## Development Setup

### 1. Install Dependencies

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Install Node dependencies
npm install
cd app && npm install
cd ../backend && npm install
```

### 2. Configure Environment

```bash
# Root directory
cp .env.example .env

# Frontend
cp app/.env.example app/.env.local

# Backend
cp backend/.env.example backend/.env
```

### 3. Build Smart Contract

```bash
anchor build
```

## Devnet Deployment

### 1. Configure Solana CLI

```bash
solana config set --url https://api.devnet.solana.com
solana-keygen new --outfile ~/.config/solana/devnet-wallet.json
solana airdrop 5
```

### 2. Deploy Smart Contract

```bash
chmod +x scripts/deploy-devnet.sh
./scripts/deploy-devnet.sh
```

### 3. Initialize Pool

```bash
anchor run initialize-pool --provider.cluster devnet
```

### 4. Setup Database

```bash
cd backend
npm run db:migrate
```

### 5. Start Backend

```bash
cd backend
npm run dev
```

### 6. Start Frontend

```bash
cd app
npm run dev
```

### 7. Test

Open http://localhost:3000 and connect your Solana wallet (set to Devnet).

## Mainnet Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Code reviewed by multiple developers
- [ ] Tested on devnet for at least 1 week
- [ ] Emergency procedures documented
- [ ] Legal compliance reviewed
- [ ] Initial liquidity secured
- [ ] Production RPC provider configured
- [ ] Monitoring and alerting setup
- [ ] Backup systems in place

### 1. Prepare Mainnet Wallet

```bash
# Use hardware wallet for additional security
solana config set --url https://api.mainnet-beta.solana.com
solana-keygen new --outfile ~/.config/solana/mainnet-wallet.json

# Fund wallet (requires 5-20 SOL for deployment)
# Transfer SOL to the wallet address from an exchange
```

### 2. Deploy Smart Contract

```bash
# Build for mainnet
anchor build --verifiable

# Deploy
anchor deploy --provider.cluster mainnet

# Save program ID
PROGRAM_ID=$(solana address -k target/deploy/trading_platform-keypair.json)
echo "Program ID: $PROGRAM_ID"

# Verify deployment
solana program show $PROGRAM_ID
```

### 3. Initialize Pools

```bash
# Edit scripts/initialize-pool.ts with mainnet token mints
anchor run initialize-pool --provider.cluster mainnet
```

### 4. Deploy Backend

#### Option A: DigitalOcean App Platform

1. Push code to GitHub
2. Connect repository to DigitalOcean
3. Configure environment variables
4. Deploy

#### Option B: Docker + Custom Server

```bash
cd backend
docker build -t solana-dex-backend .
docker run -d -p 3001:3001 --env-file .env solana-dex-backend
```

### 5. Deploy Frontend (Vercel)

```bash
cd app
vercel --prod

# Or push to GitHub and connect to Vercel dashboard
```

### 6. Configure DNS

Point your domain to the deployment:
- Frontend: CNAME to Vercel
- Backend API: A record to your server

### 7. Enable SSL

```bash
# Using certbot for custom server
sudo certbot --nginx -d api.yourdomain.com
```

### 8. Setup Monitoring

- Configure DataDog or similar for application monitoring
- Setup Sentry for error tracking
- Enable uptime monitoring (UptimeRobot, Pingdom)
- Configure alerting for critical errors

## Post-Deployment

### 1. Verify Everything Works

- [ ] Wallet connection works
- [ ] Balances display correctly
- [ ] Swap execution successful
- [ ] Transaction history loads
- [ ] Price feeds updating
- [ ] All links work
- [ ] Mobile responsive
- [ ] Performance acceptable

### 2. Announce Launch

- Social media announcement
- Update documentation
- Notify early users
- Submit to DEX aggregators

### 3. Monitor Closely

- Watch error rates
- Monitor transaction success rate
- Check system resources
- Review user feedback

## Rollback Procedure

If critical issues are detected:

1. Pause the pool contract (if emergency pause is implemented)
2. Disable frontend access
3. Investigate the issue
4. Deploy fix to devnet first
5. Test thoroughly
6. Deploy fix to mainnet
7. Re-enable access

## Maintenance

### Regular Updates

```bash
# Update dependencies
npm update
anchor build
anchor test

# Deploy updates
anchor upgrade <PROGRAM_ID> target/deploy/trading_platform.so --provider.cluster mainnet
```

### Database Backups

```bash
# Backup PostgreSQL
pg_dump solana_trading > backup_$(date +%Y%m%d).sql

# Restore
psql solana_trading < backup_20240101.sql
```

## Support Resources

- Documentation: https://docs.solana.com
- Anchor Docs: https://www.anchor-lang.com
- Discord: Solana Developer Discord
- Stack Overflow: Tag `solana`

## Emergency Contacts

- Lead Developer: [contact info]
- DevOps: [contact info]
- Security: [contact info]
