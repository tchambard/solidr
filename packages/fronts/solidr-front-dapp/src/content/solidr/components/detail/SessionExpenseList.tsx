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

export default () => {
    const theme = useTheme();

    const [addExpenseDialogVisible, setAddExpenseDialogVisible] = useState(false);

    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const itemsList = _.sortBy([...sessionCurrent?.expenses, ...sessionCurrent?.refunds], 'date');

    const renderExpense = (expense: Expense) => {
        const expenseOwner = _.find(sessionCurrent?.members, member => expense.owner.toString() === member.addr.toString());
        if (!expenseOwner) return null;

        return (
            <ListItem key={`expense_${expense.expenseId}`}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={1} sm={1}>
                        <UploadIcon style={{ color: 'red' }} />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                        <ListItemText
                            primary={expense.name}
                            secondary={`Paid by ${expenseOwner.name} ${formatRelative(expense.date, new Date())}`}
                        />
                    </Grid>
                    <Grid item xs={3} sm={3}>
                        <ListItemText primary={`${expense.amount}$`} />
                    </Grid>
                    <Grid item xs={2} sm={2}>
                        <ListItemAvatar>
                            <AddressAvatar key={`expense_owner_avatar-${expenseOwner.addr.toString()}`} address={expenseOwner.addr.toString()} size={24} />
                        </ListItemAvatar>
                    </Grid>
                </Grid>
            </ListItem>
        );
    };

    const renderRefund = (refund: Refund) => {
        const refundFrom = _.find(sessionCurrent?.members, member => refund.from.toString() === member.addr.toString());
        const refundTo = _.find(sessionCurrent?.members, member => refund.to.toString() === member.addr.toString());
        if (!refundFrom || !refundTo) return null;

        return (
            <ListItem key={`refund_${refund.refundId}`}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={1} sm={1}>
                        <GetAppIcon style={{ color: 'green' }} />
                    </Grid>
                    <Grid item xs={5} sm={5}>
                        <ListItemText
                            primary="Refund"
                            secondary={`Paid by ${refundFrom.name} to ${refundTo.name} ${formatRelative(refund.date, new Date())}`}
                        />
                    </Grid>
                    <Grid item xs={2} sm={2}>
                        <ListItemText primary={`${refund.amount}$`} />
                    </Grid>
                    <Grid item xs={2} sm={2}>
                        <ListItemAvatar>
                            <AddressAvatar key={`refund_from_avatar-${refundFrom.addr.toString()}`} address={refundFrom.addr.toString()} size={24} />
                        </ListItemAvatar>
                    </Grid>
                    <Grid item xs={2} sm={2}>
                        <ListItemAvatar>
                            <AddressAvatar key={`refund_to_avatar-${refundTo.addr.toString()}`} address={refundTo.addr.toString()} size={24} />
                        </ListItemAvatar>
                    </Grid>
                </Grid>
            </ListItem>
        );
    };

    return (
        <>
            <PageTitleWrapper>
                <Grid container justifyContent={'space-between'} alignItems={'center'} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                    <Grid item>
                        <Typography variant={'h5'} component={'h5'} gutterBottom>
                            List of operations
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
                    '& .MuiListItem-root:hover': sessionCurrent.session?.status === SessionStatus.Opened ? {
                        bgcolor: theme.palette.action.hover,
                        cursor: 'pointer',
                    } : undefined,
                }}
            >
                {itemsList.length > 0 ? (
                    <>
                        {itemsList.map(expenseOrRefund => (
                            ((expenseOrRefund as Expense).expenseId != null)
                                ? renderExpense(expenseOrRefund as Expense)
                                : renderRefund(expenseOrRefund as Refund)
                        ))}

                        <Divider variant="middle" />
                        <ListItem key="expense_total">
                            <MyTotalCost totalCost={sessionCurrent?.myTotalCost} />
                            <TotalExpenses totalExpenses={sessionCurrent?.totalExpenses} />
                        </ListItem>
                    </>
                ) : (
                    <Typography variant="body1" align="center" mt={2} pb={2}>
                        Start by adding an expense
                    </Typography>
                )}
            </List>

            {addExpenseDialogVisible && <SessionAddExpenseDialog dialogVisible={addExpenseDialogVisible} setDialogVisible={setAddExpenseDialogVisible} />}
        </>
    );
};

const MyTotalCost: React.FC<{ totalCost: number | undefined }> = ({ totalCost }) => {
    return <ListItemText primary={`My total cost ${totalCost ?? 0}$`} />;
};

const TotalExpenses: React.FC<{ totalExpenses: number | undefined }> = ({ totalExpenses }) => {
    return <ListItemText primary={`Total expenses ${totalExpenses ?? 0}$`} />;
};
