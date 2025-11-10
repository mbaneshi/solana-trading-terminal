# Solana Trading Platform - Technical Requirements Document

## Table of Contents
1. [Technical Specifications](#1-technical-specifications)
2. [Functional Requirements](#2-functional-requirements)
3. [Implementation Guide](#3-implementation-guide)
4. [Smart Contract Requirements](#4-smart-contract-requirements)
5. [Deployment](#5-deployment)

---

## 1. TECHNICAL SPECIFICATIONS

### 1.1 Solana Smart Contract Specifications (Rust/Anchor)

#### Development Framework
- **Language:** Rust 1.70+
- **Framework:** Anchor Framework 0.28+
- **Solana Version:** 1.16+
- **Build Tools:**
  - Cargo for Rust compilation
  - Anchor CLI for program deployment
  - Solana CLI for cluster management

#### Program Architecture
```
programs/
├── trading-platform/
│   ├── src/
│   │   ├── lib.rs              # Main program entry
│   │   ├── instructions/       # Instruction handlers
│   │   │   ├── initialize.rs
│   │   │   ├── swap.rs
│   │   │   ├── add_liquidity.rs
│   │   │   └── remove_liquidity.rs
│   │   ├── state/              # Account structures
│   │   │   ├── pool.rs
│   │   │   ├── user.rs
│   │   │   └── config.rs
│   │   ├── errors.rs           # Custom error types
│   │   └── utils.rs            # Helper functions
│   └── Cargo.toml
```

#### Core Dependencies
```toml
[dependencies]
anchor-lang = "0.28.0"
anchor-spl = "0.28.0"
solana-program = "1.16"
spl-token = "4.0"
spl-associated-token-account = "2.0"
```

#### Program Requirements
- **Program ID:** Generated during deployment, upgradeable
- **SPL Token Support:** Full compatibility with SPL Token Program
- **Account Rent Exemption:** All accounts must be rent-exempt
- **Cross-Program Invocation (CPI):** Support for SPL token transfers
- **PDA (Program Derived Addresses):** For pool and vault accounts

### 1.2 Frontend Stack (React/Next.js with TypeScript)

#### Core Technologies
```json
{
  "framework": "Next.js 14+",
  "runtime": "Node.js 18+",
  "language": "TypeScript 5+",
  "package-manager": "npm or yarn"
}
```

#### Required Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@solana/web3.js": "^1.87.0",
    "@solana/wallet-adapter-base": "^0.9.23",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-wallets": "^0.19.32",
    "@project-serum/anchor": "^0.28.0",
    "@coral-xyz/anchor": "^0.28.0",
    "spl-token": "^0.3.9"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

#### UI/UX Framework Options
- **Styling:** Tailwind CSS (recommended) or Material-UI
- **Components:** shadcn/ui, Ant Design, or custom components
- **Charts:** TradingView Widget, Recharts, or Chart.js
- **Icons:** Lucide React or Heroicons

#### State Management
- **Option A:** Zustand (lightweight, recommended)
- **Option B:** Redux Toolkit (complex applications)
- **Option C:** Recoil (concurrent mode support)

#### Project Structure
```
frontend/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── trade/
│   │   └── portfolio/
│   ├── components/
│   │   ├── wallet/
│   │   │   ├── WalletConnectButton.tsx
│   │   │   └── WalletProvider.tsx
│   │   ├── trading/
│   │   │   ├── SwapInterface.tsx
│   │   │   ├── TokenSelector.tsx
│   │   │   └── PriceDisplay.tsx
│   │   ├── portfolio/
│   │   │   ├── BalanceCard.tsx
│   │   │   └── TransactionHistory.tsx
│   │   └── common/
│   ├── hooks/
│   │   ├── useWallet.ts
│   │   ├── useProgram.ts
│   │   ├── useBalance.ts
│   │   └── useSwap.ts
│   ├── utils/
│   │   ├── connection.ts
│   │   ├── formatting.ts
│   │   └── constants.ts
│   ├── types/
│   └── styles/
├── public/
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

### 1.3 Backend Services Architecture

#### Technology Stack Options

**Option A: Node.js/TypeScript (Recommended)**
```
Backend Stack:
├── Runtime: Node.js 18+
├── Framework: NestJS or Express.js
├── Language: TypeScript 5+
├── Database: PostgreSQL 15+
├── Caching: Redis 7+
├── WebSocket: Socket.io or ws
└── API Documentation: Swagger/OpenAPI
```

**Option B: Python**
```
Backend Stack:
├── Runtime: Python 3.11+
├── Framework: FastAPI or Django
├── Database: PostgreSQL 15+
├── Caching: Redis 7+
├── WebSocket: FastAPI WebSocket
└── API Documentation: FastAPI auto-docs
```

#### Core Backend Services

1. **Transaction Service**
   - Monitor blockchain transactions
   - Submit and confirm transactions
   - Transaction history indexing
   - Signature tracking

2. **Price Service**
   - Real-time price feeds
   - Historical price data
   - Price oracle integration
   - WebSocket price updates

3. **User Service**
   - Session management
   - User preferences
   - Wallet tracking
   - Activity logging

4. **Analytics Service**
   - Trading volume metrics
   - User statistics
   - Platform analytics
   - Reporting

#### Database Schema (PostgreSQL)
```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(44) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP,
    preferences JSONB
);

-- Transactions table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    signature VARCHAR(88) UNIQUE NOT NULL,
    user_wallet VARCHAR(44) NOT NULL,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    token_in VARCHAR(44),
    token_out VARCHAR(44),
    amount_in BIGINT,
    amount_out BIGINT,
    fee BIGINT,
    created_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP,
    slot BIGINT,
    FOREIGN KEY (user_wallet) REFERENCES users(wallet_address)
);

CREATE INDEX idx_transactions_wallet ON transactions(user_wallet);
CREATE INDEX idx_transactions_signature ON transactions(signature);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Price history table
CREATE TABLE price_history (
    id SERIAL PRIMARY KEY,
    token_mint VARCHAR(44) NOT NULL,
    price_usd DECIMAL(20, 10) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_price_history_token ON price_history(token_mint, timestamp DESC);
```

#### API Structure
```
Backend API Endpoints:
├── /api/v1/
│   ├── /health                 # Health check
│   ├── /auth/
│   │   ├── POST /connect      # Wallet authentication
│   │   └── POST /disconnect   # Session cleanup
│   ├── /wallet/
│   │   ├── GET /balance       # Get wallet balances
│   │   └── GET /tokens        # Get token list
│   ├── /trade/
│   │   ├── POST /swap         # Execute swap
│   │   ├── GET /quote         # Get swap quote
│   │   └── GET /pools         # List liquidity pools
│   ├── /transactions/
│   │   ├── GET /history       # Transaction history
│   │   └── GET /:signature    # Transaction details
│   ├── /prices/
│   │   ├── GET /current       # Current prices
│   │   └── GET /history       # Historical prices
│   └── /ws/                   # WebSocket endpoint
```

#### Environment Configuration
```env
# Solana Configuration
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_WSS_URL=wss://api.mainnet-beta.solana.com
PROGRAM_ID=YourProgramIDHere
DEVNET_RPC_URL=https://api.devnet.solana.com

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/solana_trading
REDIS_URL=redis://localhost:6379

# API Configuration
PORT=3001
API_VERSION=v1
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Security
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000

# External Services
PYTH_PRICE_FEED_URL=https://pyth.network
COINGECKO_API_KEY=your-api-key
```

### 1.4 Wallet Integration (@solana/wallet-adapter)

#### Supported Wallets
- Phantom Wallet (most popular)
- Solflare
- Sollet
- Ledger Hardware Wallet
- Slope
- Backpack
- Glow
- Exodus

#### Wallet Adapter Setup
```typescript
// components/wallet/WalletProvider.tsx
import { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  LedgerWalletAdapter,
  BackpackWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

export function WalletContextProvider({ children }) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new LedgerWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

#### Wallet Connection Requirements
- Auto-connect on page load (if previously connected)
- Persistent wallet state (localStorage)
- Disconnect handling
- Connection error handling
- Multi-wallet switching
- Transaction signing
- Message signing (for authentication)

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 Wallet Connection with Multiple Wallet Support

#### FR-WC-001: Wallet Connection Flow
- **Priority:** P0 (Critical)
- **Description:** Users must be able to connect their Solana wallet
- **Acceptance Criteria:**
  - Display "Connect Wallet" button prominently
  - Show modal with supported wallet options
  - Connect to selected wallet with one click
  - Display wallet address after connection (truncated format)
  - Show connection status indicator
  - Handle wallet rejection gracefully

#### FR-WC-002: Wallet State Management
- **Priority:** P0 (Critical)
- **Description:** Maintain wallet connection state
- **Acceptance Criteria:**
  - Persist connection state across page refreshes
  - Auto-reconnect on page load if previously connected
  - Clear state on manual disconnect
  - Handle wallet account changes
  - Handle network changes

#### FR-WC-003: Multi-Wallet Support
- **Priority:** P0 (Critical)
- **Description:** Support multiple wallet providers
- **Minimum Supported Wallets:**
  - Phantom (required)
  - Solflare (required)
  - Ledger (recommended)
  - Backpack (recommended)
- **Acceptance Criteria:**
  - Display all available wallets in connection modal
  - Detect installed wallets
  - Show "Install" link for non-installed wallets
  - Switch between wallets without page refresh

#### FR-WC-004: Disconnect Functionality
- **Priority:** P0 (Critical)
- **Description:** Users can disconnect their wallet
- **Acceptance Criteria:**
  - Disconnect button accessible from UI
  - Clear all session data on disconnect
  - Return to pre-connected state
  - Show confirmation message

### 2.2 Spot Trading (AMM or Order Book)

#### Trading Model Decision
**Recommended for MVP: AMM (Automated Market Maker)**

#### FR-TR-001: Token Selection
- **Priority:** P0 (Critical)
- **Description:** Users can select tokens to trade
- **Acceptance Criteria:**
  - Display token selector for "From" token
  - Display token selector for "To" token
  - Show token logos and symbols
  - Search functionality for tokens
  - Display token balance for "From" token
  - Support SOL and SPL tokens

#### FR-TR-002: Amount Input
- **Priority:** P0 (Critical)
- **Description:** Users can input trade amounts
- **Acceptance Criteria:**
  - Numeric input field for amount
  - "Max" button to use full balance
  - Real-time balance validation
  - Prevent overdraft attempts
  - Support decimal places (up to token decimals)
  - Display USD equivalent value

#### FR-TR-003: Price Calculation (AMM)
- **Priority:** P0 (Critical)
- **Description:** Calculate swap price using AMM formula
- **AMM Formula:** Constant Product (x * y = k)
- **Acceptance Criteria:**
  - Calculate output amount based on input
  - Display exchange rate
  - Show price impact percentage
  - Update calculations in real-time
  - Handle slippage calculations

#### FR-TR-004: Slippage Settings
- **Priority:** P1 (High)
- **Description:** Users can set slippage tolerance
- **Default:** 1%
- **Options:** 0.1%, 0.5%, 1%, 3%, Custom
- **Acceptance Criteria:**
  - Slippage setting accessible in UI
  - Persist user preference
  - Calculate minimum output amount
  - Display warning for high slippage
  - Reject transaction if slippage exceeded

#### FR-TR-005: Transaction Preview
- **Priority:** P0 (Critical)
- **Description:** Display transaction details before confirmation
- **Acceptance Criteria:**
  - Show input amount and token
  - Show output amount and token
  - Show exchange rate
  - Show price impact
  - Show estimated network fee
  - Show minimum received (after slippage)
  - Display total cost breakdown

#### FR-TR-006: Swap Execution
- **Priority:** P0 (Critical)
- **Description:** Execute the swap transaction
- **Acceptance Criteria:**
  - Request wallet signature
  - Submit transaction to blockchain
  - Display transaction status (pending)
  - Poll for confirmation
  - Handle transaction failure
  - Display success message with transaction signature
  - Link to Solana Explorer

#### FR-TR-007: Order Book Trading (Alternative)
- **Priority:** P2 (Nice to Have)
- **Description:** Support limit orders via order book
- **Acceptance Criteria:**
  - Display order book (bids/asks)
  - Place limit order
  - Place market order
  - Cancel pending orders
  - View open orders
  - Partial fill support

### 2.3 Real-Time Balance Display

#### FR-BAL-001: Initial Balance Fetch
- **Priority:** P0 (Critical)
- **Description:** Display wallet balances on connection
- **Acceptance Criteria:**
  - Fetch SOL balance
  - Fetch all SPL token balances
  - Display in organized list
  - Show token logos and symbols
  - Display amounts with correct decimals

#### FR-BAL-002: Multi-Token Support
- **Priority:** P0 (Critical)
- **Description:** Support all SPL tokens in wallet
- **Acceptance Criteria:**
  - Detect all token accounts
  - Display token metadata (name, symbol, logo)
  - Handle unknown tokens gracefully
  - Sort by value (descending)

#### FR-BAL-003: USD Value Conversion
- **Priority:** P1 (High)
- **Description:** Show USD value for each token
- **Acceptance Criteria:**
  - Fetch current prices
  - Calculate USD value for each token
  - Display total portfolio value
  - Update prices periodically
  - Handle tokens without price data

#### FR-BAL-004: Real-Time Updates
- **Priority:** P1 (High)
- **Description:** Update balances automatically
- **Acceptance Criteria:**
  - Subscribe to wallet account changes
  - Update balance on transaction confirmation
  - Use WebSocket for real-time updates
  - Fallback to polling (15-second interval)
  - Optimistic UI updates

#### FR-BAL-005: Portfolio Overview
- **Priority:** P1 (High)
- **Description:** Display portfolio summary
- **Acceptance Criteria:**
  - Total portfolio value in USD
  - 24h change percentage
  - Individual token allocations
  - Performance chart (optional)

### 2.4 Transaction History

#### FR-TXN-001: Transaction List
- **Priority:** P1 (High)
- **Description:** Display user's transaction history
- **Acceptance Criteria:**
  - List all transactions for connected wallet
  - Show most recent first (descending)
  - Paginate results (20 per page)
  - Display transaction type (swap, transfer, etc.)
  - Show transaction status (success, failed, pending)
  - Display timestamp (relative and absolute)

#### FR-TXN-002: Transaction Details
- **Priority:** P1 (High)
- **Description:** View detailed transaction information
- **Acceptance Criteria:**
  - Transaction signature (copyable)
  - Block number and slot
  - Timestamp
  - Transaction type
  - From token and amount
  - To token and amount
  - Fee paid
  - Status and confirmations
  - Link to Solana Explorer
  - Link to SolScan

#### FR-TXN-003: Transaction Filtering
- **Priority:** P2 (Nice to Have)
- **Description:** Filter transactions by criteria
- **Filter Options:**
  - Transaction type (all, swap, transfer, etc.)
  - Status (all, success, failed)
  - Date range
  - Token involved
- **Acceptance Criteria:**
  - Apply filters without page reload
  - Combine multiple filters
  - Clear all filters option

#### FR-TXN-004: Transaction Search
- **Priority:** P2 (Nice to Have)
- **Description:** Search transactions by signature or token
- **Acceptance Criteria:**
  - Search input field
  - Search by transaction signature
  - Search by token symbol
  - Highlight matching results

#### FR-TXN-005: Export Functionality
- **Priority:** P2 (Nice to Have)
- **Description:** Export transaction history
- **Acceptance Criteria:**
  - Export to CSV format
  - Include all transaction details
  - Filter exported data by date range
  - Download file directly

### 2.5 Price Feed Integration

#### FR-PRICE-001: Real-Time Prices
- **Priority:** P0 (Critical)
- **Description:** Display current token prices
- **Acceptance Criteria:**
  - Fetch prices from oracle (Pyth Network recommended)
  - Display price per token
  - Update every 5-10 seconds
  - Show price change (24h)
  - Handle price feed failures gracefully

#### FR-PRICE-002: Price Chart
- **Priority:** P2 (Nice to Have)
- **Description:** Display price history chart
- **Timeframes:** 1h, 4h, 1d, 1w, 1m
- **Acceptance Criteria:**
  - Interactive candlestick or line chart
  - Zoom and pan functionality
  - Display price and time on hover
  - Switch between timeframes

#### FR-PRICE-003: Price Alerts (Future)
- **Priority:** P3 (Future)
- **Description:** Notify users of price changes
- **Acceptance Criteria:**
  - Set price alert conditions
  - Receive browser notifications
  - Email notifications (optional)

---

## 3. IMPLEMENTATION GUIDE

### 3.1 Anchor Program Structure

#### Step 1: Initialize Anchor Project
```bash
anchor init solana-trading-platform
cd solana-trading-platform
```

#### Step 2: Define Program Structure

**lib.rs - Main Program Entry**
```rust
use anchor_lang::prelude::*;

declare_id!("YourProgramIDWillBeHere");

pub mod instructions;
pub mod state;
pub mod errors;
pub mod utils;

use instructions::*;

#[program]
pub mod trading_platform {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        fee_numerator: u64,
        fee_denominator: u64,
    ) -> Result<()> {
        instructions::initialize_pool::handler(ctx, fee_numerator, fee_denominator)
    }

    pub fn swap(
        ctx: Context<Swap>,
        amount_in: u64,
        minimum_amount_out: u64,
    ) -> Result<()> {
        instructions::swap::handler(ctx, amount_in, minimum_amount_out)
    }

    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        amount_a: u64,
        amount_b: u64,
        min_liquidity: u64,
    ) -> Result<()> {
        instructions::add_liquidity::handler(ctx, amount_a, amount_b, min_liquidity)
    }

    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        liquidity_amount: u64,
        min_amount_a: u64,
        min_amount_b: u64,
    ) -> Result<()> {
        instructions::remove_liquidity::handler(ctx, liquidity_amount, min_amount_a, min_amount_b)
    }
}
```

**state/pool.rs - Pool Account Structure**
```rust
use anchor_lang::prelude::*;

#[account]
pub struct LiquidityPool {
    pub authority: Pubkey,           // 32 bytes
    pub token_a_mint: Pubkey,        // 32 bytes
    pub token_b_mint: Pubkey,        // 32 bytes
    pub token_a_vault: Pubkey,       // 32 bytes
    pub token_b_vault: Pubkey,       // 32 bytes
    pub lp_token_mint: Pubkey,       // 32 bytes
    pub reserve_a: u64,              // 8 bytes
    pub reserve_b: u64,              // 8 bytes
    pub fee_numerator: u64,          // 8 bytes
    pub fee_denominator: u64,        // 8 bytes
    pub bump: u8,                    // 1 byte
}

impl LiquidityPool {
    pub const LEN: usize = 8 + // discriminator
        32 + 32 + 32 + 32 + 32 + 32 + // pubkeys
        8 + 8 + 8 + 8 + // u64s
        1; // bump
}
```

**instructions/swap.rs - Swap Instruction**
```rust
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::LiquidityPool;
use crate::errors::ErrorCode;
use crate::utils::calculate_swap_amount;

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref()],
        bump = pool.bump,
    )]
    pub pool: Account<'info, LiquidityPool>,

    #[account(mut)]
    pub user_token_in: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_out: Account<'info, TokenAccount>,

    #[account(mut)]
    pub pool_token_in: Account<'info, TokenAccount>,

    #[account(mut)]
    pub pool_token_out: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<Swap>,
    amount_in: u64,
    minimum_amount_out: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    // Calculate output amount using AMM formula
    let amount_out = calculate_swap_amount(
        amount_in,
        ctx.accounts.pool_token_in.amount,
        ctx.accounts.pool_token_out.amount,
        pool.fee_numerator,
        pool.fee_denominator,
    )?;

    // Check slippage protection
    require!(
        amount_out >= minimum_amount_out,
        ErrorCode::SlippageExceeded
    );

    // Transfer tokens from user to pool
    let transfer_to_pool = Transfer {
        from: ctx.accounts.user_token_in.to_account_info(),
        to: ctx.accounts.pool_token_in.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_to_pool,
        ),
        amount_in,
    )?;

    // Transfer tokens from pool to user
    let seeds = &[
        b"pool",
        pool.token_a_mint.as_ref(),
        pool.token_b_mint.as_ref(),
        &[pool.bump],
    ];
    let signer = &[&seeds[..]];

    let transfer_to_user = Transfer {
        from: ctx.accounts.pool_token_out.to_account_info(),
        to: ctx.accounts.user_token_out.to_account_info(),
        authority: pool.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_to_user,
            signer,
        ),
        amount_out,
    )?;

    // Update pool reserves
    ctx.accounts.pool.reserve_a = ctx.accounts.pool_token_in.amount;
    ctx.accounts.pool.reserve_b = ctx.accounts.pool_token_out.amount;

    emit!(SwapEvent {
        user: ctx.accounts.user.key(),
        amount_in,
        amount_out,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct SwapEvent {
    pub user: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
    pub timestamp: i64,
}
```

**utils/calculations.rs - AMM Calculations**
```rust
use anchor_lang::prelude::*;
use crate::errors::ErrorCode;

pub fn calculate_swap_amount(
    amount_in: u64,
    reserve_in: u64,
    reserve_out: u64,
    fee_numerator: u64,
    fee_denominator: u64,
) -> Result<u64> {
    require!(reserve_in > 0 && reserve_out > 0, ErrorCode::InsufficientLiquidity);

    // Apply fee: amount_in_with_fee = amount_in * (1 - fee)
    let amount_in_with_fee = (amount_in as u128)
        .checked_mul(fee_denominator.checked_sub(fee_numerator).unwrap() as u128)
        .unwrap()
        .checked_div(fee_denominator as u128)
        .unwrap();

    // AMM formula: amount_out = (amount_in_with_fee * reserve_out) / (reserve_in + amount_in_with_fee)
    let numerator = amount_in_with_fee
        .checked_mul(reserve_out as u128)
        .unwrap();

    let denominator = (reserve_in as u128)
        .checked_add(amount_in_with_fee)
        .unwrap();

    let amount_out = numerator
        .checked_div(denominator)
        .unwrap() as u64;

    Ok(amount_out)
}

pub fn calculate_price_impact(
    amount_in: u64,
    reserve_in: u64,
    reserve_out: u64,
) -> Result<u64> {
    // Price impact = (amount_in / reserve_in) * 100
    let impact = ((amount_in as u128)
        .checked_mul(10000)
        .unwrap()
        .checked_div(reserve_in as u128)
        .unwrap()) as u64;

    Ok(impact) // Basis points (1% = 100)
}
```

**errors.rs - Custom Error Types**
```rust
use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient liquidity in pool")]
    InsufficientLiquidity,

    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,

    #[msg("Invalid token mint")]
    InvalidTokenMint,

    #[msg("Insufficient user balance")]
    InsufficientBalance,

    #[msg("Amount too small")]
    AmountTooSmall,

    #[msg("Pool already initialized")]
    PoolAlreadyInitialized,

    #[msg("Unauthorized")]
    Unauthorized,

    #[msg("Math overflow")]
    MathOverflow,
}
```

### 3.2 Frontend Wallet Integration

#### Step 1: Setup Wallet Provider

**app/layout.tsx**
```typescript
import { WalletContextProvider } from '@/components/wallet/WalletProvider';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
```

#### Step 2: Create Wallet Connect Component

**components/wallet/WalletConnectButton.tsx**
```typescript
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

export function WalletConnectButton() {
  const { publicKey, connected, disconnect } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-4">
      {connected && publicKey && (
        <div className="text-sm">
          <span className="text-gray-500">Connected: </span>
          <span className="font-mono">
            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
          </span>
        </div>
      )}
      <WalletMultiButton />
    </div>
  );
}
```

#### Step 3: Create Program Hook

**hooks/useProgram.ts**
```typescript
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor';
import { useMemo } from 'react';
import idl from '@/idl/trading_platform.json';

const PROGRAM_ID = 'YourProgramIDHere';

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });

    return new Program(idl as Idl, PROGRAM_ID, provider);
  }, [connection, wallet]);

  return program;
}
```

#### Step 4: Create Swap Hook

**hooks/useSwap.ts**
```typescript
import { useCallback, useState } from 'react';
import { useProgram } from './useProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';

export function useSwap() {
  const program = useProgram();
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeSwap = useCallback(
    async (
      tokenInMint: PublicKey,
      tokenOutMint: PublicKey,
      amountIn: number,
      slippage: number
    ) => {
      if (!program || !publicKey) {
        throw new Error('Wallet not connected');
      }

      setLoading(true);
      setError(null);

      try {
        // Get pool PDA
        const [poolPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from('pool'),
            tokenInMint.toBuffer(),
            tokenOutMint.toBuffer(),
          ],
          program.programId
        );

        // Get user token accounts
        const userTokenIn = await getAssociatedTokenAddress(
          tokenInMint,
          publicKey
        );
        const userTokenOut = await getAssociatedTokenAddress(
          tokenOutMint,
          publicKey
        );

        // Get pool token accounts
        const poolTokenIn = await getAssociatedTokenAddress(
          tokenInMint,
          poolPda,
          true
        );
        const poolTokenOut = await getAssociatedTokenAddress(
          tokenOutMint,
          poolPda,
          true
        );

        // Calculate minimum amount out with slippage
        const poolAccount = await program.account.liquidityPool.fetch(poolPda);
        const amountOut = calculateSwapAmount(
          amountIn,
          poolAccount.reserveA.toNumber(),
          poolAccount.reserveB.toNumber(),
          poolAccount.feeNumerator.toNumber(),
          poolAccount.feeDenominator.toNumber()
        );
        const minimumAmountOut = Math.floor(amountOut * (1 - slippage / 100));

        // Execute swap
        const tx = await program.methods
          .swap(
            new anchor.BN(amountIn),
            new anchor.BN(minimumAmountOut)
          )
          .accounts({
            user: publicKey,
            pool: poolPda,
            userTokenIn,
            userTokenOut,
            poolTokenIn,
            poolTokenOut,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          })
          .rpc();

        console.log('Swap transaction signature:', tx);
        return tx;
      } catch (err: any) {
        console.error('Swap error:', err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [program, publicKey]
  );

  return { executeSwap, loading, error };
}

function calculateSwapAmount(
  amountIn: number,
  reserveIn: number,
  reserveOut: number,
  feeNum: number,
  feeDenom: number
): number {
  const amountInWithFee = amountIn * (feeDenom - feeNum) / feeDenom;
  return (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
}
```

### 3.3 Backend RPC Integration

#### Solana Connection Setup

**backend/src/services/solana.service.ts**
```typescript
import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SolanaService {
  private connection: Connection;
  private readonly logger = new Logger(SolanaService.name);

  constructor(private configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL');
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  async getBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      this.logger.error(`Error fetching balance: ${error.message}`);
      throw error;
    }
  }

  async getTokenAccounts(walletAddress: string) {
    try {
      const publicKey = new PublicKey(walletAddress);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      return tokenAccounts.value.map(account => ({
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
      }));
    } catch (error) {
      this.logger.error(`Error fetching token accounts: ${error.message}`);
      throw error;
    }
  }

  async getTransactionHistory(
    walletAddress: string,
    limit: number = 20
  ): Promise<ParsedTransactionWithMeta[]> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit }
      );

      const transactions = await Promise.all(
        signatures.map(sig =>
          this.connection.getParsedTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          })
        )
      );

      return transactions.filter(tx => tx !== null);
    } catch (error) {
      this.logger.error(`Error fetching transactions: ${error.message}`);
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
    } catch (error) {
      this.logger.error(`Error confirming transaction: ${error.message}`);
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
}
```

#### WebSocket Real-Time Updates

**backend/src/gateways/price.gateway.ts**
```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SolanaService } from '../services/solana.service';
import { PriceService } from '../services/price.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
})
export class PriceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PriceGateway.name);
  private priceUpdateInterval: NodeJS.Timeout;

  constructor(
    private solanaService: SolanaService,
    private priceService: PriceService
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:prices')
  async handleSubscribePrices(client: Socket, tokens: string[]) {
    this.logger.log(`Client ${client.id} subscribed to prices for: ${tokens}`);

    // Send initial prices
    const prices = await this.priceService.getPrices(tokens);
    client.emit('prices:update', prices);

    // Update prices every 5 seconds
    const interval = setInterval(async () => {
      const updatedPrices = await this.priceService.getPrices(tokens);
      client.emit('prices:update', updatedPrices);
    }, 5000);

    // Store interval to clear on disconnect
    client.data.priceInterval = interval;
  }

  @SubscribeMessage('subscribe:balance')
  async handleSubscribeBalance(client: Socket, walletAddress: string) {
    this.logger.log(`Client ${client.id} subscribed to balance for: ${walletAddress}`);

    // Send initial balance
    const balance = await this.solanaService.getBalance(walletAddress);
    const tokens = await this.solanaService.getTokenAccounts(walletAddress);
    client.emit('balance:update', { balance, tokens });

    // Subscribe to account changes
    const subscriptionId = this.solanaService.subscribeToAccount(
      walletAddress,
      async () => {
        const updatedBalance = await this.solanaService.getBalance(walletAddress);
        const updatedTokens = await this.solanaService.getTokenAccounts(walletAddress);
        client.emit('balance:update', {
          balance: updatedBalance,
          tokens: updatedTokens,
        });
      }
    );

    client.data.balanceSubscription = subscriptionId;
  }

  @SubscribeMessage('unsubscribe:balance')
  handleUnsubscribeBalance(client: Socket) {
    if (client.data.balanceSubscription) {
      this.solanaService.unsubscribe(client.data.balanceSubscription);
      delete client.data.balanceSubscription;
    }
  }
}
```

### 3.4 Trading Mechanism (Swap Logic)

#### AMM Swap Flow

1. **User Initiates Swap**
   - Select input token and amount
   - Select output token
   - Set slippage tolerance

2. **Calculate Output Amount**
   - Fetch pool reserves
   - Apply AMM formula: `amount_out = (amount_in * reserve_out) / (reserve_in + amount_in)`
   - Subtract fee: `amount_out = amount_out * (1 - fee_rate)`
   - Calculate minimum output with slippage: `min_out = amount_out * (1 - slippage)`

3. **Validate Transaction**
   - Check user has sufficient balance
   - Check pool has sufficient liquidity
   - Verify slippage is acceptable
   - Calculate price impact

4. **Execute Swap**
   - Transfer input tokens from user to pool
   - Transfer output tokens from pool to user
   - Update pool reserves
   - Emit swap event

5. **Confirm Transaction**
   - Wait for blockchain confirmation
   - Update UI with new balances
   - Add to transaction history

### 3.5 Price Oracle Integration

#### Pyth Network Integration (Recommended)

**Installation**
```bash
npm install @pythnetwork/client
```

**backend/src/services/price.service.ts**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';
import { PythHttpClient, getPythProgramKeyForCluster } from '@pythnetwork/client';

@Injectable()
export class PriceService {
  private pythClient: PythHttpClient;
  private readonly logger = new Logger(PriceService.name);

  // Pyth price feed addresses (Mainnet)
  private readonly PRICE_FEEDS = {
    'SOL/USD': new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'),
    'USDC/USD': new PublicKey('Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD'),
    'USDT/USD': new PublicKey('3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL'),
    // Add more feeds as needed
  };

  constructor() {
    const connection = new Connection(process.env.SOLANA_RPC_URL);
    const pythPublicKey = getPythProgramKeyForCluster('mainnet-beta');
    this.pythClient = new PythHttpClient(connection, pythPublicKey);
  }

  async getPrices(tokens: string[]): Promise<Record<string, number>> {
    try {
      const prices: Record<string, number> = {};

      for (const token of tokens) {
        const feedKey = `${token}/USD`;
        const feedAddress = this.PRICE_FEEDS[feedKey];

        if (!feedAddress) {
          this.logger.warn(`No price feed for ${token}`);
          continue;
        }

        const priceData = await this.pythClient.getAssetPriceFromWebEndpoint(
          feedAddress.toBase58()
        );

        if (priceData) {
          prices[token] = priceData.price;
        }
      }

      return prices;
    } catch (error) {
      this.logger.error(`Error fetching prices: ${error.message}`);
      throw error;
    }
  }

  async getHistoricalPrices(
    token: string,
    startTime: number,
    endTime: number
  ): Promise<Array<{ timestamp: number; price: number }>> {
    // Implement historical price fetching
    // This may require integration with a different service like CoinGecko
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${token.toLowerCase()}/market_chart/range?vs_currency=usd&from=${startTime}&to=${endTime}`
      );
      const data = await response.json();

      return data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
      }));
    } catch (error) {
      this.logger.error(`Error fetching historical prices: ${error.message}`);
      return [];
    }
  }
}
```

#### Alternative: CoinGecko API

**backend/src/services/coingecko.service.ts**
```typescript
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  private readonly BASE_URL = 'https://api.coingecko.com/api/v3';

  constructor(private httpService: HttpService) {}

  async getPrice(coinId: string): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.BASE_URL}/simple/price`, {
          params: {
            ids: coinId,
            vs_currencies: 'usd',
          },
        })
      );

      return response.data[coinId]?.usd || 0;
    } catch (error) {
      this.logger.error(`Error fetching price from CoinGecko: ${error.message}`);
      throw error;
    }
  }

  async getMultiplePrices(coinIds: string[]): Promise<Record<string, number>> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.BASE_URL}/simple/price`, {
          params: {
            ids: coinIds.join(','),
            vs_currencies: 'usd',
          },
        })
      );

      const prices: Record<string, number> = {};
      for (const coinId of coinIds) {
        prices[coinId] = response.data[coinId]?.usd || 0;
      }

      return prices;
    } catch (error) {
      this.logger.error(`Error fetching prices from CoinGecko: ${error.message}`);
      throw error;
    }
  }
}
```

---

## 4. SMART CONTRACT REQUIREMENTS

### 4.1 Program Instructions

#### Instruction 1: Initialize Pool
**Purpose:** Create a new liquidity pool for a token pair

**Accounts:**
- `authority` (signer): Pool creator
- `pool` (writable, PDA): Pool account
- `token_a_mint` (read): Token A mint address
- `token_b_mint` (read): Token B mint address
- `token_a_vault` (writable): Pool's Token A vault
- `token_b_vault` (writable): Pool's Token B vault
- `lp_token_mint` (writable): LP token mint
- `system_program` (read): System program
- `token_program` (read): Token program
- `rent` (read): Rent sysvar

**Arguments:**
- `fee_numerator: u64`: Fee numerator (e.g., 25 for 0.25%)
- `fee_denominator: u64`: Fee denominator (e.g., 10000)

**Validation:**
- Fee must be reasonable (<5%)
- Tokens must be different
- Pool must not already exist

#### Instruction 2: Add Liquidity
**Purpose:** Add liquidity to an existing pool

**Accounts:**
- `user` (signer): Liquidity provider
- `pool` (writable, PDA): Pool account
- `user_token_a` (writable): User's Token A account
- `user_token_b` (writable): User's Token B account
- `user_lp_token` (writable): User's LP token account
- `pool_token_a` (writable): Pool's Token A vault
- `pool_token_b` (writable): Pool's Token B vault
- `lp_token_mint` (writable): LP token mint
- `token_program` (read): Token program

**Arguments:**
- `amount_a: u64`: Amount of Token A to deposit
- `amount_b: u64`: Amount of Token B to deposit
- `min_liquidity: u64`: Minimum LP tokens to receive

**Validation:**
- Amounts must maintain pool ratio (except first deposit)
- User must have sufficient balance
- Slippage protection via `min_liquidity`

#### Instruction 3: Remove Liquidity
**Purpose:** Remove liquidity from a pool

**Accounts:**
- `user` (signer): Liquidity provider
- `pool` (writable, PDA): Pool account
- `user_token_a` (writable): User's Token A account
- `user_token_b` (writable): User's Token B account
- `user_lp_token` (writable): User's LP token account
- `pool_token_a` (writable): Pool's Token A vault
- `pool_token_b` (writable): Pool's Token B vault
- `lp_token_mint` (writable): LP token mint
- `token_program` (read): Token program

**Arguments:**
- `liquidity_amount: u64`: LP tokens to burn
- `min_amount_a: u64`: Minimum Token A to receive
- `min_amount_b: u64`: Minimum Token B to receive

**Validation:**
- User must have sufficient LP tokens
- Slippage protection via minimums

#### Instruction 4: Swap
**Purpose:** Exchange one token for another

**Accounts:**
- `user` (signer): Trader
- `pool` (writable, PDA): Pool account
- `user_token_in` (writable): User's input token account
- `user_token_out` (writable): User's output token account
- `pool_token_in` (writable): Pool's input token vault
- `pool_token_out` (writable): Pool's output token vault
- `token_program` (read): Token program

**Arguments:**
- `amount_in: u64`: Input token amount
- `minimum_amount_out: u64`: Minimum output amount (slippage protection)

**Validation:**
- User has sufficient input tokens
- Pool has sufficient output tokens
- Output meets minimum requirement
- Calculate and validate price impact

### 4.2 Account Structures

#### LiquidityPool Account
```rust
#[account]
pub struct LiquidityPool {
    pub authority: Pubkey,           // Pool creator/admin
    pub token_a_mint: Pubkey,        // Token A mint address
    pub token_b_mint: Pubkey,        // Token B mint address
    pub token_a_vault: Pubkey,       // Token A vault account
    pub token_b_vault: Pubkey,       // Token B vault account
    pub lp_token_mint: Pubkey,       // LP token mint
    pub reserve_a: u64,              // Token A reserve amount
    pub reserve_b: u64,              // Token B reserve amount
    pub fee_numerator: u64,          // Trading fee numerator
    pub fee_denominator: u64,        // Trading fee denominator
    pub bump: u8,                    // PDA bump seed
}
```

**Size:** 265 bytes
**Rent-exempt minimum:** ~0.00231456 SOL

#### User Position Account (Optional)
```rust
#[account]
pub struct UserPosition {
    pub owner: Pubkey,               // Position owner
    pub pool: Pubkey,                // Associated pool
    pub lp_tokens: u64,              // LP tokens owned
    pub token_a_deposited: u64,      // Historical Token A deposited
    pub token_b_deposited: u64,      // Historical Token B deposited
    pub last_updated: i64,           // Last update timestamp
}
```

### 4.3 Security Checks

#### 1. Access Control
```rust
// Only authority can perform admin actions
pub fn check_authority(ctx: &Context<AdminInstruction>) -> Result<()> {
    require!(
        ctx.accounts.authority.key() == ctx.accounts.pool.authority,
        ErrorCode::Unauthorized
    );
    Ok(())
}
```

#### 2. Reentrancy Protection
- Use Anchor's built-in protection
- No external calls after state changes
- CPI guards in place

#### 3. Integer Overflow/Underflow
```rust
// Use checked arithmetic
let result = value1
    .checked_add(value2)
    .ok_or(ErrorCode::MathOverflow)?;

// Use u128 for intermediate calculations
let intermediate = (value1 as u128)
    .checked_mul(value2 as u128)
    .ok_or(ErrorCode::MathOverflow)?;
```

#### 4. Input Validation
```rust
pub fn validate_swap_inputs(
    amount_in: u64,
    minimum_amount_out: u64,
    reserve_in: u64,
    reserve_out: u64,
) -> Result<()> {
    require!(amount_in > 0, ErrorCode::AmountTooSmall);
    require!(reserve_in > 0, ErrorCode::InsufficientLiquidity);
    require!(reserve_out > 0, ErrorCode::InsufficientLiquidity);
    require!(
        reserve_out > minimum_amount_out,
        ErrorCode::InsufficientLiquidity
    );
    Ok(())
}
```

#### 5. Slippage Protection
```rust
// Always check minimum output
require!(
    amount_out >= minimum_amount_out,
    ErrorCode::SlippageExceeded
);

// Warn on high price impact (>5%)
let price_impact = calculate_price_impact(amount_in, reserve_in, reserve_out)?;
require!(
    price_impact < 500, // 5% in basis points
    ErrorCode::HighPriceImpact
);
```

#### 6. Token Account Validation
```rust
// Verify token accounts belong to correct mints
require!(
    ctx.accounts.user_token_a.mint == ctx.accounts.pool.token_a_mint,
    ErrorCode::InvalidTokenMint
);

// Verify token accounts are owned by correct authorities
require!(
    ctx.accounts.user_token_a.owner == ctx.accounts.user.key(),
    ErrorCode::InvalidTokenAccount
);
```

#### 7. Emergency Pause
```rust
#[account]
pub struct LiquidityPool {
    // ... other fields
    pub is_paused: bool,
}

// Check before operations
pub fn check_not_paused(pool: &LiquidityPool) -> Result<()> {
    require!(!pool.is_paused, ErrorCode::PoolPaused);
    Ok(())
}
```

### 4.4 Test Suite

#### Unit Tests Structure
```
tests/
├── integration.test.ts
├── initialize-pool.test.ts
├── add-liquidity.test.ts
├── remove-liquidity.test.ts
├── swap.test.ts
└── security.test.ts
```

#### Example Test: Swap

**tests/swap.test.ts**
```typescript
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { TradingPlatform } from '../target/types/trading_platform';
import { expect } from 'chai';
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from '@solana/spl-token';

describe('Swap Tests', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TradingPlatform as Program<TradingPlatform>;

  let tokenAMint: anchor.web3.PublicKey;
  let tokenBMint: anchor.web3.PublicKey;
  let userTokenAAccount: anchor.web3.PublicKey;
  let userTokenBAccount: anchor.web3.PublicKey;
  let poolPda: anchor.web3.PublicKey;

  before(async () => {
    // Setup: Create mints, accounts, and initialize pool
    // ... (initialization code)
  });

  it('Successfully executes a swap', async () => {
    const amountIn = new anchor.BN(1000000);
    const minimumAmountOut = new anchor.BN(900000);

    await program.methods
      .swap(amountIn, minimumAmountOut)
      .accounts({
        user: provider.wallet.publicKey,
        pool: poolPda,
        userTokenIn: userTokenAAccount,
        userTokenOut: userTokenBAccount,
        // ... other accounts
      })
      .rpc();

    // Verify balances changed correctly
    const userTokenAInfo = await getAccount(
      provider.connection,
      userTokenAAccount
    );
    expect(userTokenAInfo.amount).to.equal(0); // All swapped
  });

  it('Fails when slippage exceeded', async () => {
    const amountIn = new anchor.BN(1000000);
    const minimumAmountOut = new anchor.BN(9999999999); // Too high

    try {
      await program.methods
        .swap(amountIn, minimumAmountOut)
        .accounts({
          // ... accounts
        })
        .rpc();

      expect.fail('Should have thrown error');
    } catch (err) {
      expect(err.error.errorCode.code).to.equal('SlippageExceeded');
    }
  });

  it('Fails with insufficient liquidity', async () => {
    const amountIn = new anchor.BN(999999999999); // Too large

    try {
      await program.methods
        .swap(amountIn, new anchor.BN(0))
        .accounts({
          // ... accounts
        })
        .rpc();

      expect.fail('Should have thrown error');
    } catch (err) {
      expect(err.error.errorCode.code).to.equal('InsufficientLiquidity');
    }
  });

  it('Correctly calculates fees', async () => {
    const amountIn = new anchor.BN(1000000);
    const expectedFee = 2500; // 0.25% fee

    // Execute swap and verify fee was deducted
    // ... (test implementation)
  });

  it('Updates pool reserves correctly', async () => {
    const poolBefore = await program.account.liquidityPool.fetch(poolPda);
    const reserveABefore = poolBefore.reserveA;
    const reserveBBefore = poolBefore.reserveB;

    const amountIn = new anchor.BN(1000000);
    await program.methods
      .swap(amountIn, new anchor.BN(0))
      .accounts({
        // ... accounts
      })
      .rpc();

    const poolAfter = await program.account.liquidityPool.fetch(poolPda);

    expect(poolAfter.reserveA.toNumber()).to.equal(
      reserveABefore.toNumber() + amountIn.toNumber()
    );
  });
});
```

#### Security Tests

**tests/security.test.ts**
```typescript
describe('Security Tests', () => {
  it('Prevents reentrancy attacks', async () => {
    // Test concurrent transactions
  });

  it('Prevents overflow/underflow', async () => {
    // Test with max values
  });

  it('Prevents unauthorized access', async () => {
    // Test with wrong signer
  });

  it('Validates all inputs', async () => {
    // Test with invalid inputs
  });

  it('Respects pause mechanism', async () => {
    // Test paused pool
  });
});
```

#### Test Coverage Requirements
- Minimum 90% code coverage
- All instructions tested
- All error cases tested
- Edge cases covered
- Integration tests for complete flows

---

## 5. DEPLOYMENT

### 5.1 Devnet Deployment Steps

#### Step 1: Prepare Environment

**1.1 Install Solana CLI**
```bash
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana --version
```

**1.2 Install Anchor CLI**
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
anchor --version
```

**1.3 Configure Solana CLI for Devnet**
```bash
solana config set --url https://api.devnet.solana.com
solana config get
```

**1.4 Create Devnet Wallet**
```bash
solana-keygen new --outfile ~/.config/solana/devnet-wallet.json
solana address
```

**1.5 Airdrop Devnet SOL**
```bash
solana airdrop 5
solana balance
```

#### Step 2: Build Smart Contract

**2.1 Build Program**
```bash
cd programs/trading-platform
anchor build
```

**2.2 Get Program ID**
```bash
solana address -k target/deploy/trading_platform-keypair.json
```

**2.3 Update Program ID in Code**
Update `lib.rs` and `Anchor.toml` with the generated program ID.

**2.4 Rebuild**
```bash
anchor build
```

#### Step 3: Deploy to Devnet

**3.1 Deploy Program**
```bash
anchor deploy --provider.cluster devnet
```

**3.2 Verify Deployment**
```bash
solana program show <PROGRAM_ID> --url devnet
```

**3.3 Initialize Pool (Test)**
```bash
anchor test --provider.cluster devnet
```

#### Step 4: Deploy Backend

**4.1 Set Environment Variables**
```bash
# .env.devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_WSS_URL=wss://api.devnet.solana.com
PROGRAM_ID=<Your_Devnet_Program_ID>
DATABASE_URL=postgresql://user:pass@localhost:5432/solana_trading_dev
NODE_ENV=development
```

**4.2 Setup Database**
```bash
npm run db:migrate
npm run db:seed # Optional
```

**4.3 Start Backend**
```bash
npm run start:dev
```

#### Step 5: Deploy Frontend

**5.1 Configure Frontend**
```bash
# .env.local
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=<Your_Devnet_Program_ID>
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**5.2 Build Frontend**
```bash
npm run build
```

**5.3 Start Frontend**
```bash
npm run dev
```

**5.4 Test on Devnet**
- Connect wallet (set to Devnet)
- Airdrop devnet SOL to test wallet
- Create test token accounts
- Execute test swaps
- Verify transactions on Solana Explorer (devnet)

### 5.2 Mainnet Deployment Checklist

#### Pre-Deployment Checklist

**Security & Testing**
- [ ] All tests passing (100% success rate)
- [ ] Security audit completed and issues resolved
- [ ] Code review by at least 2 developers
- [ ] Penetration testing completed
- [ ] Fuzz testing completed
- [ ] Tested on devnet for at least 1 week
- [ ] Emergency procedures documented
- [ ] Upgrade mechanism tested (if applicable)

**Technical Requirements**
- [ ] Smart contracts optimized for transaction costs
- [ ] Error handling comprehensive
- [ ] Logging and monitoring configured
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] API documentation complete
- [ ] Performance tested under load
- [ ] Database optimized and indexed

**Legal & Compliance**
- [ ] Terms of Service finalized
- [ ] Privacy Policy created
- [ ] Risk disclaimers added
- [ ] Regulatory compliance reviewed
- [ ] Geo-blocking configured (if needed)
- [ ] AML/KYC requirements addressed

**Infrastructure**
- [ ] Production RPC provider selected (QuickNode, Alchemy, Helius)
- [ ] Backup RPC providers configured
- [ ] Database backed up
- [ ] Redis cache configured
- [ ] CDN setup for frontend
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] Monitoring and alerting setup

