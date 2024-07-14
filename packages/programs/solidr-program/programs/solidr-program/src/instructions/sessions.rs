use crate::{
    errors::*,
    instructions::members::add_member,
    state::{global::*, members::*, sessions::*},
};

use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct OpenSessionContextData<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub global: Account<'info, GlobalAccount>,

    #[account(
        init,
        payer = admin,
        space = 8 + SessionAccount::INIT_SPACE,
        seeds = [
            SessionAccount::SEED_PREFIX.as_ref(),
            global.session_count.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub session: Account<'info, SessionAccount>,

    #[account(
        init_if_needed,
        payer = admin,
        space = 8 + MemberAccount::INIT_SPACE,
        seeds = [
            MemberAccount::SEED_PREFIX,
            global.session_count.to_le_bytes().as_ref(),
            admin.key().as_ref(),
        ],
        bump
    )]
    pub member: Account<'info, MemberAccount>,

    pub system_program: Program<'info, System>,
}

pub fn open_session(
    ctx: Context<OpenSessionContextData>,
    name: String,
    description: String,
    member_name: String,
) -> Result<()> {
    let global = &mut ctx.accounts.global;
    let session = &mut ctx.accounts.session;
    let member = &mut ctx.accounts.member;

    require!(name.len() <= 20, SolidrError::SessionNameTooLong);
    require!(
        description.len() <= 80,
        SolidrError::SessionDescriptionTooLong
    );

    session.session_id = global.session_count;
    session.admin = ctx.accounts.admin.key();
    session.name.clone_from(&name);
    session.description.clone_from(&description);
    session.status = SessionStatus::Opened;
    session.expenses_count = 0;
    session.refunds_count = 0;

    global.session_count += 1;

    let _ = add_member(ctx.accounts.admin.key(), member_name, session, member);

    emit!(SessionOpened {
        session_id: session.session_id
    });
    Ok(())
}

#[derive(Accounts)]
pub struct CloseSessionContextData<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub session: Account<'info, SessionAccount>,

    pub system_program: Program<'info, System>,
}

pub fn close_session(ctx: Context<CloseSessionContextData>) -> Result<()> {
    let session = &mut ctx.accounts.session;

    require!(
        session.admin.key() == ctx.accounts.admin.key(),
        SolidrError::ForbiddenAsNonAdmin
    );

    require!(
        session.status == SessionStatus::Opened,
        SolidrError::SessionClosed
    );

    session.status = SessionStatus::Closed;
    session.invitation_hash = [0; 32];

    emit!(SessionClosed {
        session_id: session.session_id
    });

    Ok(())
}

#[derive(Accounts)]
pub struct SetSessionHashContextData<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub session: Account<'info, SessionAccount>,

    pub system_program: Program<'info, System>,
}

pub fn set_session_token_hash(
    ctx: Context<SetSessionHashContextData>,
    hash: [u8; 32],
) -> Result<()> {
    let session = &mut ctx.accounts.session;

    require!(
        session.admin.key() == ctx.accounts.admin.key(),
        SolidrError::ForbiddenAsNonAdmin
    );

    require!(
        session.status == SessionStatus::Opened,
        SolidrError::SessionClosed
    );

    session.invitation_hash = hash;

    Ok(())
}
