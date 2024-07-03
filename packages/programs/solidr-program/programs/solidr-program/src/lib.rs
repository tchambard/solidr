use anchor_lang::prelude::*;

use crate::instructions::global::*;

pub mod instructions;
pub mod state;

declare_id!("2xTttZsc5s65KyLmG1M6D5NpanUdYGj9SydbYnQFjnUP");

#[program]
pub mod solidr {

    use instructions::*;

    use super::*;

    pub fn init_global(ctx: Context<InitGlobalContextData>) -> Result<()> {
        global::init_global(ctx)
    }
}
