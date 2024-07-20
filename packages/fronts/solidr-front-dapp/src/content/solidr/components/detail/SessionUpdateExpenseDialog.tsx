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
import { Wallet } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
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

    const [formData, setFormData] = useState<Partial<IModifyExpenseParams>>({name: currentExpense.name, amount: currentExpense.amount});

    if (!anchorWallet || !solidrClient || !sessionCurrent) return <></>;

    const [currentUser, setCurrentUser] = useState<IParticipant>({
        name: '',
        address: anchorWallet.publicKey,
        checked: true,
    });
    const [participants, setParticipants] = React.useState<{ [address: string]: IParticipant }>({});

    useEffect(() => {
        if (!sessionCurrent) {
            return;
        }

        const participants = {};
        _.forEach(sessionCurrent.members, (member, address) => {
            if (anchorWallet.publicKey.toString() == member.addr.toString()) {
                setCurrentUser({ name: member.name, address: member.addr, checked: true });
                return;
            }
            participants[address] = { name: member.name, address: member.addr, checked: currentExpense.participants.includes(member.addr) };
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

    return (
        <Dialog disableEscapeKeyDown maxWidth={'sm'} aria-labelledby={'modify-expense-title'} open={dialogVisible}>
            <DialogTitle id={'modify-expense-title'}>{'Modify an expense'}</DialogTitle>
            <DialogContent dividers>
                <FormContainer
                    defaultValues={formData}
                    onSuccess={(data: IModifyExpenseParams) => {
                        setFormData(data);

                        const participantList = _.map(participants, (participant) => participant.address);
                        solidrClient?.updateExpense(anchorWallet, sessionCurrent.session?.sessionId, currentExpense.expenseId, data.name, data.amount).then(() => {
                            setDialogVisible(false);
                        });
                    }}
                >
                    <Stack direction={'column'}>
                        <TextFieldElement type={'text'} name={'name'} label={'Name'} required={true} />
                        <br />
                        <TextFieldElement type={'text'} name={'amount'} label={'Amount'} required={true} />
                        <br />
                        <FormControl component="fieldset" sx={{ m: 3 }} variant="standard">
                            <FormLabel component="legend">Pick two</FormLabel>
                            <FormGroup>
                                <FormControlLabel control={<Checkbox checked={currentUser.checked} disabled={true} name={currentUser.name} />} label={currentUser.name} />
                                {_.map(participants, (member) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={member.checked}
                                                disabled={anchorWallet.publicKey.toString() == member.address.toString()}
                                                onChange={() => handleParticipantOnClick(member)}
                                                name={member.name}
                                            />
                                        }
                                        label={member.name}
                                    />
                                ))}
                            </FormGroup>
                        </FormControl>
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
