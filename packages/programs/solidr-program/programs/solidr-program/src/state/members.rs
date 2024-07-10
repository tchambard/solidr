use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct MemberAccount {
    pub session_id: u64, // 32
    pub addr: Pubkey,    // 32
    #[max_len(40)]
    pub name: String, // 4 + 40
    pub is_admin: bool,  // 1
}

impl MemberAccount {
    pub const SEED_PREFIX: &'static [u8; 6] = b"member";
}

#[event]
pub struct MemberAdded {
    pub session_id: u64,
    pub addr: Pubkey,
    pub name: String,
    pub is_admin: bool,
}
