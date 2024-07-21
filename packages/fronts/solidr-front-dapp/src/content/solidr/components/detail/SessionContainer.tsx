import { Suspense, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Grid, Paper } from '@mui/material';
import * as _ from 'lodash';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { useParams } from 'react-router';

import SessionMemberList from './SessionMemberList';
import SessionExpenseList from './SessionExpenseList';
import styled from '@mui/styles/styled';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SessionCurrentState, sessionCurrentState } from '@/store/sessions';
import BN from 'bn.js';
import AppLoading from '@/components/loading/AppLoading';
import { solidrClientState } from '@/store/wallet';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';
import { SessionMember, SessionStatus } from '@solidr';
import SessionCloseButton from '@/content/solidr/components/detail/SessionCloseButton';
import SessionTransfers from '@/content/solidr/components/detail/SessionTransfers';
import SessionAccessDenied from './SessionAccessDenied';
import { useHashParams } from '@/hooks/useHashParams';
import SessionJoinDialog from './SessionJoinDialog';
import SessionNavigation from '@/content/solidr/components/navigation/SessionNavigation';

const Item = styled(Paper)(({ theme }) => ({
    // color: theme.palette.text.secondary,
}));

export default () => {
    const [joinSessionDialogVisible, setJoinSessionDialogVisible] = useState(true);

    const { sessionId } = useParams();
    const [sessionCurrent, setSessionCurrent] = useRecoilState(sessionCurrentState);
    const solidrClient = useRecoilValue(solidrClientState);
    const anchorWallet = useAnchorWallet() as Wallet;
    const params = useHashParams();

    useEffect(() => {
        if (solidrClient == null || sessionId == null) return;

        const listeners: number[] = [];

        const reloadSessionBalance = (sessionCurrent: SessionCurrentState, anchorWallet: Wallet) => {
            if (sessionCurrent.session) {
                solidrClient.computeBalance(Object.values(sessionCurrent.members), sessionCurrent.expenses, sessionCurrent.refunds).then((data) => {
                    const { totalExpenses, members, transfers } = data;
                    setSessionCurrent({
                        ...sessionCurrent,
                        balances: members,
                        transfers,
                        myTotalCost: members[anchorWallet.publicKey.toString()]?.totalCost,
                        totalExpenses,
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
                    balances: {},
                    transfers: [],
                    myTotalCost: 0,
                    totalExpenses: 0,
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
                solidrClient.listSessionRefunds(sessionCurrent.session?.sessionId).then((refund) => {
                    if (!sessionCurrent.session) {
                        return;
                    }
                    const newSessionCurrent = {
                        ...sessionCurrent,
                        refund,
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
            <PageTitleWrapper>
                <SessionNavigation />
                <SessionCloseButton />
            </PageTitleWrapper>
            <Container maxWidth={'xl'}>
                <Grid container alignItems={'stretch'} spacing={3} columns={{ xs: 1, sm: 2 }}>
                    <Grid item xs={1}>
                        <Grid container spacing={2} direction={'column'}>
                            <Grid item xs={1}>
                                <Item>
                                    <SessionMemberList />
                                </Item>
                            </Grid>
                            <Grid item xs={1}>
                                <Item>
                                    <SessionTransfers />
                                </Item>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={1}>
                        <Item>
                            <SessionExpenseList />
                        </Item>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};
