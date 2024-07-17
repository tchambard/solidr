use crate::is_session_member;
use crate::state::expenses::*;
use crate::state::members::MemberAccount;
use crate::{errors::*, state::sessions::*};
use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock;

#[derive(Accounts)]
pub struct AddExpenseContextData<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub session: Account<'info, SessionAccount>,

    #[account(mut)]
    pub member: Account<'info, MemberAccount>,

    #[account(
        init,
        payer = owner,
        space = 8 + ExpenseAccount::INIT_SPACE,
        seeds = [
            ExpenseAccount::SEED_PREFIX.as_ref(),
            session.session_id.to_le_bytes().as_ref(),
            session.expenses_count.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub expense: Account<'info, ExpenseAccount>,

    pub system_program: Program<'info, System>,
}

pub fn add_expense(
    ctx: Context<AddExpenseContextData>,
    name: String,
    amount: f32,
    participants: Vec<Pubkey>,
) -> Result<()> {
    let owner = &mut ctx.accounts.owner;
    let session = &mut ctx.accounts.session;
    let member = &mut ctx.accounts.member;
    let expense = &mut ctx.accounts.expense;

    require!(
        session.status == SessionStatus::Opened,
        SolidrError::SessionClosed
    );
    require!(
        owner.key() == member.addr.key() && member.session_id == session.session_id,
        SolidrError::NotSessionMember
    );
    require!(amount > 0.0, SolidrError::ExpenseAmountMustBeGreaterThanZero);
    require!(name.len() <= 20, SolidrError::ExpenseNameTooLong);

    expense.session_id = session.session_id;
    expense.expense_id = session.expenses_count;
    expense.name = name;
    expense.date = clock::Clock::get().unwrap().unix_timestamp;
    expense.owner = owner.key();
    expense.amount = amount;

    expense.participants = vec![owner.key()];

    let _ = add_participants(
        &ctx.program_id,
        &ctx.remaining_accounts,
        expense,
        participants,
    );
    session.expenses_count += 1;

    emit!(ExpenseAdded {
        session_id: session.session_id,
        expense_id: expense.expense_id,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct UpdateExpenseContextData<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub session: Account<'info, SessionAccount>,

    #[account(mut)]
    pub expense: Account<'info, ExpenseAccount>,
}

pub fn update_expense(
    ctx: Context<UpdateExpenseContextData>,
    name: String,
    amount: f32,
) -> Result<()> {
    let owner = &mut ctx.accounts.owner;
    let session = &mut ctx.accounts.session;
    let expense = &mut ctx.accounts.expense;

    require!(
        session.status == SessionStatus::Opened,
        SolidrError::SessionClosed
    );
    require!(
        owner.key() == expense.owner.key() && session.session_id == expense.session_id,
        SolidrError::NotExpenseOwner
    );
    require!(amount > 0.0, SolidrError::ExpenseAmountMustBeGreaterThanZero);
    require!(name.len() <= 20, SolidrError::ExpenseNameTooLong);

    expense.name = name;
    expense.amount = amount;

    emit!(ExpenseUpdated {
        session_id: session.session_id,
        expense_id: expense.expense_id,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct DeleteExpenseContextData<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub session: Account<'info, SessionAccount>,

    #[account(mut, close=owner)]
    pub expense: Account<'info, ExpenseAccount>,
}

pub fn delete_expense(
    ctx: Context<DeleteExpenseContextData>
) -> Result<()> {
    let owner = &mut ctx.accounts.owner;
    let session = &mut ctx.accounts.session;
    let expense = &mut ctx.accounts.expense;

    require!(
        session.status == SessionStatus::Opened,
        SolidrError::SessionClosed
    );
    require!(
        owner.key() == expense.owner.key() && session.session_id == expense.session_id,
        SolidrError::NotExpenseOwner
    );

    emit!(ExpenseDeleted {
        session_id: session.session_id,
        expense_id: expense.expense_id,
    });

    Ok(())
}

#[derive(Accounts)]
pub struct AddExpenseParticipantContextData<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub expense: Account<'info, ExpenseAccount>,

    #[account(mut)]
    pub session: Account<'info, SessionAccount>,

    pub system_program: Program<'info, System>,
}

pub fn add_expense_participants(
    ctx: Context<AddExpenseParticipantContextData>,
    participants: Vec<Pubkey>,
) -> Result<()> {
    let owner = &mut ctx.accounts.owner;
    let expense = &mut ctx.accounts.expense;
    let session = &mut ctx.accounts.session;

    require!(owner.key() == expense.owner, SolidrError::NotExpenseOwner);

    require!(
        session.status == SessionStatus::Opened,
        SolidrError::SessionClosed
    );
    let _ = add_participants(
        &ctx.program_id,
        &ctx.remaining_accounts,
        expense,
        participants,
    );
    Ok(())
}

#[derive(Accounts)]
pub struct RemoveExpenseParticipantContextData<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub expense: Account<'info, ExpenseAccount>,

    #[account(mut)]
    pub session: Account<'info, SessionAccount>,

    pub system_program: Program<'info, System>,
}

pub fn remove_expense_participants(
    ctx: Context<RemoveExpenseParticipantContextData>,
    participants: Vec<Pubkey>,
) -> Result<()> {
    let owner = &mut ctx.accounts.owner;
    let expense = &mut ctx.accounts.expense;
    let session = &mut ctx.accounts.session;

    require!(owner.key() == expense.owner, SolidrError::NotExpenseOwner);

    require!(
        session.status == SessionStatus::Opened,
        SolidrError::SessionClosed
    );

    let mut i = 0;

    while i < expense.participants.len() {
        if participants.contains(&expense.participants[i]) {
            require!(
                expense.participants[i].key() != expense.owner.key(),
                SolidrError::CannotRemoveExpenseOwner,
            );
            emit!(ExpenseParticipantRemoved {
                session_id: expense.session_id,
                expense_id: expense.expense_id,
                member_pubkey: expense.participants[i],
            });
            expense.participants.remove(i);
        } else {
            i += 1;
        }
    }
    Ok(())
}

fn get_member_pda_address(program_id: &Pubkey, session_id: u64, member: Pubkey) -> Pubkey {
    let (pubkey, _) = Pubkey::find_program_address(
        &[
            b"member",
            session_id.to_le_bytes().as_ref(),
            member.as_ref(),
        ],
        program_id,
    );
    pubkey
}

fn add_participants(
    program_id: &Pubkey,
    remaining_accounts: &&[AccountInfo<'_>],
    expense: &mut Account<ExpenseAccount>,
    participants: Vec<Pubkey>,
) -> Result<()> {
    require!(
        expense.participants.len() < 20 - participants.len(),
        SolidrError::MaxParticipantsReached
    );

    for &participant in participants.iter() {
        let member_pda_address =
            get_member_pda_address(&program_id, expense.session_id, participant);

        if !is_session_member(&program_id, &remaining_accounts, member_pda_address)? {
            return Err(SolidrError::ParticipantNotMember.into());
        }

        if !expense.participants.contains(&participant) {
            expense.participants.push(participant);

            emit!(ExpenseParticipantAdded {
                session_id: expense.session_id,
                expense_id: expense.expense_id,
                member_pubkey: participant,
            });
        }
    }
    Ok(())
}
