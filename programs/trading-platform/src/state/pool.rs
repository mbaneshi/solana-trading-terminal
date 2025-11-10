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
    pub is_paused: bool,             // 1 byte
    pub bump: u8,                    // 1 byte
}

impl LiquidityPool {
    pub const LEN: usize = 8 + // discriminator
        32 + 32 + 32 + 32 + 32 + 32 + // pubkeys
        8 + 8 + 8 + 8 + // u64s
        1 + 1; // bools and bump

    pub fn calculate_lp_tokens(&self, amount_a: u64, amount_b: u64, total_supply: u64) -> Result<u64> {
        if total_supply == 0 {
            // First liquidity provider - use geometric mean
            Ok(((amount_a as u128)
                .checked_mul(amount_b as u128)
                .unwrap())
                .integer_sqrt() as u64)
        } else {
            // Calculate based on ratio
            let lp_from_a = (amount_a as u128)
                .checked_mul(total_supply as u128)
                .unwrap()
                .checked_div(self.reserve_a as u128)
                .unwrap() as u64;

            let lp_from_b = (amount_b as u128)
                .checked_mul(total_supply as u128)
                .unwrap()
                .checked_div(self.reserve_b as u128)
                .unwrap() as u64;

            Ok(std::cmp::min(lp_from_a, lp_from_b))
        }
    }
}

// Helper trait for integer square root
pub trait IntegerSquareRoot {
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
