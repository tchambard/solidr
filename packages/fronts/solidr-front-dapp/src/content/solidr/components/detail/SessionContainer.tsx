import { Suspense, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Grid, Tab, Tabs, Theme, useMediaQuery, useTheme } from '@mui/material';
import * as _ from 'lodash';
import { useNavigate, useParams } from 'react-router';
import { styled } from '@mui/material/styles';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { BN, Wallet } from '@coral-xyz/anchor';
import { useHashParams } from '@/hooks/useHashParams';
import { defaultSessionState, sessionCurrentState, SessionCurrentState } from '@/store/sessions';
import { solidrClientState } from '@/store/wallet';
import { SessionMember, SessionStatus } from '@solidr';
import AppLoading from '@/components/loading/AppLoading';
import SessionJoinDialog from '@/content/solidr/components/detail/SessionJoinDialog';
import SessionAccessDenied from '@/content/solidr/components/detail/SessionAccessDenied';
import SessionMemberList from '@/content/solidr/components/detail/SessionMemberList';
import SessionExpenseSummary from '@/content/solidr/components/detail/SessionExpenseSummary';
import SessionExpenseList from '@/content/solidr/components/detail/SessionExpenseList';
import SessionTransfers from '@/content/solidr/components/detail/SessionTransfers';
import { useTranslation } from 'react-i18next';
import SessionInfo from '@/content/solidr/components/detail/SessionInfo';

const StyledTabs = styled(Tabs)(({ theme }: { theme: Theme }) => ({
    minHeight: 48,
    '& .MuiTabs-indicator': {
        height: 3,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
}));

const StyledTab = styled(Tab)(({ theme }: { theme: Theme }) => ({
    minHeight: 48,
    textTransform: 'none',
    fontWeight: 700,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    '&.Mui-selected': {
        color: theme.palette.primary.main,
    },
}));

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && <Box sx={{ py: { xs: 1, sm: 2 } }}>{children}</Box>}
        </div>
    );
}

