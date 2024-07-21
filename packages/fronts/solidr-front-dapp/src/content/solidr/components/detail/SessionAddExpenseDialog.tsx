import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { LoadingButton } from '@mui/lab';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useRecoilValue } from 'recoil';
import { solidrClientState, txState } from '@/store/wallet';
import { sessionCurrentState } from '@/store/sessions';
import { Wallet } from '@coral-xyz/anchor';
import SessionExpenseParticipantsList, { IParticipant } from '@/content/solidr/components/detail/SessionExpenseParticipantsList';

interface IAddExpenseDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IRegisterExpenseParams {
    name: string;
    amount: number;
    members: IParticipant[];
}

export default ({ dialogVisible, setDialogVisible }: IAddExpenseDialogProps) => {
    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useRecoilValue(solidrClientState);
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const tx = useRecoilValue(txState);

    const [formData, setFormData] = useState<Partial<IRegisterExpenseParams>>({});

    if (!anchorWallet || !solidrClient || !sessionCurrent) return <></>;

    const [participants, setParticipants] = React.useState<{ [address: string]: IParticipant }>({});

    useEffect(() => {
        if (!sessionCurrent) {
            return;
        }

        const participants = {};
        _.forEach(sessionCurrent.members, (member, address) => {
            participants[address] = {
                name: member.name,
                address: member.addr,
                checked: false,
            };
        });
        setParticipants(participants);
    }, [sessionCurrent]);

    const handleParticipantOnClick = (participant: IParticipant) => {
        setParticipants({
            ...participants,
            [participant.address.toString()]: {
                ...participant,
                checked: !participant.checked,
            },
        });
    };

    const formSuccessHandler = (data: IRegisterExpenseParams) => {
        setFormData(data);

        const participantList = _.filter(participants, (participant) => participant.checked).map((participant) => participant.address);
        solidrClient?.addExpense(anchorWallet, sessionCurrent.session?.sessionId, data.name, data.amount, participantList).then(() => {
            setDialogVisible(false);
        });
    };

    return (
        <Dialog disableEscapeKeyDown maxWidth={'sm'} aria-labelledby={'dialog-expense-title'} open={dialogVisible}>
            <DialogTitle id={'dialog-expense-title'}>{'Add a new expense'}</DialogTitle>
            <DialogContent dividers>
                <FormContainer defaultValues={formData} onSuccess={formSuccessHandler}>
                    <Stack direction={'column'}>
                        <TextFieldElement type={'text'} name={'name'} label={'Name'} required={true} />
                        <br />
                        <TextFieldElement type={'text'} name={'amount'} label={'Amount'} required={true} />
                        <br />
                        <SessionExpenseParticipantsList participants={participants} handleParticipantOnClick={handleParticipantOnClick} />
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
