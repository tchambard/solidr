use anchor_lang::{prelude::*, system_program};
use anchor_lang::solana_program::clock;

use crate::{errors::*, state::sessions::*};
use crate::instructions::prices::*;
use crate::state::members::MemberAccount;
use crate::state::refunds::*;

#[derive(Accounts)]
pub struct RefundContextData<'info> {
    /// CHECK: safe as used only for transfer and ensured belonging to session member
    #[account(mut)]
    pub from_addr: Signer<'info>,

    #[account(mut)]
    pub sender: Account<'info, MemberAccount>,

    /// CHECK: safe as used only for transfer and ensured belonging to session member
    #[account(mut)]
    pub to_addr: AccountInfo<'info>,

    #[account(mut)]
    pub receiver: Account<'info, MemberAccount>,

    #[account(mut)]
    pub session: Account<'info, SessionAccount>,

    #[account(
        init,
        payer = from_addr,
        space = 8 + RefundAccount::INIT_SPACE,
        seeds = [
        RefundAccount::SEED_PREFIX.as_ref(),
        session.session_id.to_le_bytes().as_ref(),
        session.refunds_count.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub refund: Account<'info, RefundAccount>,

    // https://github.com/pyth-network/pyth-crosschain/issues/1759
    // pub price_update: Account<'info, PriceUpdateV2>,
    pub system_program: Program<'info, System>,
}

pub fn add_refund(ctx: Context<RefundContextData>, amount: u16) -> Result<()> {
    let session = &mut ctx.accounts.session;
    let refund = &mut ctx.accounts.refund;
    // let price_update = &mut ctx.accounts.price_update;

    let from_addr = &ctx.accounts.from_addr;
    let sender = &ctx.accounts.sender;

    let to_addr = &ctx.accounts.to_addr;
    let receiver = &ctx.accounts.receiver;

    require!(
        session.status == SessionStatus::Opened,
        SolidrError::SessionClosed
    );
    require!(
        from_addr.key() == sender.addr.key() && sender.session_id == session.session_id,
        SolidrError::NotSessionMember
    );
    require!(
        to_addr.key() == receiver.addr.key() && receiver.session_id == session.session_id,
        SolidrError::NotSessionMember
    );
    require!(amount > 0, SolidrError::RefundAmountMustBeGreaterThanZero);

    let price = get_price(); // TODO: pas price_update account
    let amount_in_lamports = convert_to_lamports(amount.into(), price)?;

    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        system_program::Transfer {
            from: ctx.accounts.from_addr.to_account_info(),
            to: ctx.accounts.to_addr.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, amount_in_lamports)?;

    refund.session_id = session.session_id;
    refund.refund_id = session.expenses_count;
    refund.date = clock::Clock::get().unwrap().unix_timestamp;
    refund.from = from_addr.key();
    refund.to = to_addr.key();
    refund.amount = amount;
    refund.amount_in_lamports = amount_in_lamports;

    session.refunds_count += 1;

    emit!(RefundAdded {
        session_id: session.session_id,
        refund_id: refund.refund_id,
    });
    Ok(())
}

#[derive(Accounts)]
pub struct DeleteRefundContextData<'info> {
    /// CHECK: safe as used only for transfer and ensured belonging to session member
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub session: Account<'info, SessionAccount>,

    #[account(mut, close = admin)]
    pub refund: Account<'info, RefundAccount>,

    pub system_program: Program<'info, System>,
}

pub fn delete_refund(ctx: Context<DeleteRefundContextData>) -> Result<()> {
    let session = &mut ctx.accounts.session;
    let refund = &mut ctx.accounts.refund;

    require!(
        session.admin.key() == ctx.accounts.admin.key(),
        SolidrError::ForbiddenAsNonAdmin
    );
    require!(
        session.status == SessionStatus::Closed,
        SolidrError::SessionNotClosed
    );

    emit!(RefundDeleted {
        session_id: session.session_id,
        refund_id: refund.refund_id,
    });
    Ok(())
}
