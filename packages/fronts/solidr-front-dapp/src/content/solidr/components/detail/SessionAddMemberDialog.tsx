import React, { useState } from 'react';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { LoadingButton } from '@mui/lab';
import { solidrClientState } from '@/store/wallet';
import { useRecoilValue } from 'recoil';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';
import { sessionCurrentState } from '@/store/sessions';
import { PublicKey } from '@solana/web3.js';

interface IAddMemberDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IRegisterMemberParams {
    address: string;
    name: string;
}

export default ({ dialogVisible, setDialogVisible }: IAddMemberDialogProps) => {
    const anchorWallet = useAnchorWallet() as Wallet;
    const SolidrClient = useRecoilValue(solidrClientState);
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const [pending, setPending] = useState(false);

    const [formData, setFormData] = useState<Partial<IRegisterMemberParams>>({});

    if (!anchorWallet || !SolidrClient || !sessionCurrent) return <></>;

    return (
        <Dialog disableEscapeKeyDown maxWidth={'sm'} aria-labelledby={'register-member-title'} open={dialogVisible}>
            <DialogTitle id={'register-member-title'}>{'Add a new member'}</DialogTitle>
            <DialogContent dividers>
                <FormContainer
                    defaultValues={formData}
                    onSuccess={(data: IRegisterMemberParams) => {
                        setFormData(data);
                        setPending(true);
                        SolidrClient?.addSessionMember(anchorWallet, sessionCurrent.session?.sessionId, new PublicKey(data.address), data.name).then(() => {
                            setPending(false);
                            setDialogVisible(false);
                        });
                    }}
                >
                    <Stack direction={'column'}>
                        <TextFieldElement type={'text'} name={'address'} label={'Address'} required={true} />
                        <br />
                        <TextFieldElement type={'text'} name={'name'} label={'Name'} required={true} />
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
