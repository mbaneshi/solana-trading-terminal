#!/bin/bash

echo "================================================"
echo "  Solana DEX Trading Platform - Setup Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Print status
print_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        exit 1
    fi
}

# Check prerequisites
echo "Checking prerequisites..."
echo ""

if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+"
    exit 1
fi

if command_exists cargo; then
    RUST_VERSION=$(cargo --version | cut -d' ' -f2)
    echo -e "${GREEN}✓${NC} Rust $RUST_VERSION"
else
    echo -e "${RED}✗${NC} Rust not found. Please install Rust 1.70+"
    exit 1
fi

if command_exists solana; then
    SOLANA_VERSION=$(solana --version | cut -d' ' -f2)
    echo -e "${GREEN}✓${NC} Solana CLI $SOLANA_VERSION"
else
    echo -e "${RED}✗${NC} Solana CLI not found. Please install Solana CLI 1.16+"
    exit 1
fi

if command_exists anchor; then
    ANCHOR_VERSION=$(anchor --version | cut -d' ' -f3)
    echo -e "${GREEN}✓${NC} Anchor $ANCHOR_VERSION"
else
    echo -e "${RED}✗${NC} Anchor not found. Please install Anchor CLI 0.28+"
    exit 1
fi

echo ""
echo "Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install
print_status "Root dependencies installed"

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd app && npm install && cd ..
print_status "Frontend dependencies installed"

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend && npm install && cd ..
print_status "Backend dependencies installed"

echo ""
echo "Setting up environment files..."
echo ""

# Copy environment files if they don't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Created .env"
else
    echo -e "${YELLOW}⚠${NC} .env already exists, skipping"
fi

if [ ! -f app/.env.local ]; then
    cp app/.env.example app/.env.local
    echo -e "${GREEN}✓${NC} Created app/.env.local"
else
    echo -e "${YELLOW}⚠${NC} app/.env.local already exists, skipping"
fi

if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓${NC} Created backend/.env"
else
    echo -e "${YELLOW}⚠${NC} backend/.env already exists, skipping"
fi

echo ""
echo "Building smart contract..."
echo ""

anchor build
print_status "Smart contract built"

echo ""
echo "Running tests..."
echo ""

anchor test
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} All tests passed"
else
    echo -e "${YELLOW}⚠${NC} Some tests failed, but setup is complete"
fi

echo ""
echo "================================================"
echo "  Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your environment:"
echo "   - Edit .env"
echo "   - Edit app/.env.local"
echo "   - Edit backend/.env"
echo ""
echo "2. Start local Solana validator:"
echo "   solana-test-validator"
echo ""
echo "3. Deploy smart contract:"
echo "   anchor deploy"
echo ""
echo "4. Start backend (in new terminal):"
echo "   cd backend && npm run dev"
echo ""
echo "5. Start frontend (in new terminal):"
echo "   cd app && npm run dev"
echo ""
echo "6. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "For deployment to devnet:"
echo "   ./scripts/deploy-devnet.sh"
echo ""
echo "Documentation:"
echo "   - README.md - Project overview"
echo "   - REQUIREMENTS.md - Complete specifications"
echo "   - DEPLOYMENT.md - Deployment guide"
echo "   - SECURITY.md - Security checklist"
echo "   - PROJECT_SUMMARY.md - Project summary"
echo ""
echo "================================================"