**Business Requirements**
- [ ] Initial liquidity secured
- [ ] Fee structure finalized
- [ ] Marketing materials ready
- [ ] Customer support plan in place
- [ ] Incident response plan documented

#### Mainnet Deployment Steps

**Step 1: Setup Mainnet Environment**

```bash
# Configure Solana CLI for Mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Create production wallet (use hardware wallet for additional security)
solana-keygen new --outfile ~/.config/solana/mainnet-wallet.json

# Fund wallet with SOL for deployment
# Deployment typically costs 5-20 SOL depending on program size
```

**Step 2: Deploy Smart Contract**

```bash
# Build for mainnet
anchor build --verifiable

# Deploy to mainnet
anchor deploy --provider.cluster mainnet

# Save program ID
PROGRAM_ID=$(solana address -k target/deploy/trading_platform-keypair.json)
echo "Program ID: $PROGRAM_ID"

# Verify deployment
solana program show $PROGRAM_ID
```

**Step 3: Initialize Liquidity Pools**

```bash
# Run initialization script
anchor run initialize-mainnet --provider.cluster mainnet

# Add initial liquidity
# This should be done through a secure script or manually
```

**Step 4: Deploy Backend to Production**

```bash
# Production environment variables
# .env.production
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/YOUR_API_KEY
SOLANA_WSS_URL=wss://mainnet.helius-rpc.com/YOUR_API_KEY
PROGRAM_ID=<Your_Mainnet_Program_ID>
DATABASE_URL=<Production_Database_URL>
REDIS_URL=<Production_Redis_URL>
NODE_ENV=production
PORT=3001

# Build backend
npm run build

# Start with PM2 (process manager)
pm2 start dist/main.js --name solana-trading-api
pm2 save
pm2 startup
```