export default () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [joinSessionDialogVisible, setJoinSessionDialogVisible] = useState(true);

    const [value, setValue] = useState(0);
    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const { sessionId } = useParams();
    const [sessionCurrent, setSessionCurrent] = useRecoilState(sessionCurrentState);
    const solidrClient = useRecoilValue(solidrClientState);
    const anchorWallet = useAnchorWallet() as Wallet;
    const params = useHashParams();
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const updateSessionClosed = () => {
        setSessionCurrent((sessionState) => {
            const newSessionCurrent = {
                ...sessionState,
                session: {
                    ...sessionState.session,
                    status: SessionStatus.Closed,
                },
            };
            return reloadSessionBalance(newSessionCurrent, anchorWallet);
        });
    };

    const updateMemberList = (sessionId: number) => {
        solidrClient.listSessionMembers(sessionId).then((members) => {
            setSessionCurrent((sessionState) => {
                const newSessionCurrent = {
                    ...sessionState,
                    members: members.reduce(
                        (acc, member) => {
                            acc[member.addr.toString()] = member;
                            return acc;
                        },
                        {} as { [pubkey: string]: SessionMember },
                    ),
                };
                return reloadSessionBalance(newSessionCurrent, anchorWallet);
            });
        });
    };

    const updateExpenseList = (sessionId: number) => {
        solidrClient.listSessionExpenses(sessionId).then((expenses) => {
            setSessionCurrent((sessionState) => {
                const newSessionCurrent = {
                    ...sessionState,
                    expenses,
                };

                return reloadSessionBalance(newSessionCurrent, anchorWallet);
            });
        });
    };

    const updateRefundList = (sessionId: number) => {
        solidrClient.listSessionRefunds(sessionId).then((refunds) => {
            setSessionCurrent((sessionState) => {
                const newSessionCurrent = {
                    ...sessionState,
                    refunds,
                };
                return reloadSessionBalance(newSessionCurrent, anchorWallet);
            });
        });
    };

    const reloadSessionBalance = (reloadSession: SessionCurrentState, anchorWallet: Wallet) => {
        const { totalExpenses, totalRefunds, balances, transfers } = solidrClient.computeBalance(
            Object.values(reloadSession.members),
            reloadSession.expenses,
            reloadSession.refunds,
        );
        return {
            ...reloadSession,
            balances,
            transfers,
            myTotalCost: balances[anchorWallet.publicKey.toString()]?.totalCost,
            totalExpenses,
            totalRefunds,
        };
    };

    useEffect(() => {
        if (solidrClient == null || sessionId == null) return;

        const listeners: number[] = [];

        if (!sessionCurrent.session || sessionCurrent.session.sessionId.toString() !== sessionId) {
            const sid = new BN(sessionId);
            const sessionAccountAddress = solidrClient.findSessionAccountAddress(sid);
            Promise.all([
                solidrClient.getSession(sessionAccountAddress),
                // TODO: manage pagination for members and expenses
                solidrClient.listSessionMembers(sid),
                solidrClient.listSessionExpenses(sid),
                solidrClient.listSessionRefunds(sid),
            ]).then(([session, members, expenses, refunds]) => {
                const newSessionState: SessionCurrentState = {
                    ...defaultSessionState,
                    session,
                    members: members.reduce(
                        (acc, member) => {
                            acc[member.addr.toString()] = member;
                            return acc;
                        },
                        {} as { [pubkey: string]: SessionMember },
                    ),
                    expenses,
                    refunds,
                    isAdmin: anchorWallet?.publicKey.toString() === session.admin.toString(),
                };
                setSessionCurrent(reloadSessionBalance(newSessionState, anchorWallet));
            });
        } else {
            const sessionClosedListener = solidrClient.addEventListener('sessionClosed', () => {
                console.log('sessionClosed');
                updateSessionClosed();
            });
            sessionClosedListener && listeners.push(sessionClosedListener);
            const sessionDeletedListener = solidrClient.addEventListener('sessionDeleted', () => {
                console.log('sessionDeleted');
                navigate('/sessions');
            });
            sessionDeletedListener && listeners.push(sessionDeletedListener);
            const memberAddedListener = solidrClient.addEventListener('memberAdded', (event) => {
                console.log('memberAdded');
                updateMemberList(event.sessionId);
            });
            memberAddedListener && listeners.push(memberAddedListener);
            const memberUpdatedListener = solidrClient.addEventListener('memberUpdated', (event) => {
                console.log('memberUpdated');
                updateMemberList(event.sessionId);
            });
            memberUpdatedListener && listeners.push(memberUpdatedListener);
            const expenseAddedListener = solidrClient.addEventListener('expenseAdded', (event) => {
                console.log('expenseAdded');
                updateExpenseList(event.sessionId);
            });
            expenseAddedListener && listeners.push(expenseAddedListener);
            const expenseUpdatedListener = solidrClient.addEventListener('expenseUpdated', (event) => {
                console.log('expenseUpdated');
                updateExpenseList(event.sessionId);
            });
            expenseUpdatedListener && listeners.push(expenseUpdatedListener);
            const expenseDeletedListener = solidrClient.addEventListener('expenseDeleted', (event) => {
                console.log('expenseDeleted');
                updateExpenseList(event.sessionId);
            });
            expenseDeletedListener && listeners.push(expenseDeletedListener);
            const refundAddedListener = solidrClient.addEventListener('refundAdded', (event) => {
                console.log('refundAdded');
                updateRefundList(event.sessionId);
            });
            refundAddedListener && listeners.push(refundAddedListener);
        }

        console.log('SessionContainer useEffect');
        return () => {
            console.log('SessionContainer destruction');
            listeners.forEach((listener) => {
                solidrClient.program.removeEventListener(listener);
            });
        };
    }, [sessionCurrent.session?.sessionId]);

    if (!sessionCurrent.session) {
        return <Suspense fallback={<AppLoading />} />;
    }

    if (!_.keys(sessionCurrent.members).includes(anchorWallet.publicKey.toString())) {
        if (params.token) {
            return <SessionJoinDialog dialogVisible={joinSessionDialogVisible} setDialogVisible={setJoinSessionDialogVisible} token={params.token} />;
        }
        return <SessionAccessDenied />;
    }

    return (
        <>
            <Helmet>
                <title>
                    {sessionCurrent.session.name} - {sessionCurrent.session.description}
                </title>
            </Helmet>

            <Grid container spacing={2} direction={'column'}>
                <Grid item>
                    <SessionInfo />
                    <SessionExpenseSummary />
                </Grid>
                <Grid item>
                    <StyledTabs value={value} onChange={handleChange} variant={isMobile ? 'fullWidth' : 'standard'} centered={!isMobile}>
                        <StyledTab label={t('session.tabs.title.members')} />
                        <StyledTab label={t('session.tabs.title.expenses')} />
                        <StyledTab label={t('session.tabs.title.balance')} />
                    </StyledTabs>
                    <TabPanel value={value} index={0}>
                        <Grid container spacing={2} direction={'column'}>
                            <Grid item xs={1}>
                                <SessionMemberList />
                            </Grid>
                        </Grid>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <Grid container spacing={2} direction={'column'}>
                            <Grid item xs={1}>
                                <SessionExpenseList />
                            </Grid>
                        </Grid>
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        <Grid container spacing={2} direction={'column'}>
                            <Grid item xs={1}>
                                <SessionTransfers />
                            </Grid>
                        </Grid>
                    </TabPanel>
                </Grid>
            </Grid>
        </>
    );
};
