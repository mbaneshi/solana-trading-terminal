use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::LiquidityPool;
use crate::errors::ErrorCode;
use crate::utils::{calculate_swap_amount, calculate_price_impact};

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

    #[account(
        mut,
        constraint = user_token_in.owner == user.key() @ ErrorCode::InvalidTokenAccount,
    )]
    pub user_token_in: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_out.owner == user.key() @ ErrorCode::InvalidTokenAccount,
    )]
    pub user_token_out: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = pool_token_in.key() == pool.token_a_vault || pool_token_in.key() == pool.token_b_vault @ ErrorCode::InvalidTokenAccount,
    )]
    pub pool_token_in: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = pool_token_out.key() == pool.token_a_vault || pool_token_out.key() == pool.token_b_vault @ ErrorCode::InvalidTokenAccount,
    )]
    pub pool_token_out: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<Swap>,
    amount_in: u64,
    minimum_amount_out: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    // Check if pool is paused
    require!(!pool.is_paused, ErrorCode::PoolPaused);

    // Verify token accounts match pool
    require!(
        (user_token_in.mint == pool.token_a_mint && user_token_out.mint == pool.token_b_mint) ||
        (user_token_in.mint == pool.token_b_mint && user_token_out.mint == pool.token_a_mint),
        ErrorCode::InvalidTokenMint
    );

    // Check user balance
    require!(
        ctx.accounts.user_token_in.amount >= amount_in,
        ErrorCode::InsufficientBalance
    );

    // Get current reserves
    let reserve_in = ctx.accounts.pool_token_in.amount;
    let reserve_out = ctx.accounts.pool_token_out.amount;

    // Calculate output amount using AMM formula
    let amount_out = calculate_swap_amount(
        amount_in,
        reserve_in,
        reserve_out,
        pool.fee_numerator,
        pool.fee_denominator,
    )?;

    // Check slippage protection
    require!(
        amount_out >= minimum_amount_out,
        ErrorCode::SlippageExceeded
    );

    // Check pool has enough liquidity
    require!(
        reserve_out >= amount_out,
        ErrorCode::InsufficientLiquidity
    );

    // Calculate price impact
    let price_impact = calculate_price_impact(amount_in, reserve_in, reserve_out)?;

    // Warn on high price impact (>5%)
    if price_impact > 500 {
        msg!("Warning: High price impact detected: {} bps", price_impact);
    }

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
    if ctx.accounts.pool_token_in.key() == pool.token_a_vault {
        pool.reserve_a = ctx.accounts.pool_token_in.amount + amount_in;
        pool.reserve_b = ctx.accounts.pool_token_out.amount - amount_out;
    } else {
        pool.reserve_b = ctx.accounts.pool_token_in.amount + amount_in;
        pool.reserve_a = ctx.accounts.pool_token_out.amount - amount_out;
    }

    emit!(SwapEvent {
        user: ctx.accounts.user.key(),
        token_in: ctx.accounts.user_token_in.mint,
        token_out: ctx.accounts.user_token_out.mint,
        amount_in,
        amount_out,
        price_impact,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct SwapEvent {
    pub user: Pubkey,
    pub token_in: Pubkey,
    pub token_out: Pubkey,
    pub amount_in: u64,
    pub amount_out: u64,
    pub price_impact: u64,
    pub timestamp: i64,
}
