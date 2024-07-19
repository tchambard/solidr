import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useRecoilValue } from 'recoil';
import { solidrClientState, txState } from '@/store/wallet';
import { sessionCurrentState } from '@/store/sessions';
import { Wallet } from '@coral-xyz/anchor';
import { IDialogProps } from '@/content/solidr/components/list/SessionCreateDialog';
import { FormContainer } from 'react-hook-form-mui';
import { LoadingButton } from '@mui/lab';
import SendIcon from '@mui/icons-material/Send';

interface IRegisterRefundParams {
    from: string;
    to: string;
    amount: number;
}

export default ({ dialogVisible, setDialogVisible }: IDialogProps) => {
    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useRecoilValue(solidrClientState);
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const tx = useRecoilValue(txState);

    const [formData, setFormData] = useState<Partial<IRegisterRefundParams>>({});

    if (!anchorWallet || !solidrClient || !sessionCurrent) return <></>;

    return (
        <Dialog disableEscapeKeyDown maxWidth={'sm'} aria-labelledby={'register-expense-title'} open={dialogVisible}>
            <DialogTitle id={'register-expense-title'}>{'Refund my friends'}</DialogTitle>
            <DialogContent dividers>
                <FormContainer
                    defaultValues={formData}
                    onSuccess={(data: IRegisterRefundParams) => {
                        setFormData(data);
                        //solidrClient?.addRefund(anchorWallet, sessionCurrent.session?.sessionId, 0 new PublicKey(data.address)).then(() => {
                        //    setDialogVisible(false);
                        //});
                    }}
                >
                    <Stack direction={'column'}>
                        <LoadingButton loading={tx.pending} loadingPosition={'end'} variant={'contained'} color={'primary'} endIcon={<SendIcon />} type={'submit'}>
                            Submit
                        </LoadingButton>
                    </Stack>
                </FormContainer>
            </DialogContent>
            <DialogActions>
                <Button autoFocus onClick={() => setDialogVisible(false)} color={'primary'}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};
