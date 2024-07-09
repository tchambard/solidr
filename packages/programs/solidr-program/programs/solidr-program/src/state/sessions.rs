use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct SessionAccount {
    // 8 discriminator
    pub session_id: u64, // 8
    #[max_len(20)]
    pub name: String, // 4 + 20
    #[max_len(80)]
    pub description: String, // 4 + 80
    pub admin: Pubkey,   // 32
    pub expenses_count: u16, // 2
    pub status: SessionStatus, // 1
}

impl SessionAccount {
    pub const SEED_PREFIX: &'static [u8; 7] = b"session";
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize, InitSpace, PartialEq)]
pub enum SessionStatus {
    Opened,
    Closed,
}

#[event]
pub struct SessionClosed {
    pub session_id: u64,
}

#[event]
pub struct SessionOpened {
    pub session_id: u64,
}
