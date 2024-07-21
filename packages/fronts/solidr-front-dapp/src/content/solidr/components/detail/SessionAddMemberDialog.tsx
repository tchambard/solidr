import React, { useState } from 'react';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { LoadingButton } from '@mui/lab';
import { solidrClientState, txState } from '@/store/wallet';
import { useRecoilValue } from 'recoil';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';
import { sessionCurrentState } from '@/store/sessions';
import { PublicKey } from '@solana/web3.js';
import { useTranslation } from 'react-i18next';

interface IAddMemberDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IRegisterMemberParams {
    address: string;
    name: string;
}

export default ({ dialogVisible, setDialogVisible }: IAddMemberDialogProps) => {

    const { t } = useTranslation();

    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useRecoilValue(solidrClientState);
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const tx = useRecoilValue(txState);

    const [formData, setFormData] = useState<Partial<IRegisterMemberParams>>({});

    if (!anchorWallet || !solidrClient || !sessionCurrent) return <></>;

    return (
        <Dialog disableEscapeKeyDown maxWidth={'sm'} aria-labelledby={'register-member-title'} open={dialogVisible}>
            <DialogTitle id={'register-member-title'}>{t('session.member.add.title')}</DialogTitle>
            <DialogContent dividers>
                <FormContainer
                    defaultValues={formData}
                    onSuccess={(data: IRegisterMemberParams) => {
                        setFormData(data);
                        solidrClient?.addSessionMember(anchorWallet, sessionCurrent.session?.sessionId, new PublicKey(data.address), data.name).then(() => {
                            setDialogVisible(false);
                        });
                    }}
                >
                    <Stack direction={'column'}>
                        <TextFieldElement type={'text'} name={'address'} label={t('session.member.add.form.address')} required={true} />
                        <br />
                        <TextFieldElement type={'text'} name={'name'} label={t('session.member.add.form.name')} required={true} />
                        <br />
                        <LoadingButton loading={tx.pending} loadingPosition={'end'} variant={'contained'} color={'primary'} endIcon={<SendIcon />} type={'submit'}>
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
