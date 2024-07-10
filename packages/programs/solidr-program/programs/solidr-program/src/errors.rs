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
}
