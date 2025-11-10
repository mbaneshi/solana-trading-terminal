-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(44) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP,
    preferences JSONB
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
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

CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(user_wallet);
CREATE INDEX IF NOT EXISTS idx_transactions_signature ON transactions(signature);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
    id SERIAL PRIMARY KEY,
    token_mint VARCHAR(44) NOT NULL,
    price_usd DECIMAL(20, 10) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_token ON price_history(token_mint, timestamp DESC);

-- Liquidity pools table
CREATE TABLE IF NOT EXISTS liquidity_pools (
    id SERIAL PRIMARY KEY,
    pool_address VARCHAR(44) UNIQUE NOT NULL,
    token_a_mint VARCHAR(44) NOT NULL,
    token_b_mint VARCHAR(44) NOT NULL,
    reserve_a BIGINT NOT NULL,
    reserve_b BIGINT NOT NULL,
    fee_numerator INTEGER NOT NULL,
    fee_denominator INTEGER NOT NULL,
    tvl_usd DECIMAL(20, 2),
    volume_24h DECIMAL(20, 2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pools_tokens ON liquidity_pools(token_a_mint, token_b_mint);
