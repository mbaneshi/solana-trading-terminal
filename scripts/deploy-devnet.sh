#!/bin/bash

# Deploy to Solana Devnet
echo "Deploying Solana DEX to Devnet..."

# Set Solana CLI to devnet
solana config set --url https://api.devnet.solana.com

# Check balance
echo "Checking SOL balance..."
BALANCE=$(solana balance)
echo "Current balance: $BALANCE"

# Build the program
echo "Building Anchor program..."
anchor build

# Get the program ID
PROGRAM_ID=$(solana address -k target/deploy/trading_platform-keypair.json)
echo "Program ID: $PROGRAM_ID"

# Update program ID in Anchor.toml and lib.rs
sed -i '' "s/trading_platform = \".*\"/trading_platform = \"$PROGRAM_ID\"/" Anchor.toml

# Rebuild with correct program ID
echo "Rebuilding with correct program ID..."
anchor build

# Deploy the program
echo "Deploying program to devnet..."
anchor deploy --provider.cluster devnet

# Verify deployment
echo "Verifying deployment..."
solana program show $PROGRAM_ID --url devnet

echo "✅ Deployment complete!"
echo "Program ID: $PROGRAM_ID"
echo ""
echo "Next steps:"
echo "1. Update NEXT_PUBLIC_PROGRAM_ID in app/.env.local"
echo "2. Update PROGRAM_ID in backend/.env"
echo "3. Initialize pools with scripts/initialize-pool.ts"
