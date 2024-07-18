import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useRecoilValue } from 'recoil';
import { solidrClientState } from '@/store/wallet';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { BN, Wallet } from '@coral-xyz/anchor';
import React from 'react';
import { IDialogProps } from '@/content/solidr/components/list/SessionCreateDialog';

interface CloseDialogProps extends IDialogProps {
    sessionId: BN;
}

export default ({ sessionId, dialogVisible, setDialogVisible }: CloseDialogProps) => {
    const solidrClient = useRecoilValue(solidrClientState);
    const anchorWallet = useAnchorWallet() as Wallet;

    const handleClose = () => {
        setDialogVisible(false);
    };

    const handleCloseSessionClick = () => {
        solidrClient?.closeSession(anchorWallet, sessionId).then(() => {
            setDialogVisible(false);
        });
    };

    return (
        <Dialog open={dialogVisible} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">Close Session</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Closing this session will freeze the current session balance, preventing any further addition or modification of expenses. However, you will still be able to
                    complete any pending refunds.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button color="primary" onClick={() => handleCloseSessionClick()} autoFocus>
                    Close Session
                </Button>
            </DialogActions>
        </Dialog>
    );
};
