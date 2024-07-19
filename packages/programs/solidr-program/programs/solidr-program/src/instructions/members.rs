use anchor_lang::prelude::*;
use sha2::{Digest, Sha256};

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
    let member: &mut Account<MemberAccount> = &mut ctx.accounts.member;

    require!(
        session.admin.key() == ctx.accounts.admin.key(),
        SolidrError::ForbiddenAsNonAdmin
    );

    add_member(addr, name, session, member)
}

#[derive(Accounts)]
pub struct DeleteSessionMemberContextData<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub session: Account<'info, SessionAccount>,

    #[account(mut, close = admin)]
    pub member: Account<'info, MemberAccount>,

    pub system_program: Program<'info, System>,
}

pub fn delete_session_member(
    ctx: Context<DeleteSessionMemberContextData>,
) -> Result<()> {
    let session = &mut ctx.accounts.session;
    let member: &mut Account<MemberAccount> = &mut ctx.accounts.member;

    require!(
        session.admin.key() == ctx.accounts.admin.key(),
        SolidrError::ForbiddenAsNonAdmin
    );
    require!(
        session.status == SessionStatus::Closed,
        SolidrError::SessionNotClosed
    );

    emit!(MemberDeleted {
        session_id: member.session_id,
        addr: member.addr,
        name: member.name.clone(),
    });
    Ok(())
}

#[derive(Accounts)]
pub struct JoinSessionAsMemberContextData<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(mut)]
    pub session: Account<'info, SessionAccount>,

    #[account(
        init,
        payer = signer,
        space = 8 + MemberAccount::INIT_SPACE,
        seeds = [
        MemberAccount::SEED_PREFIX,
        session.session_id.to_le_bytes().as_ref(),
        signer.key().as_ref(),
        ],
        bump
    )]
    pub member: Account<'info, MemberAccount>,

    pub system_program: Program<'info, System>,
}

pub fn join_session_as_member(
    ctx: Context<JoinSessionAsMemberContextData>,
    name: String,
    token: String,
) -> Result<()> {
    let signer = &ctx.accounts.signer;

    let session = &ctx.accounts.session;
    let member: &mut Account<MemberAccount> = &mut ctx.accounts.member;

    require!(
        !session.invitation_hash.iter().all(|&x| x == 0),
        SolidrError::MissingInvitationHash
    );

    let mut hasher = Sha256::new();
    hasher.update(token.as_bytes());
    let hashed_token = hasher.finalize();

    require!(
        hashed_token.as_slice() == session.invitation_hash.as_slice(),
        SolidrError::InvalidInvitationHash
    );

    add_member(signer.key(), name, session, member)
}

pub fn add_member(
    addr: Pubkey,
    name: String,
    session: &Account<SessionAccount>,
    member: &mut Account<MemberAccount>,
) -> Result<()> {
    require!(
        session.status == SessionStatus::Opened,
        SolidrError::SessionClosed
    );

    require!(
        member.addr.key() != addr.key(),
        SolidrError::MemberAlreadyExists
    );

    member.session_id = session.session_id;
    member.name.clone_from(&name);
    member.addr = addr.key();
    member.is_admin = addr.key() == session.admin.key();

    emit!(MemberAdded {
        session_id: member.session_id,
        addr: member.addr,
        name,
        is_admin: member.is_admin,
    });
    Ok(())
}

pub fn is_session_member(
    program_id: &Pubkey,
    remaining_accounts: &&[AccountInfo<'_>],
    member_pda_address: Pubkey,
) -> Result<bool> {
    match remaining_accounts
        .iter()
        .find(|account| account.key() == member_pda_address)
    {
        Some(account) => Ok(account.owner == program_id && !account.data_is_empty()),
        None => Ok(false),
    }
}
