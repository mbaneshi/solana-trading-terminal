use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, Burn};
use crate::state::LiquidityPool;
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct RemoveLiquidity<'info> {
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
    ctx: Context<RemoveLiquidity>,
    liquidity_amount: u64,
    min_amount_a: u64,
    min_amount_b: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    // Validate amount
    require!(liquidity_amount > 0, ErrorCode::AmountTooSmall);

    // Check user has enough LP tokens
    require!(
        ctx.accounts.user_lp_token.amount >= liquidity_amount,
        ErrorCode::InsufficientBalance
    );

    let total_supply = ctx.accounts.lp_token_mint.supply;
    require!(total_supply > 0, ErrorCode::InsufficientLiquidity);

    // Calculate amounts to return
    let amount_a = (liquidity_amount as u128)
        .checked_mul(pool.reserve_a as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(total_supply as u128)
        .ok_or(ErrorCode::MathOverflow)? as u64;

    let amount_b = (liquidity_amount as u128)
        .checked_mul(pool.reserve_b as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(total_supply as u128)
        .ok_or(ErrorCode::MathOverflow)? as u64;

    // Check slippage protection
    require!(
        amount_a >= min_amount_a,
        ErrorCode::SlippageExceeded
    );
    require!(
        amount_b >= min_amount_b,
        ErrorCode::SlippageExceeded
    );

    // Verify pool has enough reserves
    require!(
        pool.reserve_a >= amount_a && pool.reserve_b >= amount_b,
        ErrorCode::InsufficientLiquidity
    );

    // Burn LP tokens
    let burn_ctx = Burn {
        mint: ctx.accounts.lp_token_mint.to_account_info(),
        from: ctx.accounts.user_lp_token.to_account_info(),
        authority: ctx.accounts.user.to_account_info(),
    };
    token::burn(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            burn_ctx,
        ),
        liquidity_amount,
    )?;

    // Transfer token A from pool to user
    let seeds = &[
        b"pool",
        pool.token_a_mint.as_ref(),
        pool.token_b_mint.as_ref(),
        &[pool.bump],
    ];
    let signer = &[&seeds[..]];

    let transfer_a = Transfer {
        from: ctx.accounts.pool_token_a.to_account_info(),
        to: ctx.accounts.user_token_a.to_account_info(),
        authority: pool.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_a,
            signer,
        ),
        amount_a,
    )?;

    // Transfer token B from pool to user
    let transfer_b = Transfer {
        from: ctx.accounts.pool_token_b.to_account_info(),
        to: ctx.accounts.user_token_b.to_account_info(),
        authority: pool.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_b,
            signer,
        ),
        amount_b,
    )?;

    // Update pool reserves
    pool.reserve_a = pool.reserve_a.checked_sub(amount_a).ok_or(ErrorCode::MathOverflow)?;
    pool.reserve_b = pool.reserve_b.checked_sub(amount_b).ok_or(ErrorCode::MathOverflow)?;

    emit!(LiquidityRemovedEvent {
        user: ctx.accounts.user.key(),
        liquidity_amount,
        amount_a,
        amount_b,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct LiquidityRemovedEvent {
    pub user: Pubkey,
    pub liquidity_amount: u64,
    pub amount_a: u64,
    pub amount_b: u64,
    pub timestamp: i64,
}
