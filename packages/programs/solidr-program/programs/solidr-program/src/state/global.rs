use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct GlobalAccount {
    pub session_count: u64,
}

impl GlobalAccount {
    pub const SEED: &'static [u8; 6] = b"global";
}
