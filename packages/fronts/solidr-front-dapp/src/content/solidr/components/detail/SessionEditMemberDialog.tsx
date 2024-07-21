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
import { SessionMember } from '@solidr';
import { useTranslation } from 'react-i18next';

interface IAddMemberDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
    member: SessionMember;
}

interface IRegisterMemberParams {
    name: string;
}

export default ({ dialogVisible, setDialogVisible, member }: IAddMemberDialogProps) => {

    const { t } = useTranslation();

    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useRecoilValue(solidrClientState);
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const tx = useRecoilValue(txState);

    const [formData, setFormData] = useState<Partial<IRegisterMemberParams>>({ name: member.name });

    if (!anchorWallet || !solidrClient || !sessionCurrent) return <></>;

    return (
        <Dialog disableEscapeKeyDown maxWidth={'sm'} aria-labelledby={'edit-member-title'} open={dialogVisible}>
            <DialogTitle id={'edit-member-title'}>{t('session.member.edit.title')}</DialogTitle>
            <DialogContent dividers>
                <FormContainer
                    defaultValues={formData}
                    onSuccess={(data: IRegisterMemberParams) => {
                        setFormData(data);
                        solidrClient?.updateSessionMember(anchorWallet, sessionCurrent.session?.sessionId, member.addr, data.name).then(() => {
                            setDialogVisible(false);
                        });
                    }}
                >
                    <Stack direction={'column'}>
                        <TextFieldElement type={'text'} name={'name'} label={t('session.member.edit.form.name')} required={true} />
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
