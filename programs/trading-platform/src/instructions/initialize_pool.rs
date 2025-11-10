use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;
use crate::state::LiquidityPool;
use crate::errors::ErrorCode;
use crate::utils::validate_fee;

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = LiquidityPool::LEN,
        seeds = [b"pool", token_a_mint.key().as_ref(), token_b_mint.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, LiquidityPool>,

    pub token_a_mint: Account<'info, Mint>,
    pub token_b_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = authority,
        token::mint = token_a_mint,
        token::authority = pool,
    )]
    pub token_a_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        token::mint = token_b_mint,
        token::authority = pool,
    )]
    pub token_b_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 9,
        mint::authority = pool,
    )]
    pub lp_token_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitializePool>,
    fee_numerator: u64,
    fee_denominator: u64,
) -> Result<()> {
    let pool = &mut ctx.accounts.pool;

    // Validate fee
    validate_fee(fee_numerator, fee_denominator)?;

    // Ensure tokens are different
    require!(
        ctx.accounts.token_a_mint.key() != ctx.accounts.token_b_mint.key(),
        ErrorCode::InvalidTokenMint
    );

    pool.authority = ctx.accounts.authority.key();
    pool.token_a_mint = ctx.accounts.token_a_mint.key();
    pool.token_b_mint = ctx.accounts.token_b_mint.key();
    pool.token_a_vault = ctx.accounts.token_a_vault.key();
    pool.token_b_vault = ctx.accounts.token_b_vault.key();
    pool.lp_token_mint = ctx.accounts.lp_token_mint.key();
    pool.reserve_a = 0;
    pool.reserve_b = 0;
    pool.fee_numerator = fee_numerator;
    pool.fee_denominator = fee_denominator;
    pool.is_paused = false;
    pool.bump = *ctx.bumps.get("pool").unwrap();

    emit!(PoolInitializedEvent {
        pool: pool.key(),
        token_a: pool.token_a_mint,
        token_b: pool.token_b_mint,
        fee_numerator,
        fee_denominator,
    });

    Ok(())
}

#[event]
pub struct PoolInitializedEvent {
    pub pool: Pubkey,
    pub token_a: Pubkey,
    pub token_b: Pubkey,
    pub fee_numerator: u64,
    pub fee_denominator: u64,
}
