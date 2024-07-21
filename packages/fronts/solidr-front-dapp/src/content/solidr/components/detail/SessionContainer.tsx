import { Suspense, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Box, Container, Grid, Paper, Tab, Tabs, Theme, useMediaQuery, useTheme } from '@mui/material';
import * as _ from 'lodash';
import { useParams } from 'react-router';
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
import SessionNavigation from '@/content/solidr/components/navigation/SessionNavigation';
import SessionCloseButton from '@/content/solidr/components/detail/SessionCloseButton';
import SessionMemberList from '@/content/solidr/components/detail/SessionMemberList';
import SessionExpenseSummary from '@/content/solidr/components/detail/SessionExpenseSummary';
import SessionExpenseList from '@/content/solidr/components/detail/SessionExpenseList';
import SessionTransfers from '@/content/solidr/components/detail/SessionTransfers';
import { useTranslation } from 'react-i18next';

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
    useEffect(() => {
        if (solidrClient == null || sessionId == null) return;

        const listeners: number[] = [];

        const reloadSessionBalance = (sessionCurrent: SessionCurrentState, anchorWallet: Wallet) => {
            if (sessionCurrent.session) {
                solidrClient
                    .computeBalance(Object.values(sessionCurrent.members), sessionCurrent.expenses, sessionCurrent.refunds)
                    .then(({ totalExpenses, totalRefunds, members, transfers }) => {
                        setSessionCurrent({
                            ...sessionCurrent,
                            balances: members,
                            transfers,
                            myTotalCost: members[anchorWallet.publicKey.toString()]?.totalCost,
                            totalExpenses,
                            totalRefunds,
                        });
                    });
            }
        };

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
                setSessionCurrent(newSessionState);
                reloadSessionBalance(newSessionState, anchorWallet);
            });
        } else {
            const sessionStatusChangesListener = solidrClient.addEventListener('sessionClosed', (event) => {
                if (!sessionCurrent.session) {
                    return;
                }
                const newSessionCurrent = {
                    ...sessionCurrent,
                    session: {
                        ...sessionCurrent.session,
                        status: SessionStatus.Closed,
                    },
                };
                setSessionCurrent(newSessionCurrent);
                reloadSessionBalance(newSessionCurrent, anchorWallet);
            });
            sessionStatusChangesListener && listeners.push(sessionStatusChangesListener);

            const memberRegistrationListener = solidrClient.addEventListener('memberAdded', (event) => {
                solidrClient.listSessionMembers(sessionCurrent.session?.sessionId).then((members) => {
                    const newSessionCurrent = {
                        ...sessionCurrent,
                        members: members.reduce(
                            (acc, member) => {
                                acc[member.addr.toString()] = member;
                                return acc;
                            },
                            {} as { [pubkey: string]: SessionMember },
                        ),
                    };
                    setSessionCurrent(newSessionCurrent);
                    reloadSessionBalance(newSessionCurrent, anchorWallet);
                });
            });
            memberRegistrationListener && listeners.push(memberRegistrationListener);

            const expensesRegistrationListener = solidrClient.addEventListener('expenseAdded', (event) => {
                solidrClient.listSessionExpenses(sessionCurrent.session?.sessionId).then((expenses) => {
                    if (!sessionCurrent.session) {
                        return;
                    }
                    const newSessionCurrent = {
                        ...sessionCurrent,
                        expenses,
                        session: {
                            ...sessionCurrent.session,
                            expensesCount: sessionCurrent.session.expensesCount + 1,
                        },
                    };

                    setSessionCurrent(newSessionCurrent);
                    reloadSessionBalance(newSessionCurrent, anchorWallet);
                });
            });
            expensesRegistrationListener && listeners.push(expensesRegistrationListener);

            const expensesUpdateListener = solidrClient.addEventListener('expenseUpdated', (event) => {
                solidrClient.listSessionExpenses(sessionCurrent.session?.sessionId).then((expenses) => {
                    if (!sessionCurrent.session) {
                        return;
                    }
                    const newSessionCurrent = {
                        ...sessionCurrent,
                        expenses,
                        session: {
                            ...sessionCurrent.session,
                            expensesCount: sessionCurrent.session.expensesCount + 1,
                        },
                    };

                    setSessionCurrent(newSessionCurrent);
                    reloadSessionBalance(newSessionCurrent, anchorWallet);
                });
            });
            expensesUpdateListener && listeners.push(expensesUpdateListener);

            const refundRegistrationListener = solidrClient.addEventListener('refundAdded', (event) => {
                solidrClient.listSessionRefunds(sessionCurrent.session?.sessionId).then((refunds) => {
                    if (!sessionCurrent.session) {
                        return;
                    }
                    const newSessionCurrent = {
                        ...sessionCurrent,
                        refunds,
                        session: {
                            ...sessionCurrent.session,
                            refundsCount: sessionCurrent.session.refundsCount + 1,
                        },
                    };
                    setSessionCurrent(newSessionCurrent);
                    reloadSessionBalance(newSessionCurrent, anchorWallet);
                });
            });
            refundRegistrationListener && listeners.push(refundRegistrationListener);
        }

        return () => {
            listeners.forEach((listener) => {
                solidrClient.program.removeEventListener(listener);
            });
        };
    }, [sessionCurrent.session?.sessionId, sessionCurrent.session?.status]);

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
                <Grid item xs={1}>
                    <Box>
                        <SessionNavigation />
                    </Box>
                </Grid>
                <Grid item xs={1}>
                    <StyledTabs value={value} onChange={handleChange} variant={isMobile ? 'fullWidth' : 'standard'} centered={!isMobile}>
                        <StyledTab label={t("session.tabs.title.members")} />
                        <StyledTab label={t("session.tabs.title.expenses")} />
                        <StyledTab label={t("session.tabs.title.balance")} />
                    </StyledTabs>
                    <TabPanel value={value} index={0}>
                        <Grid container spacing={2}>
                            <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                {anchorWallet.publicKey.toString() === sessionCurrent.session?.admin.toString() && <SessionCloseButton />}
                            </Container>
                            <Grid container spacing={2} direction={'column'}>
                                <Grid item xs={1}>
                                    <SessionMemberList />
                                </Grid>
                            </Grid>
                        </Grid>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <Grid container spacing={2} direction={'column'}>
                            <Grid item xs={1}>
                                <SessionExpenseSummary />
                            </Grid>
                            <Grid item xs={1}>
                                <SessionExpenseList />
                            </Grid>
                        </Grid>
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        <SessionTransfers />
                    </TabPanel>
                </Grid>
            </Grid>
        </>
    );
};
