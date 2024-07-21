import * as _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, FormLabel, Stack } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { LoadingButton } from '@mui/lab';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useRecoilValue } from 'recoil';
import { solidrClientState, txState } from '@/store/wallet';
import { sessionCurrentState } from '@/store/sessions';
import { BN, Wallet } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { Expense } from 'solidr-program';

interface IModifyExpenseDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
    currentExpense: Expense;
}

interface IModifyExpenseParams {
    name: string;
    amount: number;
    members: IParticipant[];
}

interface IParticipant {
    name: string;
    address: PublicKey;
    checked: boolean;
}

export default ({ dialogVisible, setDialogVisible, currentExpense }: IModifyExpenseDialogProps) => {
    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useRecoilValue(solidrClientState);
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const tx = useRecoilValue(txState);

    const [formData, setFormData] = useState<Partial<IModifyExpenseParams>>({
        name: currentExpense.name,
        amount: currentExpense.amount,
    });

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
                checked: currentExpense.participants.find((participant) => participant.toString() == member.addr.toString()),
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

    const participantsList = (participants: { [address: string]: IParticipant }) => {
        if (_.isEmpty(participants)) return;

        const current = _.find(participants, (part) => part.address.toString() == anchorWallet.publicKey.toString());
        const others = _.sortBy(
            _.filter(participants, (part) => part.address.toString() != anchorWallet.publicKey.toString()),
            ['name'],
        );

        return (
            <FormControl component="fieldset" sx={{ m: 3 }} variant="standard">
                <FormLabel component="legend">Choose participants</FormLabel>
                <FormGroup>
                    <FormControlLabel control={<Checkbox checked={true} disabled={true} name={current.name} />} label={current.name} />
                    {_.map(others, (member) => (
                        <FormControlLabel
                            control={<Checkbox checked={member.checked} name={member.name} onChange={() => handleParticipantOnClick(member)} />}
                            label={member.name}
                        />
                    ))}
                </FormGroup>
            </FormControl>
        );
    };

    return (
        <Dialog disableEscapeKeyDown maxWidth={'sm'} aria-labelledby={'modify-expense-title'} open={dialogVisible}>
            <DialogTitle id={'modify-expense-title'}>{'Modify an expense'}</DialogTitle>
            <DialogContent dividers>
                <FormContainer
                    defaultValues={formData}
                    onSuccess={(data: IModifyExpenseParams) => {
                        setFormData(data);

                        const participantList = _.filter(participants, (participant) => participant.checked).map((participant) => participant.address);
                        solidrClient
                            ?.updateExpense(anchorWallet, sessionCurrent.session?.sessionId, new BN(currentExpense.expenseId), data.name, data.amount, participantList)
                            .then(() => {
                                setDialogVisible(false);
                            });
                    }}
                >
                    <Stack direction={'column'}>
                        <TextFieldElement type={'text'} name={'name'} label={'Name'} required={true} />
                        <br />
                        <TextFieldElement type={'text'} name={'amount'} label={'Amount'} required={true} />
                        <br />
                        {participantsList(participants)}
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