**Step 5: Deploy Frontend to Production**

**Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
# NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
# NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
# NEXT_PUBLIC_PROGRAM_ID=<Your_Mainnet_Program_ID>
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**Option B: Custom Server**
```bash
# Build production bundle
npm run build

# Start production server
npm run start

# Or use PM2
pm2 start npm --name "solana-trading-frontend" -- start
pm2 save
```

**Step 6: Verification & Testing**

```bash
# Mainnet Testing Checklist
- [ ] Wallet connection works
- [ ] Balances display correctly
- [ ] Swap execution successful
- [ ] Transaction history loads
- [ ] Price feeds updating
- [ ] All links work (Explorer, documentation)
- [ ] Mobile responsive
- [ ] Error handling works
- [ ] Performance acceptable
```

### 5.3 Frontend Deployment

#### Deployment Options Comparison

| Platform | Pros | Cons | Cost |
|----------|------|------|------|
| **Vercel** | Easy setup, auto-deploy, CDN, serverless functions | Vendor lock-in | Free tier, then $20/mo |
| **Netlify** | Similar to Vercel, great DX | Limited build minutes on free tier | Free tier, then $19/mo |
| **AWS Amplify** | Full AWS integration, scalable | More complex setup | Pay-as-you-go |
| **Cloudflare Pages** | Fast CDN, unlimited bandwidth | Newer platform | Free tier, then $20/mo |
| **Custom VPS** | Full control, flexible | Manual setup, maintenance | $5-50/mo |

