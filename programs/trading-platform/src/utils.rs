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
    require!(amount_in > 0, ErrorCode::AmountTooSmall);

    // Apply fee: amount_in_with_fee = amount_in * (1 - fee)
    let amount_in_with_fee = (amount_in as u128)
        .checked_mul(fee_denominator.checked_sub(fee_numerator).ok_or(ErrorCode::InvalidFee)? as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(fee_denominator as u128)
        .ok_or(ErrorCode::MathOverflow)?;

    // AMM formula: amount_out = (amount_in_with_fee * reserve_out) / (reserve_in + amount_in_with_fee)
    let numerator = amount_in_with_fee
        .checked_mul(reserve_out as u128)
        .ok_or(ErrorCode::MathOverflow)?;

    let denominator = (reserve_in as u128)
        .checked_add(amount_in_with_fee)
        .ok_or(ErrorCode::MathOverflow)?;

    let amount_out = numerator
        .checked_div(denominator)
        .ok_or(ErrorCode::MathOverflow)? as u64;

    Ok(amount_out)
}

pub fn calculate_price_impact(
    amount_in: u64,
    reserve_in: u64,
    reserve_out: u64,
) -> Result<u64> {
    require!(reserve_in > 0, ErrorCode::InsufficientLiquidity);

    // Price impact = (amount_in / reserve_in) * 10000
    let impact = ((amount_in as u128)
        .checked_mul(10000)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(reserve_in as u128)
        .ok_or(ErrorCode::MathOverflow)?) as u64;

    Ok(impact) // Basis points (1% = 100)
}

pub fn validate_fee(fee_numerator: u64, fee_denominator: u64) -> Result<()> {
    require!(fee_denominator > 0, ErrorCode::InvalidFee);
    require!(fee_numerator <= fee_denominator, ErrorCode::InvalidFee);

    // Fee should be less than 5%
    let fee_percent = (fee_numerator * 100) / fee_denominator;
    require!(fee_percent <= 5, ErrorCode::InvalidFee);

    Ok(())
}
