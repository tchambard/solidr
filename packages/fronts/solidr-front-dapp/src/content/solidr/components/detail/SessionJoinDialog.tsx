import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { LoadingButton } from '@mui/lab';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useRecoilValue } from 'recoil';
import { solidrClientState, txState } from '@/store/wallet';
import { sessionCurrentState } from '@/store/sessions';
import { Wallet } from '@coral-xyz/anchor';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface IJoinSessionDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
    token: string;
}

interface IJoinSessionParams {
    name: string;
}

export default ({ dialogVisible, setDialogVisible, token }: IJoinSessionDialogProps) => {

    const { t } = useTranslation();

    const navigate = useNavigate();

    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useRecoilValue(solidrClientState);
    const sessionCurrent = useRecoilValue(sessionCurrentState);
    const tx = useRecoilValue(txState);

    const [formData, setFormData] = useState<Partial<IJoinSessionParams>>({});

    if (!anchorWallet || !solidrClient || !sessionCurrent?.session || !token) return <></>;

    function removeTokenHashFromUrl() {
        const newHash = window.location.hash.replace(`token=${token}`, '');
        navigate({ hash: newHash }, { replace: true });
    }

    return (
        <Dialog disableEscapeKeyDown maxWidth={'sm'} aria-labelledby={'join-session-title'} open={dialogVisible}>
            <DialogTitle id={'join-session-title'}>{`${t('session.join.title')} ${sessionCurrent.session.name}`}</DialogTitle>
            <DialogContent dividers>
                <FormContainer
                    defaultValues={formData}
                    onSuccess={(data: IJoinSessionParams) => {
                        setFormData(data);
                        solidrClient?.joinSessionAsMember(anchorWallet, sessionCurrent.session?.sessionId, data.name, token).then(() => {
                            removeTokenHashFromUrl();
                            setDialogVisible(false);
                        });
                    }}
                >
                    <Stack direction={'column'}>
                        <TextFieldElement type={'text'} name={'name'} label={t('session.join.form.name')} required={true} />
                        <br />
                        <LoadingButton loading={tx.pending} loadingPosition={'end'} variant={'contained'} color={'primary'} endIcon={<SendIcon />} type={'submit'}>
                            {t('submit')}
                        </LoadingButton>
                    </Stack>
                </FormContainer>
            </DialogContent>
            <DialogActions>
                <Link to={`/sessions`}>
                    <Button autoFocus onClick={() => setDialogVisible(false)} color={'primary'}>
                        {t('cancel')}
                    </Button>
                </Link>
            </DialogActions>
        </Dialog>
    );
};
