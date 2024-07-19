import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useRecoilValue } from 'recoil';
import { solidrClientState } from '@/store/wallet';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { BN, Wallet } from '@coral-xyz/anchor';
import React from 'react';
import { IDialogProps } from '@/content/solidr/components/list/SessionCreateDialog';

interface DeleteDialogProps extends IDialogProps {
    sessionId: BN;
}

export default ({ sessionId, dialogVisible, setDialogVisible }: DeleteDialogProps) => {
    const solidrClient = useRecoilValue(solidrClientState);
    const anchorWallet = useAnchorWallet() as Wallet;

    const handleClose = () => {
        setDialogVisible(false);
    };

    const handleCloseSessionClick = () => {
        solidrClient?.deleteSession(anchorWallet, sessionId).then(() => {
            setDialogVisible(false);
        });
    };

    return (
        <Dialog open={dialogVisible} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">Delete Session</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Deleting this session will permanently erase all associated data and it cannot be recovered. Deleting the session will also release all rents.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button color="error" onClick={() => handleCloseSessionClick()} autoFocus>
                    Delete Session
                </Button>
            </DialogActions>
        </Dialog>
    );
};
