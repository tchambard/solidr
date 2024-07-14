use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct RefundAccount {
    // 8 discriminator
    pub session_id: u64,         // 8
    pub refund_id: u16,          // 2
    pub date: i64,               // 8
    pub from: Pubkey,            // 32
    pub to: Pubkey,              // 32
    pub amount: u16,             // 8
    pub amount_in_lamports: u64, // 32
}

impl RefundAccount {
    pub const SEED_PREFIX: &'static [u8; 6] = b"refund";
}

#[event]
pub struct RefundAdded {
    pub session_id: u64,
    pub refund_id: u16,
}
