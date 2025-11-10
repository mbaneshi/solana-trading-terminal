use anchor_lang::prelude::*;

#[account]
pub struct UserPosition {
    pub owner: Pubkey,               // 32 bytes
    pub pool: Pubkey,                // 32 bytes
    pub lp_tokens: u64,              // 8 bytes
    pub token_a_deposited: u64,      // 8 bytes
    pub token_b_deposited: u64,      // 8 bytes
    pub last_updated: i64,           // 8 bytes
}

impl UserPosition {
    pub const LEN: usize = 8 + // discriminator
        32 + 32 + // pubkeys
        8 + 8 + 8 + 8; // u64s and i64
}