#### Recommended: Vercel Deployment

**vercel.json**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SOLANA_NETWORK": "mainnet-beta",
    "NEXT_PUBLIC_PROGRAM_ID": "@program-id"
  }
}
```

**Deployment Steps:**
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables
4. Deploy automatically on push to main branch

#### Performance Optimization

**next.config.js**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['raw.githubusercontent.com', 'cdn.jsdelivr.net'],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
```

### 5.4 Backend Deployment

#### Option 1: DigitalOcean App Platform

**app.yaml**
```yaml
name: solana-trading-backend
services:
  - name: api
    github:
      repo: your-username/solana-trading-backend
      branch: main
      deploy_on_push: true
    build_command: npm run build
    run_command: npm run start:prod
    envs:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: "3001"
      - key: SOLANA_RPC_URL
        value: ${SOLANA_RPC_URL}
        type: SECRET
      - key: DATABASE_URL
        value: ${DATABASE_URL}
        type: SECRET
    http_port: 3001
    instance_count: 2
    instance_size_slug: basic-xs

databases:
  - name: trading-db
    engine: PG
    version: "15"
    size: db-s-1vcpu-1gb
```

#### Option 2: AWS ECS with Docker

**Dockerfile**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3001
CMD ["node", "dist/main.js"]
```

**docker-compose.yml**
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - SOLANA_RPC_URL=${SOLANA_RPC_URL}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=solana_trading
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### Monitoring & Logging

**Setup DataDog**
```bash
npm install --save dd-trace

