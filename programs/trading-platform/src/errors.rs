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

    #[msg("Invalid fee")]
    InvalidFee,

    #[msg("Pool is paused")]
    PoolPaused,

    #[msg("Invalid token account")]
    InvalidTokenAccount,

    #[msg("High price impact")]
    HighPriceImpact,
}
