use anchor_lang::prelude::*;

use crate::instructions::{global::*, sessions::*};

pub mod errors;
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

    /**
     * Anyone can open new session. Session's creator becomes session administrator.
     *
     * @dev An event SessionCreated is emitted
     *
     * @param name The session name
     * @param description The session description
     */
    pub fn open_session(
        ctx: Context<OpenSessionContextData>,
        name: String,
        description: String,
    ) -> Result<()> {
        sessions::open_session(ctx, name, description)
    }
}
