import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputAdornment, InputLabel, OutlinedInput, Stack } from '@mui/material';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useRecoilValue } from 'recoil';
import { solidrClientState, txState } from '@/store/wallet';
import { sessionCurrentState } from '@/store/sessions';
import { Wallet } from '@coral-xyz/anchor';
import { IDialogProps } from '@/content/solidr/components/list/SessionCreateDialog';
import { FormContainer } from 'react-hook-form-mui';
import { LoadingButton } from '@mui/lab';
import SendIcon from '@mui/icons-material/Send';
import { PublicKey } from '@solana/web3.js';
import { MemberTransfer } from '@solidr';
import { useTranslation } from 'react-i18next';

export default ({ dialogVisible, setDialogVisible }: IDialogProps) => {
    const { t } = useTranslation();

    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useRecoilValue(solidrClientState);
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const tx = useRecoilValue(txState);
    if (!anchorWallet || !solidrClient || !sessionCurrent) return <></>;

    const [transfers, setTransfers] = useState<MemberTransfer[]>([]);

    useEffect(() => {
        if (!sessionCurrent) {
            return;
        }

        setTransfers(
            sessionCurrent.transfers
                .filter((transfer) => transfer.from.toString() == anchorWallet.publicKey.toString())
                .map((transfer) => {
                    return {
                        ...transfer,
                    };
                }),
        );
    }, [sessionCurrent.transfers]);

    const handleTransfersClick = () => {
        const refundsToSend = transfers
            .filter((transfer) => transfer.amount > 0)
            .map((transfer) => {
                return { amount: transfer.amount, to: transfer.to };
            });
        solidrClient?.sendRefunds(anchorWallet, sessionCurrent.session?.sessionId, refundsToSend).then(() => {
            setDialogVisible(false);
        });
    };

    const handleAmountUpdate = (to: PublicKey, amount: number) => {
        transfers.find((transfer) => transfer.to.toString() == to.toString()).amount = amount;
    };

    return (
        <Dialog disableEscapeKeyDown maxWidth={'sm'} aria-labelledby={'refund-dialog-title'} open={dialogVisible}>
            <DialogTitle id={'refund-dialog-title'}>{t('session.refund.dialog.title')}</DialogTitle>
            <DialogContent dividers>
                <FormContainer>
                    <Stack direction={'column'}>
                        {transfers.map((transfer, idx) => (
                            <div key={`transfer_${idx}`}>
                                <FormControl fullWidth sx={{ m: 1 }}>
                                    <InputLabel
                                        htmlFor={`to_${transfer.to.toString()}`}
                                    >{`${t('session.refund.dialog.label.to')} ${sessionCurrent.members[transfer.to.toString()].name}`}</InputLabel>
                                    <OutlinedInput
                                        id={`to_${transfer.to.toString()}`}
                                        startAdornment={<InputAdornment position="start">$</InputAdornment>}
                                        label={`${t('session.refund.dialog.label.to')} ${sessionCurrent.members[transfer.to.toString()].name}`}
                                        defaultValue={transfer.amount}
                                        onChange={(e) => handleAmountUpdate(transfer.to, Number(e.currentTarget.value))}
                                        type={'number'}
                                    />
                                </FormControl>
                                <br />
                            </div>
                        ))}

                        <LoadingButton
                            loading={tx.pending}
                            loadingPosition={'end'}
                            variant={'contained'}
                            color={'primary'}
                            endIcon={<SendIcon />}
                            onClick={() => handleTransfersClick()}
                        >
                            {t('submit')}
                        </LoadingButton>
                    </Stack>
                </FormContainer>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={() => setDialogVisible(false)} color={'primary'}>
                    {t('cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
