import { Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useRecoilState, useRecoilValue } from 'recoil';
import { sessionCurrentState } from '@/store/sessions';
import { solidrClientState } from '@/store/wallet';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';
import { useState } from 'react';
import { SessionStatus } from '@solidr';

export default () => {
    const [sessionCurrent, setSessionCurrent] = useRecoilState(sessionCurrentState);
    const solidrClient = useRecoilValue(solidrClientState);
    const anchorWallet = useAnchorWallet() as Wallet;

    const [confirmVisibility, setConfirmVisibility] = useState<boolean>(false);
    const handleClickOpen = () => {
        setConfirmVisibility(true);
    };
    const handleClose = () => {
        setConfirmVisibility(false);
    };
    return (
        <>
            {sessionCurrent.session?.status == SessionStatus.Opened ? (
                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                        handleClickOpen();
                    }}
                >
                    Close session
                </Button>
            ) : (
                <Chip label="Session Closed" color="error" variant="outlined" />
            )}
            <Dialog open={confirmVisibility} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">Close Session</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Closing this session will freeze the current session balance, preventing any further addition or modification of expenses. However, you will still be able
                        to complete any pending refunds.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => {
                            solidrClient?.closeSession(anchorWallet, sessionCurrent.session?.sessionId);
                            handleClose();
                        }}
                        autoFocus
                    >
                        Close Session
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};
