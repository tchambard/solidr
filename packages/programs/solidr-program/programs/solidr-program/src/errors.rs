use anchor_lang::prelude::*;

#[error_code]
pub enum SolidrError {
    #[msg("Session's name can't exceed 20 characters")]
    SessionNameTooLong,
    #[msg("Session's description can't exceed 80 characters")]
    SessionDescriptionTooLong,
    #[msg("Only session administrator is granted")]
    ForbiddenAsNonAdmin,
    #[msg("Session is closed")]
    SessionClosed,
    #[msg("Member already exists")]
    MemberAlreadyExists,
    #[msg("Missing invitation link hash")]
    MissingInvitationHash,
    #[msg("Invalid invitation link hash")]
    InvalidInvitationHash,
    #[msg("Expense amount must be greater than zero")]
    AmountMustBeGreaterThanZero,
    #[msg("Expense's name can't exceed 20 characters")]
    ExpenseNameTooLong,
    #[msg("Expense cannot have more than 20 participants")]
    MaxParticipantsReached,
    #[msg("Only session member can add an expense")]
    NotSessionMember,
    #[msg("Only expense owner can add participants")]
    NotExpenseOwner,
    #[msg("Only members can be added as participants")]
    ParticipantNotMember,
}
