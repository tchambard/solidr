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
import { BN, Wallet } from '@coral-xyz/anchor';
import { Expense } from 'solidr-program';
import SessionExpenseParticipantsList, { IParticipant } from '@/content/solidr/components/detail/SessionExpenseParticipantsList';
import { useTranslation } from 'react-i18next';

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

export default ({ dialogVisible, setDialogVisible, currentExpense }: IModifyExpenseDialogProps) => {

    const { t } = useTranslation();

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

    const formSuccessHandler = (data: IModifyExpenseParams) => {
        setFormData(data);

        const participantList = _.filter(participants, (participant) => participant.checked).map((participant) => participant.address);
        solidrClient?.updateExpense(anchorWallet, sessionCurrent.session?.sessionId, new BN(currentExpense.expenseId), data.name, data.amount, participantList).then(() => {
            setDialogVisible(false);
        });
    };

    return (
        <Dialog disableEscapeKeyDown maxWidth={'sm'} aria-labelledby={'dialog-expense-title'} open={dialogVisible}>
            <DialogTitle id={'dialog-expense-title'}>{t('session.expense.update.dialog.title')}</DialogTitle>
            <DialogContent dividers>
                <FormContainer defaultValues={formData} onSuccess={formSuccessHandler}>
                    <Stack direction={'column'}>
                        <TextFieldElement type={'text'} name={'name'} label={t('session.expense.update.dialog.form.name')} required={true} />
                        <br />
                        <TextFieldElement type={'text'} name={'amount'} label={t('session.expense.update.dialog.form.amount')} required={true} />
                        <br />
                        <SessionExpenseParticipantsList participants={participants} handleParticipantOnClick={handleParticipantOnClick} />
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