# Add to main.ts
import tracer from 'dd-trace';
tracer.init({
  service: 'solana-trading-api',
  env: process.env.NODE_ENV,
});
```

**Setup Sentry for Error Tracking**
```bash
npm install --save @sentry/node

# Add to main.ts
import * as Sentry from '@sentry/node';
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### Health Checks & Uptime Monitoring

**health.controller.ts**
```typescript
import { Controller, Get } from '@nestjs/common';
import { SolanaService } from './services/solana.service';

@Controller('health')
export class HealthController {
  constructor(private solanaService: SolanaService) {}

  @Get()
  async healthCheck() {
    const rpcHealthy = await this.checkRpcConnection();
    const dbHealthy = await this.checkDatabase();

    return {
      status: rpcHealthy && dbHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        rpc: rpcHealthy ? 'up' : 'down',
        database: dbHealthy ? 'up' : 'down',
      },
    };
  }

  private async checkRpcConnection(): Promise<boolean> {
    try {
      await this.solanaService.connection.getSlot();
      return true;
    } catch {
      return false;
    }
  }

  private async checkDatabase(): Promise<boolean> {
    // Implement database check
    return true;
  }
}
```

---

## 6. OPERATIONAL REQUIREMENTS

### 6.1 Monitoring

- **Blockchain Monitoring:**
  - Transaction success rate
  - Failed transaction analysis
  - Network congestion alerts
  - Program account balances

