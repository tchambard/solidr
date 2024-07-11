use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct ExpenseAccount {
    // 8 discriminator
    pub expense_id: u16, // 2
    #[max_len(20)]
    pub name: String, // 4 + 20
    pub date: i64, // 8
    pub member: Pubkey,   // 32
    pub amount: u16, // 2
    #[max_len(10)]
    pub participants: Vec<Pubkey>, // ?
    // TDODO date
}

impl ExpenseAccount {
    pub const SEED_PREFIX: &'static [u8; 7] = b"expense";
}

#[event]
pub struct ExpenseAdded {
    pub session_id: u64,
    pub expense_id: u16,
}