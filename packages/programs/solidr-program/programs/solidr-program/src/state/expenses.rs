use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ExpenseAccount {
    // 8 discriminator
    pub session_id: u64, // 8
    pub expense_id: u16, // 2
    pub date: i64,       // 8
    pub owner: Pubkey,   // 32
    pub amount: u16,     // 2
    #[max_len(20)]
    pub name: String, // 4 + 20
    #[max_len(10)]
    pub participants: Vec<Pubkey>, // ?
                         // TODO date
}

impl ExpenseAccount {
    pub const SEED_PREFIX: &'static [u8; 7] = b"expense";
}

#[event]
pub struct ExpenseAdded {
    pub session_id: u64,
    pub expense_id: u16,
}

#[event]
pub struct ExpenseParticipantAdded {
    pub session_id: u64,
    pub expense_id: u16,
    pub member_pubkey: Pubkey,
}

#[event]
pub struct ExpenseParticipantRemoved {
    pub session_id: u64,
    pub expense_id: u16,
    pub member_pubkey: Pubkey,
}
