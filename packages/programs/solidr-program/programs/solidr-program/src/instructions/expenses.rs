use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock;
use crate::{
    errors::*,
    state::{global::*, sessions::*},
};
use crate::state::expenses::{ExpenseAccount, ExpenseAdded};
use crate::state::members::MemberAccount;

#[derive(Accounts)]
pub struct AddExpenseContextData<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub session: Account<'info, SessionAccount>,

    #[account(mut, constraint = authority.key() == member.addr)]
    pub member: Account<'info, MemberAccount>,

    #[account(
        init,
        payer = authority,
        space = 8 + ExpenseAccount::INIT_SPACE,
        seeds = [
        ExpenseAccount::SEED_PREFIX.as_ref(),
        session.session_id.to_le_bytes().as_ref(),
        session.expenses_count.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub expense: Account<'info, ExpenseAccount>,

    //#[account(mut)]
    //pub participants: Vec<Account<'info, MemberAccount>>,

    pub system_program: Program<'info, System>,
}

pub fn add_expense(
    ctx: Context<AddExpenseContextData>,
    name: String,
    amount: u16,
) -> Result<()> {
    let session = &mut ctx.accounts.session;
    let expense = &mut ctx.accounts.expense;
    //let participants = &mut ctx.accounts.participants;

    require!(amount > 0, SolidrError::AmountMustBeGreaterThanZero);
    require!(name.len() <= 20, SolidrError::ExpenseNameTooLong);

    expense.expense_id = session.expenses_count;
    session.expenses_count += 1;

    expense.name = name;
    expense.date = clock::Clock::get().unwrap().unix_timestamp;
    expense.member = ctx.accounts.authority.key();
    expense.amount = amount;
    //expense.participants = participants.iter().map(|m| m.addr).collect();

    emit!(ExpenseAdded{
        session_id: session.session_id,
        expense_id : expense.expense_id,
    });

    Ok(())
}
