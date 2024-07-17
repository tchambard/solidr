use anchor_lang::prelude::*;

use crate::instructions::{expenses::*, global::*, members::*, refunds::*, sessions::*};

pub mod errors;
pub mod instructions;
pub mod state;

declare_id!("7ANWP5NdPzZ2YCJpYqqd8DiQgi8hnmtVNw5vatbDdixD");

#[program]
pub mod solidr {
    use super::*;
    use instructions::*;

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
     * @param member_name The administrator's name
     */
    pub fn open_session(
        ctx: Context<OpenSessionContextData>,
        name: String,
        description: String,
        member_name: String,
    ) -> Result<()> {
        sessions::open_session(ctx, name, description, member_name)
    }

    /**
     * Administrator can close sessions he created.
     *
     * @dev An event SessionClosed is emitted
     */
    pub fn close_session(ctx: Context<CloseSessionContextData>) -> Result<()> {
        sessions::close_session(ctx)
    }

    /**
     * Session's administrator can set invitation token hash
     *
     * @param hash The token hash to store in session
     */
    pub fn set_session_token_hash(
        ctx: Context<SetSessionHashContextData>,
        hash: [u8; 32],
    ) -> Result<()> {
        sessions::set_session_token_hash(ctx, hash)
    }

    /**
     * Session administrator can add members.
     *
     * @dev members can be added only by session administrator when session is opened
     * An event MemberAdded is emitted
     *
     * @param addr The address of the member to add
     * @param name The nickname of the member to add
     */
    pub fn add_session_member(
        ctx: Context<AddSessionMemberContextData>,
        addr: Pubkey,
        name: String,
    ) -> Result<()> {
        members::add_session_member(ctx, addr, name)
    }

    /**
     * Anyone can join a session with correct information provided with a share link.
     *
     * An event MemberAdded is emitted
     *
     * @param name The nickname of the member to add
     * @param token The token shared by session's administrator
     */
    pub fn join_session_as_member(
        ctx: Context<JoinSessionAsMemberContextData>,
        name: String,
        token: String,
    ) -> Result<()> {
        members::join_session_as_member(ctx, name, token)
    }

    /**
     * Adds a new expense to the session.
     *
     * @param name The name of the expense
     * @param amount The amount of the expense
     */
    pub fn add_expense(
        ctx: Context<AddExpenseContextData>,
        name: String,
        amount: f32,
        participants: Vec<Pubkey>,
    ) -> Result<()> {
        expenses::add_expense(ctx, name, amount, participants)
    }

    /**
     * Adds participants to expense.
     *
     * @param participants The public keys of the participants
     */
    pub fn add_expense_participants(
        ctx: Context<AddExpenseParticipantContextData>,
        participants: Vec<Pubkey>,
    ) -> Result<()> {
        expenses::add_expense_participants(ctx, participants)
    }

    /**
     * Removes participant from expense.
     *
     * @param participants The public keys of the participants
     */
    pub fn remove_expense_participants(
        ctx: Context<RemoveExpenseParticipantContextData>,
        participants: Vec<Pubkey>,
    ) -> Result<()> {
        expenses::remove_expense_participants(ctx, participants)
    }

    /**
     * Updates an existing expense in the session.
     *
     * @param name The name of the expense to be updated
     * @param amount The new amount of the expense
     */
    pub fn update_expense(
        ctx: Context<UpdateExpenseContextData>,
        name: String,
        amount: f32,
    ) -> Result<()> {
        expenses::update_expense(ctx, name, amount)
    }

    /**
     * Deletes an existing expense in the session.
     *
     * @param name The name of the expense to be deleted
     * @param amount The amount of the expense to be deleted
     */
    pub fn delete_expense(ctx: Context<DeleteExpenseContextData>) -> Result<()> {
        expenses::delete_expense(ctx)
    }

    /**
     * Adds a new refund to the session. lamports corresponding to given amount will be transfered to mentionned "to" account
     *
     * @param amount The amount of the refund corresponding to session currency
     */
    pub fn add_refund(ctx: Context<RefundContextData>, amount: u16) -> Result<()> {
        refunds::add_refund(ctx, amount)
    }
}
