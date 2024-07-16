import * as _ from 'lodash';
import { Suspense, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Grid, Container, Paper } from '@mui/material';

import PageTitleWrapper from '@/components/PageTitleWrapper';

import SessionHeader from './SessionHeader';
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

const Item = styled(Paper)(({ theme }) => ({
    // color: theme.palette.text.secondary,
}));

export default () => {
    const { sessionId } = useParams();
    const [sessionCurrent, setSessionCurrent] =
        useRecoilState(sessionCurrentState);
    const solidrClient = useRecoilValue(solidrClientState);
    const anchorWallet = useAnchorWallet() as Wallet;

    useEffect(() => {
        if (solidrClient == null || sessionId == null) return;

        const listeners: number[] = [];

        if (
            !sessionCurrent ||
            sessionCurrent.session.sessionId.toString() !== sessionId
        ) {
            const sid = new BN(sessionId);
            const sessionAccountAddress = solidrClient.findSessionAccountAddress(sid);
            Promise.all([
                solidrClient.getSession(sessionAccountAddress),
                // TODO: manage pagination for members and expenses
                solidrClient.listSessionMembers(sid),
                solidrClient.listSessionExpenses(sid),
            ]).then(([session, members, expenses]) => {
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
                    refunds: [],
                    isAdmin: anchorWallet?.publicKey.toString() === session.admin.toString(),
                };
                setSessionCurrent(newSessionState);
            });
        } else {
            const sessionStatusChangesListener = solidrClient.addEventListener(
                'sessionClosed',
                (event) => {
                    setSessionCurrent({
                        ...sessionCurrent,
                        session: {
                            ...sessionCurrent.session,
                            status: SessionStatus.Closed,
                        },
                    });
                },
            );
            sessionStatusChangesListener &&
                listeners.push(sessionStatusChangesListener);

            const memberRegistrationListener = solidrClient.addEventListener(
                'memberAdded',
                (event) => {
                    solidrClient.listSessionMembers(sessionCurrent.session.sessionId).then(
                        (members) => {
                            setSessionCurrent({
                                ...sessionCurrent,
                                members: members.reduce(
                                    (acc, member) => {
                                        acc[member.addr.toString()] = member;
                                        return acc;
                                    },
                                    {} as { [pubkey: string]: SessionMember },
                                ),
                            });
                        },
                    );
                },
            );
            memberRegistrationListener && listeners.push(memberRegistrationListener);

            const expensesRegistrationListener = solidrClient.addEventListener(
                'expenseAdded',
                (event) => {
                    solidrClient.listSessionExpenses(sessionCurrent.session.sessionId).then(
                        (expenses) => {
                            setSessionCurrent({
                                ...sessionCurrent,
                                expenses,
                                session: {
                                    ...sessionCurrent.session,
                                    expensesCount: sessionCurrent.session.expensesCount + 1,
                                },
                            });
                        },
                    );
                },
            );
            expensesRegistrationListener && listeners.push(expensesRegistrationListener);
        }

        return () => {
            listeners.forEach((listener) => {
                solidrClient.program.removeEventListener(listener);
            });
        };
    }, [sessionCurrent?.session?.sessionId, sessionCurrent?.session?.status]);

    if (!sessionCurrent?.session) {
        return <Suspense fallback={<AppLoading />} />;
    }

    return (
        <>
            <Helmet>
                <title>
                    {sessionCurrent.session.name} - {sessionCurrent.session.description}
                </title>
            </Helmet>
            <PageTitleWrapper>
                <SessionHeader />
            </PageTitleWrapper>
            <Container maxWidth={'xl'}>
                <Grid
                    container
                    direction={'row'}
                    justifyContent={'center'}
                    alignItems={'stretch'}
                    spacing={3}
                >
                    <Grid item xs={12} md={6}>
                        <Item>
                            <SessionMemberList />
                        </Item>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Item>
                            <SessionExpenseList />
                        </Item>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};
