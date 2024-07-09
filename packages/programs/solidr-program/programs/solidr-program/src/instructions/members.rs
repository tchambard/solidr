use anchor_lang::prelude::*;

use crate::errors::*;
use crate::state::members::*;
use crate::state::sessions::*;

#[derive(Accounts)]
#[instruction(addr: Pubkey)]
pub struct AddSessionMemberContextData<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub session: Account<'info, SessionAccount>,

    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + MemberAccount::INIT_SPACE,
        seeds = [
            MemberAccount::SEED_PREFIX,
            session.session_id.to_le_bytes().as_ref(),
            addr.key().as_ref(),
        ],
        bump
    )]
    pub member: Account<'info, MemberAccount>,

    pub system_program: Program<'info, System>,
}

pub fn add_session_member(
    ctx: Context<AddSessionMemberContextData>,
    addr: Pubkey,
    name: String,
) -> Result<()> {
    let session = &mut ctx.accounts.session;
    let member = &mut ctx.accounts.member;

    require!(
        session.admin.key() == ctx.accounts.admin.key(),
        SolidrError::ForbiddenAsNonAdmin
    );

    require!(
        session.status == SessionStatus::Opened,
        SolidrError::SessionClosed
    );

    require!(
        member.addr.key() != addr.key(),
        SolidrError::MemberAlreadyExists
    );

    member.session_id = session.session_id;
    member.name = name.clone();
    member.addr = addr.key();

    emit!(MemberAdded {
        session_id: member.session_id,
        addr: addr.key(),
        name,
    });
    Ok(())
}
