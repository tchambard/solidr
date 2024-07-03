use anchor_lang::prelude::*;

use crate::state::global::*;

#[derive(Accounts)]
pub struct InitGlobalContextData<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + GlobalAccount::INIT_SPACE,
        seeds = [GlobalAccount::SEED.as_ref()],
        bump,
    )]
    pub global_account: Account<'info, GlobalAccount>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn init_global(ctx: Context<InitGlobalContextData>) -> Result<()> {
    let global_account = &mut ctx.accounts.global_account;
    global_account.session_count = 0;
    Ok(())
}
