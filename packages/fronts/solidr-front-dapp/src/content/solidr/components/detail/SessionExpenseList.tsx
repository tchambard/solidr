import * as _ from 'lodash';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import PageTitleWrapper from '@/components/PageTitleWrapper';
import SessionAddExpenseDialog from './SessionAddExpenseDialog';
import { SessionMember, SessionStatus } from '@solidr';
import { sessionCurrentState } from '@/store/sessions';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import AddressAvatar from '@/components/AddressAvatar';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { formatRelative, subDays } from 'date-fns'

export default () => {
    const theme = useTheme();

    const [addExpenseDialogVisible, setAddExpenseDialogVisible] = useState(false);

    const sessionCurrent = useRecoilValue(sessionCurrentState);

    return <>
        <PageTitleWrapper>
            <Grid container justifyContent={'space-between'} alignItems={'center'}>
                <Grid item>
                    <Typography variant={'h3'} component={'h3'} gutterBottom>
                        List of expenses
                    </Typography>
                </Grid>
                <Grid item>
                    {sessionCurrent?.session.status === SessionStatus.Opened && (
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
                    sessionCurrent?.session.status === SessionStatus.Opened
                        ? {
                              bgcolor: theme.palette.action.hover,
                              cursor: 'pointer',
                          }
                        : undefined,
            }}
        >
            {sessionCurrent?.expenses.map((expense) => {
                const expenseOwner = _.find(sessionCurrent?.members, (member: SessionMember) => {
                    return expense.owner.toString() === member.addr.toString();
                });
                if (!expenseOwner) {
                    return <></>;
                }
                return (
                    <ListItem key={`expense_${expense.expenseId}`}>
                        <ListItemText primary={expense.name} secondary={`Paid by ${expenseOwner.name} ${formatRelative(expense.date, new Date())}`} />
                        <ListItemText primary={expense.amount + '€'} />
                        <ListItemAvatar>
                            <AddressAvatar key={`expense_voter_avatar-${expenseOwner.addr.toString()}`} address={expenseOwner.addr.toString()} size={24}/>
                        </ListItemAvatar>
                    </ListItem>
                );
            })}
        </List>

        {addExpenseDialogVisible && <SessionAddExpenseDialog dialogVisible={addExpenseDialogVisible} setDialogVisible={setAddExpenseDialogVisible} />}
    </>;
};