- **Application Monitoring:**
  - API response times
  - Error rates
  - User activity metrics
  - WebSocket connection health

- **Infrastructure Monitoring:**
  - Server CPU/Memory usage
  - Database performance
  - RPC endpoint latency
  - CDN performance

### 6.2 Maintenance

- **Regular Updates:**
  - Security patches
  - Dependency updates
  - Performance optimizations
  - Feature additions

- **Database Maintenance:**
  - Regular backups (daily)
  - Query optimization
  - Index maintenance
  - Data archival strategy

- **Smart Contract Upgrades:**
  - Testing on devnet first
  - Gradual rollout
  - User notification
  - Rollback plan

### 6.3 Support

- **User Support Channels:**
  - Discord community
  - Email support
  - Documentation site
  - FAQ section

- **Developer Support:**
  - API documentation
  - Code examples
  - Integration guides
  - Troubleshooting guides

---

## 7. SUCCESS METRICS

### Key Performance Indicators (KPIs)

**Technical Metrics:**
- Transaction success rate: >99%
- Average transaction time: <2 seconds
- API response time: <200ms (p95)
- Uptime: >99.9%
- Error rate: <0.1%

**Business Metrics:**
- Total Value Locked (TVL)
- Daily Active Users (DAU)
- Trading volume (24h)
- Number of transactions
- User retention rate

