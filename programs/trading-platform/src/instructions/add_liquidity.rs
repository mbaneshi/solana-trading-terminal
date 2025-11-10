use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, MintTo};
use crate::state::LiquidityPool;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"pool", pool.token_a_mint.as_ref(), pool.token_b_mint.as_ref()],
        bump = pool.bump,
    )]
    pub pool: Account<'info, LiquidityPool>,

    #[account(
        mut,
        constraint = user_token_a.owner == user.key() @ ErrorCode::InvalidTokenAccount,
        constraint = user_token_a.mint == pool.token_a_mint @ ErrorCode::InvalidTokenMint,
    )]
    pub user_token_a: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_b.owner == user.key() @ ErrorCode::InvalidTokenAccount,
        constraint = user_token_b.mint == pool.token_b_mint @ ErrorCode::InvalidTokenMint,
    )]
    pub user_token_b: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_lp_token.owner == user.key() @ ErrorCode::InvalidTokenAccount,
        constraint = user_lp_token.mint == pool.lp_token_mint @ ErrorCode::InvalidTokenMint,
    )]
    pub user_lp_token: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = pool_token_a.key() == pool.token_a_vault @ ErrorCode::InvalidTokenAccount,
    )]
    pub pool_token_a: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = pool_token_b.key() == pool.token_b_vault @ ErrorCode::InvalidTokenAccount,
    )]
    pub pool_token_b: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = lp_token_mint.key() == pool.lp_token_mint @ ErrorCode::InvalidTokenMint,
    )]
    pub lp_token_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<AddLiquidity>,
    amount_a: u64,
    amount_b: u64,
    min_liquidity: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    // Check if pool is paused
    require!(!pool.is_paused, ErrorCode::PoolPaused);

    // Validate amounts
    require!(amount_a > 0 && amount_b > 0, ErrorCode::AmountTooSmall);

    // Check user balances
    require!(
        ctx.accounts.user_token_a.amount >= amount_a,
        ErrorCode::InsufficientBalance
    );
    require!(
        ctx.accounts.user_token_b.amount >= amount_b,
        ErrorCode::InsufficientBalance
    );

    let total_supply = ctx.accounts.lp_token_mint.supply;

    // Calculate LP tokens to mint
    let liquidity = if total_supply == 0 {
        // First liquidity provider - use geometric mean
        let liq = ((amount_a as u128)
            .checked_mul(amount_b as u128)
            .ok_or(ErrorCode::MathOverflow)?)
            .integer_sqrt() as u64;

        // Ensure minimum liquidity
        require!(liq > 1000, ErrorCode::AmountTooSmall);

        liq - 1000 // Lock first 1000 LP tokens
    } else {
        // Calculate based on ratio - use minimum to maintain balance
        let lp_from_a = (amount_a as u128)
            .checked_mul(total_supply as u128)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(pool.reserve_a as u128)
            .ok_or(ErrorCode::MathOverflow)? as u64;

        let lp_from_b = (amount_b as u128)
            .checked_mul(total_supply as u128)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(pool.reserve_b as u128)
            .ok_or(ErrorCode::MathOverflow)? as u64;

        std::cmp::min(lp_from_a, lp_from_b)
    };

    // Check slippage protection
    require!(
        liquidity >= min_liquidity,
        ErrorCode::SlippageExceeded
    );

    // Transfer token A from user to pool
    let transfer_a = Transfer {
        from: ctx.accounts.user_token_a.to_account_info(),
        to: ctx.accounts.pool_token_a.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_a,
        ),
        amount_a,
    )?;

    // Transfer token B from user to pool
    let transfer_b = Transfer {
        from: ctx.accounts.user_token_b.to_account_info(),
        to: ctx.accounts.pool_token_b.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_b,
        ),
        amount_b,
    )?;

    // Mint LP tokens to user
    let seeds = &[
        b"pool",
        pool.token_a_mint.as_ref(),
        pool.token_b_mint.as_ref(),
        &[pool.bump],
    ];
    let signer = &[&seeds[..]];

    let mint_to = MintTo {
        mint: ctx.accounts.lp_token_mint.to_account_info(),
        to: ctx.accounts.user_lp_token.to_account_info(),
        authority: pool.to_account_info(),
    };
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            mint_to,
            signer,
        ),
        liquidity,
    )?;

    // Update pool reserves
    pool.reserve_a = pool.reserve_a.checked_add(amount_a).ok_or(ErrorCode::MathOverflow)?;
    pool.reserve_b = pool.reserve_b.checked_add(amount_b).ok_or(ErrorCode::MathOverflow)?;

    emit!(LiquidityAddedEvent {
        user: ctx.accounts.user.key(),
        amount_a,
        amount_b,
        liquidity,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

// Helper trait for integer square root
trait IntegerSquareRoot {
    fn integer_sqrt(&self) -> Self;
}

impl IntegerSquareRoot for u128 {
    fn integer_sqrt(&self) -> Self {
        let mut x = *self;
        let mut y = (x + 1) / 2;
        while y < x {
            x = y;
            y = (x + self / x) / 2;
        }
        x
    }
}

#[event]
pub struct LiquidityAddedEvent {
    pub user: Pubkey,
    pub amount_a: u64,
    pub amount_b: u64,
    pub liquidity: u64,
    pub timestamp: i64,
}
