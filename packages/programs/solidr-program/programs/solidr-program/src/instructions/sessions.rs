use crate::{
    errors::*,
    state::{global::*, sessions::*},
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

    pub system_program: Program<'info, System>,
}

pub fn open_session(
    ctx: Context<OpenSessionContextData>,
    name: String,
    description: String,
) -> Result<()> {
    let global = &mut ctx.accounts.global;
    let session = &mut ctx.accounts.session;

    require!(name.len() <= 20, SolidrError::SessionNameTooLong);
    require!(
        description.len() <= 80,
        SolidrError::SessionDescriptionTooLong
    );

    session.session_id = global.session_count;
    session.admin = ctx.accounts.admin.key();
    session.name = name.clone();
    session.description = description.clone();
    session.status = SessionStatus::Opened;
    session.expenses_count = 0;

    global.session_count += 1;

    emit!(SessionOpened {
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

    session.invitation_hash = hash;

    Ok(())
}
