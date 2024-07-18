import React, { useState } from 'react';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { LoadingButton } from '@mui/lab';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useRecoilValue } from 'recoil';
import { solidrClientState } from '@/store/wallet';
import { sessionCurrentState } from '@/store/sessions';
import { Wallet } from '@coral-xyz/anchor';

interface IAddExpenseDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IRegisterExpenseParams {
    name: string;
    amount: number;
}

export default ({ dialogVisible, setDialogVisible }: IAddExpenseDialogProps) => {
    const anchorWallet = useAnchorWallet() as Wallet;
    const SolidrClient = useRecoilValue(solidrClientState);
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const [pending, setPending] = useState(false);

    const [formData, setFormData] = useState<Partial<IRegisterExpenseParams>>({});

    if (!anchorWallet || !SolidrClient || !sessionCurrent) return <></>;

    return (
        <Dialog disableEscapeKeyDown maxWidth={'sm'} aria-labelledby={'register-expense-title'} open={dialogVisible}>
            <DialogTitle id={'register-expense-title'}>{'Add a new expense'}</DialogTitle>
            <DialogContent dividers>
                <FormContainer
                    defaultValues={formData}
                    onSuccess={(data: IRegisterExpenseParams) => {
                        setFormData(data);
                        setPending(true);
                        SolidrClient?.addExpense(anchorWallet, sessionCurrent.session?.sessionId, data.name, data.amount).then(() => {
                            setPending(false);
                            setDialogVisible(false);
                        });
                    }}
                >
                    <Stack direction={'column'}>
                        <TextFieldElement type={'text'} name={'name'} label={'Name'} required={true} />
                        <br />
                        <TextFieldElement type={'text'} name={'amount'} label={'Amount'} required={true} />
                        <br />
                        <LoadingButton loading={pending} loadingPosition={'end'} variant={'contained'} color={'primary'} endIcon={<SendIcon />} type={'submit'}>
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
