import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useRecoilValue } from 'recoil';
import { solidrClientState } from '@/store/wallet';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { BN, Wallet } from '@coral-xyz/anchor';
import React from 'react';
import { IDialogProps } from '@/content/solidr/components/list/SessionCreateDialog';
import { useTranslation } from 'react-i18next';

interface DeleteDialogProps extends IDialogProps {
    sessionId: BN;
}

export default ({ sessionId, dialogVisible, setDialogVisible }: DeleteDialogProps) => {

    const { t } = useTranslation();

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
            <DialogTitle id="alert-dialog-title">{t('session.delete.dialog.title')}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {t('session.delete.dialog.description')}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button color="secondary" onClick={handleClose}>
                    {t('cancel')}
                </Button>
                <Button color="error" onClick={() => handleCloseSessionClick()} autoFocus>
                    {t('submit')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