**User Experience Metrics:**
- Wallet connection success rate
- Trade completion rate
- Average time to complete trade
- User satisfaction score

---

## 8. RISK MITIGATION

### Technical Risks

| Risk | Mitigation |
|------|------------|
| Smart contract exploit | Professional audit, bug bounty, gradual rollout |
| RPC outage | Multiple RPC providers, automatic failover |
| Database failure | Regular backups, replication, monitoring |
| Frontend vulnerability | Security headers, CSP, regular security scans |

### Business Risks

| Risk | Mitigation |
|------|------------|
| Low liquidity | Liquidity incentives, partnerships, market making |
| Regulatory issues | Legal counsel, compliance monitoring, geo-blocking |
| Competition | Unique features, better UX, competitive fees |
| Market volatility | Risk warnings, education, insurance (future) |

---

## 9. FUTURE ENHANCEMENTS

### Phase 2 Features (Post-MVP)
- Limit orders
- Stop-loss orders
- Advanced charting
- Portfolio analytics
- Liquidity farming
- Staking rewards
- Governance token
- Mobile app (iOS/Android)
- Trading bots API
- Social features (copy trading)

### Phase 3 Features (Long-term)
- Cross-chain swaps
- Derivatives trading
- Lending/borrowing
- NFT marketplace integration
- Options trading
- Margin trading
- Institutional features
- Advanced analytics
- AI-powered trading signals

---

## CONCLUSION

This requirements document provides a comprehensive blueprint for building a production-ready Solana trading platform. The implementation should prioritize security, user experience, and scalability while maintaining focus on delivering a robust MVP that can be iteratively improved based on user feedback and market demands.

**Key Success Factors:**
1. Security-first approach
2. Comprehensive testing
3. Professional audit before mainnet
4. Strong monitoring and alerting
5. Excellent user experience
6. Clear documentation
7. Responsive support

**Estimated Timeline:** 6-8 weeks for MVP
**Estimated Budget:** $8,000-$12,000 (including audit)
**Risk Level:** Medium-High (requires experienced team)

For questions or clarifications, please refer to the project README.md or contact the development team.
