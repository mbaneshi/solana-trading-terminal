# Architecture

## Overview

The Solana Trading Terminal is a full-stack DEX-style app: on-chain program (AMM + swap + liquidity), backend (RPC, price, API), and web frontend (wallet, swap UI, portfolio).

## Components

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js)                                         │
│  Wallet adapter, Swap UI, Balance, Transaction history      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│  Backend (Node.js)                                          │
│  Solana RPC client, price service, swap API, WebSocket       │
└──────────────────────────┬──────────────────────────────────┘
                           │ RPC / submit tx
┌──────────────────────────▼──────────────────────────────────┐
│  Solana (programs/trading-platform)                          │
│  Initialize pool, add/remove liquidity, swap                │
└─────────────────────────────────────────────────────────────┘
```

## Data flow

- **Swap:** User signs swap in app → backend (or frontend) builds instruction → program executes swap and updates pool state.
- **Liquidity:** Add/remove liquidity instructions update pool and mint/burn LP tokens.
- **Prices / balances:** Backend or frontend reads program and token accounts via RPC; optional price oracle for USD.

## Key design decisions

- **AMM model:** Constant-product pools for predictable pricing and simpler on-chain logic.
- **Anchor:** IDL and client generation; consistent error and account handling.
- **Separation:** Program holds state; backend handles RPC, caching, and optional order/analytics.

## Repo layout

- `programs/trading-platform/` — Anchor program (Rust)
- `app/` — Next.js frontend
- `backend/` — Node API and Solana service
- `migrations/` — SQL (if backend uses DB)
- `docs/` — Architecture, concepts, tutorials
