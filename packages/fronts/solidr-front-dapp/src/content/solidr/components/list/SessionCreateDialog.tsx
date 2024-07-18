import React from 'react';
import { useEffect, useState } from 'react';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { LoadingButton } from '@mui/lab';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { solidrClientState, txState } from '@/store/wallet';
import { useRecoilValue } from 'recoil';
import { Wallet } from '@coral-xyz/anchor';

interface ISessionCreateDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ICreateSessionParams {
    name: string;
    description: string;
    memberName: string;
}

export default ({
    dialogVisible,
    setDialogVisible,
}: ISessionCreateDialogProps) => {
    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useRecoilValue(solidrClientState);
    const [formData, setFormData] = useState<Partial<ICreateSessionParams>>();
    const tx = useRecoilValue(txState);

    if (!anchorWallet || !solidrClient) return <></>;
    return (
        <Dialog
            disableEscapeKeyDown
            maxWidth={'sm'}
            aria-labelledby={'new-session-title'}
            open={dialogVisible}
        >
            <DialogTitle id={'new-session-title'}>{'Create new session'}</DialogTitle>
            <DialogContent dividers>
                <FormContainer
                    defaultValues={formData}
                    onSuccess={(data) => {
                        if (!data.name || !data.description || !data.memberName) {
                            return;
                        }
                        setFormData(data);
                        solidrClient.openSession(
                            anchorWallet,
                            data.name,
                            data.description,
                            data.memberName,
                        ).then(() => {
                            setDialogVisible(false);
                        });
                    }}
                >
                    <Stack direction={'column'}>
                        <TextFieldElement
                            type={'text'}
                            name={'name'}
                            label={'Name'}
                            required={true}
                        />
                        <br />
                        <TextFieldElement
                            type={'text'}
                            name={'description'}
                            label={'Description'}
                            required={true}
                        />
                        <br />
                        <TextFieldElement
                            type={'text'}
                            name={'memberName'}
                            label={'My name'}
                            required={true}
                        />
                        <br />
                        <LoadingButton
                            loading={tx.pending}
                            loadingPosition={'end'}
                            variant={'contained'}
                            color={'primary'}
                            endIcon={<SendIcon />}
                            type={'submit'}
                        >
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
