use anchor_lang::prelude::*;

#[error_code]
pub enum SolidrError {
    #[msg("Session's name can't exceed 20 characters")]
    SessionNameTooLong,
    #[msg("Session's description can't exceed 80 characters")]
    SessionDescriptionTooLong,
}
