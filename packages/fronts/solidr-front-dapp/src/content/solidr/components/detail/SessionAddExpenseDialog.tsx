import * as _ from 'lodash';
import React, { useState } from 'react';
import { FormContainer, TextFieldElement } from 'react-hook-form-mui';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, FormLabel, FormControl, FormGroup, FormControlLabel, FormHelperText, Checkbox } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { LoadingButton } from '@mui/lab';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { useRecoilValue } from 'recoil';
import { solidrClientState, txState } from '@/store/wallet';
import { sessionCurrentState } from '@/store/sessions';
import { Wallet } from '@coral-xyz/anchor';

interface IAddExpenseDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

interface IRegisterExpenseParams {
    name: string;
    amount: number;
    members: IMember[];
}

interface IMember {
    name: string;
    address: string;
}

export default ({ dialogVisible, setDialogVisible }: IAddExpenseDialogProps) => {

    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useRecoilValue(solidrClientState);
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const tx = useRecoilValue(txState);

    const [formData, setFormData] = useState<Partial<IRegisterExpenseParams>>({});

    if (!anchorWallet || !solidrClient || !sessionCurrent) return <></>;

    const [state, setState] = React.useState({

        {_.map(sessionCurrent.members, (member, address) =>
            {
                [member.name]: false,
            }
    )}

        gilad: true,
        jason: false,
        antoine: false,
      });

    return (
        <Dialog disableEscapeKeyDown maxWidth={'sm'} aria-labelledby={'register-expense-title'} open={dialogVisible}>
            <DialogTitle id={'register-expense-title'}>{'Add a new expense'}</DialogTitle>
            <DialogContent dividers>
                <FormContainer
                    defaultValues={formData}
                    onSuccess={(data: IRegisterExpenseParams) => {
                        setFormData(data);
                        solidrClient?.addExpense(anchorWallet, sessionCurrent.session?.sessionId, data.name, data.amount).then(() => {
                            setDialogVisible(false);
                        });
                    }}
                >
                    <Stack direction={'column'}>
                        <TextFieldElement type={'text'} name={'name'} label={'Name'} required={true} />
                        <br />
                        <TextFieldElement type={'text'} name={'amount'} label={'Amount'} required={true} />
                        <br />
                        <FormControl component='fieldset' sx={{ m: 3 }} variant='standard'>
                            <FormLabel component='legend'>Pick two</FormLabel>
                            <FormGroup>
                            {_.map(sessionCurrent.members, (member, address) =>
                                    <FormControlLabel control={<Checkbox checked={true} name={member.name} />} label={member.name} />
                            )}
                            </FormGroup>
                        </FormControl>
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
