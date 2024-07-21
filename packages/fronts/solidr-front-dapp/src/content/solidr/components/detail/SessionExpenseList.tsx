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
import { Expense, Refund, SessionStatus } from '@solidr';
import { sessionCurrentState } from '@/store/sessions';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import AddressAvatar from '@/components/AddressAvatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { formatRelative } from 'date-fns';
import SessionUpdateExpenseDialog from './SessionUpdateExpenseDialog';
import AddressAvatarGroup from '@/components/AddressAvatarGroup';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Avatar, AvatarGroup } from '@mui/material';
import { KeyboardDoubleArrowRight } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default () => {

    const { t } = useTranslation();
    const theme = useTheme();
    const anchorWallet = useAnchorWallet();

    const [addExpenseDialogVisible, setAddExpenseDialogVisible] = useState(false);
    const [updateExpenseDialogVisible, setUpdatExpenseDialogVisible] = useState(false);
    const [currentExpense, setCurrentExpense] = useState<Expense>(undefined);

    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const itemsList = _.sortBy([...sessionCurrent?.expenses, ...sessionCurrent?.refunds], 'date');

    const renderExpense = (expense: Expense) => {
        const expenseOwner = _.find(sessionCurrent?.members, (member) => expense.owner.toString() === member.addr.toString());
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
                            secondary={`${t('session.expense.item.paidby')} ${expenseOwner.name} ${formatRelative(expense.date, new Date())}`}
                            onClick={() => {
                                if (expense?.owner.toString() === anchorWallet.publicKey.toString()) {
                                    setCurrentExpense(expense);
                                    setUpdatExpenseDialogVisible(!updateExpenseDialogVisible);
                                }
                            }}
                        />
                    </Grid>
                    <Grid item xs={3} sm={3}>
                        <ListItemText primary={`${expense.amount}$`} />
                    </Grid>
                    <Grid item xs={2} sm={2}>
                        <ListItemAvatar>
                            <AddressAvatarGroup addresses={expense.participants.map((part) => part.toString())} size={24} />
                        </ListItemAvatar>
                    </Grid>
                </Grid>
            </ListItem>
        );
    };

    const renderRefund = (refund: Refund) => {
        const refundFrom = _.find(sessionCurrent?.members, (member) => refund.from.toString() === member.addr.toString());
        const refundTo = _.find(sessionCurrent?.members, (member) => refund.to.toString() === member.addr.toString());
        if (!refundFrom || !refundTo) return null;

        return (
            <ListItem key={`refund_${refund.refundId}`}>
                <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={1} sm={1}>
                        <GetAppIcon style={{ color: 'green' }} />
                    </Grid>
                    <Grid item xs={5} sm={5}>
                        <ListItemText primary={t('session.refund.text')} secondary={`${t('session.refund.item.paidby')} ${refundFrom.name} ${t('session.refund.item.paidto')} ${refundTo.name} ${formatRelative(refund.date, new Date())}`} />
                    </Grid>
                    <Grid item xs={2} sm={2}>
                        <ListItemText primary={`${refund.amount}$`} />
                    </Grid>
                    <Grid item xs={4} sm={4}>
                        <ListItemAvatar>
                            <AvatarGroup>
                                <AddressAvatar key={`refund_from_avatar-${refundFrom.addr.toString()}`} address={refundFrom.addr.toString()} size={24} />
                                <Avatar
                                    sx={{
                                        width: 24,
                                        height: 24,
                                        bgcolor: '#ffffff',
                                        color: 'rgb(66, 66, 66)',
                                        fontSize: '12px',
                                        marginLeft: '6px !important',
                                    }}
                                >
                                    <KeyboardDoubleArrowRight />
                                </Avatar>
                                <AddressAvatar key={`refund_to_avatar-${refundTo.addr.toString()}`} address={refundTo.addr.toString()} size={24} marginLeft={'6px !important'} />
                            </AvatarGroup>
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
                            {t('session.operation.list.title')}
                        </Typography>
                    </Grid>
                    <Grid item>
                        {sessionCurrent.session?.status === SessionStatus.Opened && (
                            <Tooltip placement={'bottom'} title={t('session.expenses.register.tooltip')}>
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
                    '& .MuiListItem-root:hover':
                        sessionCurrent.session?.status === SessionStatus.Opened
                            ? {
                                bgcolor: theme.palette.action.hover,
                                cursor: 'pointer',
                            }
                            : undefined,
                }}
            >
                {itemsList.length > 0 ? (
                    <>
                        {itemsList.map((expenseOrRefund) =>
                            (expenseOrRefund as Expense).expenseId != null ? renderExpense(expenseOrRefund as Expense) : renderRefund(expenseOrRefund as Refund),
                        )}
                    </>
                ) : (
                    <Typography variant="body1" align="center" mt={2} pb={2}>
                        {t('session.expenses.empty.message')}
                    </Typography>
                )}
            </List>

            {addExpenseDialogVisible && <SessionAddExpenseDialog dialogVisible={addExpenseDialogVisible} setDialogVisible={setAddExpenseDialogVisible} />}
            {updateExpenseDialogVisible && (
                <SessionUpdateExpenseDialog dialogVisible={updateExpenseDialogVisible} setDialogVisible={setUpdatExpenseDialogVisible} currentExpense={currentExpense} />
            )}
        </>
    );
};
