import React, { useState } from 'react';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { LoadingButton } from '@mui/lab';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { solidrClientState, txState } from '@/store/wallet';
import { useRecoilValue } from 'recoil';
import { Wallet } from '@coral-xyz/anchor';
import { Session } from '@solidr';
import { useTranslation } from 'react-i18next';

export interface IDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
    session: Session;
}

interface IUpdateSessionParams {
    name: string;
    description: string;
}

export default ({ dialogVisible, setDialogVisible, session }: IDialogProps) => {

    const { t } = useTranslation();

    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useRecoilValue(solidrClientState);

    if (!session) return;

    const [formData, setFormData] = useState<Partial<IUpdateSessionParams>>({
        name: session.name,
        description: session.description,
    });
    const tx = useRecoilValue(txState);

    if (!anchorWallet || !solidrClient) return <></>;
    return (
        <Dialog disableEscapeKeyDown maxWidth={'sm'} aria-labelledby={'new-session-title'} open={dialogVisible}>
            <DialogTitle id={'edit-session-title'}>{t('session.edit.title')}</DialogTitle>
            <DialogContent dividers>
                <FormContainer
                    defaultValues={formData}
                    onSuccess={(data) => {
                        if (!data.name || !data.description) {
                            return;
                        }
                        setFormData(data);
                        solidrClient.updateSession(anchorWallet, session.sessionId, data.name, data.description).then(() => {
                            setDialogVisible(false);
                        });
                    }}
                >
                    <Stack direction={'column'}>
                        <TextFieldElement type={'text'} name={'name'} label={t('session.edit.form.name')} required={true} />
                        <br />
                        <TextFieldElement type={'text'} name={'description'} label={t('session.edit.form.description')} required={true} />
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
