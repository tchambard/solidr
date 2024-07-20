import * as _ from 'lodash';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import UploadIcon from '@mui/icons-material/Upload';
import GetAppIcon from '@mui/icons-material/GetApp';

import PageTitleWrapper from '@/components/PageTitleWrapper';
import SessionAddExpenseDialog from './SessionAddExpenseDialog';
import { Expense, Refund, SessionMember, SessionStatus } from '@solidr';
import { sessionCurrentState } from '@/store/sessions';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import AddressAvatar from '@/components/AddressAvatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { formatRelative } from 'date-fns';
import SessionModifyExpenseDialog from './SessionUpdateExpenseDialog';
import SessionUpdateExpenseDialog from './SessionUpdateExpenseDialog';

export default () => {
    const theme = useTheme();

    const [addExpenseDialogVisible, setAddExpenseDialogVisible] = useState(false);
    const [updateExpenseDialogVisible, setUpdatExpenseDialogVisible] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(undefined);

    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const itemsList = _.sortBy([...sessionCurrent?.expenses, ...sessionCurrent?.refunds], 'date');
    console.log('itemsList :>> ', JSON.stringify(itemsList, null, 2));
    const renderExpense = (expense: Expense) => {
        const expenseOwner = _.find(sessionCurrent?.members, (member: SessionMember) => {
            return expense.owner.toString() === member.addr.toString();
        });
        if (!expenseOwner) {
            return <></>;
        }
        return (
            <ListItem key={`expense_${expense.expenseId}`}>
                <UploadIcon style={{ color: 'red', paddingRight: '10px' }} />
                <ListItemText primary={expense.name} secondary={`Paid by ${expenseOwner.name} ${formatRelative(expense.date, new Date())}`} onClick={() => {
                    setCurrentExpense(expense);
                    setUpdatExpenseDialogVisible(!updateExpenseDialogVisible);
                }} />
                <ListItemText primary={expense.amount + '$'} />
                <ListItemAvatar>
                    <AddressAvatar key={`expense_owner_avatar-${expenseOwner.addr.toString()}`} address={expenseOwner.addr.toString()} size={24} />
                </ListItemAvatar>
            </ListItem>
        );
    }

    const renderRefund = (refund: Refund) => {
        const refundFrom = _.find(sessionCurrent?.members, (member: SessionMember) => {
            return refund.from.toString() === member.addr.toString();
        });
        const refundTo = _.find(sessionCurrent?.members, (member: SessionMember) => {
            return refund.to.toString() === member.addr.toString();
        });
        if (!refundFrom || !refundTo) {
            return <></>;
        }
        return (
            <ListItem key={`toto_${refund.refundId}`}>
                <GetAppIcon style={{ color: 'green', paddingRight: '10px' }} />
                <ListItemText primary={'Refund'} secondary={`Paid by ${refundFrom.name} to ${refundTo.name} ${formatRelative(refund.date, new Date())}`} />
                <ListItemText primary={refund.amount + '$'} />
                <ListItemAvatar >
                    <AddressAvatar key={`refund_from_avatar-${refundFrom.addr.toString()}`} address={refundFrom.addr.toString()} size={24} />
                </ListItemAvatar>
                <ListItemAvatar >
                    <AddressAvatar key={`refund_to_avatar-${refundTo.addr.toString()}`} address={refundTo.addr.toString()} size={24} />
                </ListItemAvatar>
            </ListItem>
        );
    }

    return (
        <>
            <PageTitleWrapper>
                <Grid container justifyContent={'space-between'} alignItems={'center'}>
                    <Grid item>
                        <Typography variant={'h3'} component={'h3'} gutterBottom>
                            List of expenses
                        </Typography>
                    </Grid>
                    <Grid item>
                        {sessionCurrent.session?.status === SessionStatus.Opened && (
                            <Tooltip placement={'bottom'} title={'Register new expense'}>
                                <IconButton color={'primary'} onClick={() => setAddExpenseDialogVisible(!addExpenseDialogVisible)}>
                                    <AddCircleIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Grid>
                </Grid>
            </PageTitleWrapper>

            <Divider variant={'middle'} />

            <List
                sx={{
                    width: '100%',
                    // hover states
                    '& .MuiListItem-root:hover':
                        sessionCurrent.session?.status === SessionStatus.Opened
                            ? {
                                bgcolor: theme.palette.action.hover,
                                cursor: 'pointer',
                            }
                            : undefined,
                }}
            >
                {itemsList.map((expenseOrRefund) => {
                    return (expenseOrRefund as Expense).expenseId != null ? renderExpense(expenseOrRefund as Expense) : renderRefund(expenseOrRefund as Refund);
                })}
                <Divider variant={'middle'} />
                <ListItem key={`expense_total`}>
                    <MyTotalCost totalCost={sessionCurrent?.myTotalCost} />
                    <TotalExpenses totalExpenses={sessionCurrent?.totalExpenses} />
                </ListItem>
            </List>

            {addExpenseDialogVisible && <SessionAddExpenseDialog dialogVisible={addExpenseDialogVisible} setDialogVisible={setAddExpenseDialogVisible} />}
            {updateExpenseDialogVisible && <SessionUpdateExpenseDialog dialogVisible={updateExpenseDialogVisible} setDialogVisible={setUpdatExpenseDialogVisible} currentExpense={currentExpense}/>}
        </>
    );
};

const MyTotalCost: React.FC<{ totalCost: number | undefined }> = ({ totalCost }) => {
    return <ListItemText primary={`My total cost ${totalCost ?? 0}$`} />;
};

const TotalExpenses: React.FC<{ totalExpenses: number | undefined }> = ({ totalExpenses }) => {
    return <ListItemText primary={`Total expenses ${totalExpenses ?? 0}$`} />;
};
