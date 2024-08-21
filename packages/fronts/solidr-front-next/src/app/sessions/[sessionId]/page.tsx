"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { BN, Wallet } from '@coral-xyz/anchor';
import { Session, SessionMember, SessionStatus } from '@solidr';
import { SessionCurrentState, defaultSessionState, sessionCurrentState } from '@/store/sessions';
import { useTranslations } from 'next-intl';
import { useSolidrClient } from '@/providers/solidr/SolidrClientContext';
import Head from 'next/head';
import { useRecoilState } from 'recoil';
import _ from 'lodash';
import { useParams, useRouter } from 'next/navigation';
import SessionAccessDenied from './components/common/SessionAccessDenied';
import SessionNotFound from './components/common/SessionNotFound';
import SessionInfo from './components/SessionInfo';
import { TabPanel, TabPanelButton } from '@/components/TabPanel.tsx';
import SessionExpenseSummary from './components/SessionSummary';
import SessionMembersContainer from './components/members/SessionMembersContainer';
import SessionExpensesContainer from './components/operations/SessionExpensesContainer';
import SessionTransfersContainer from './components/transfers/SessionTransfersContainer';

export default () => {
    const t = useTranslations();

    const [value, setValue] = useState<number>(0);
    const [sessionNotFound, setSessionNotFound] = useState(false)
    const [session, setSession] = useState<Session | undefined>()

    const handleChange = (index: number) => {
        setValue(index);
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640; // Exemple de gestion de mobile

    const router = useRouter();

    const { sessionId } = useParams();
    const [sessionCurrent, setSessionCurrent] = useRecoilState(sessionCurrentState);
    const solidrClient = useSolidrClient();
    const anchorWallet = useAnchorWallet() as Wallet;

    const updateSessionClosed = () => {
        setSessionCurrent((sessionState) => {
            const newSessionCurrent: any = {
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
        solidrClient!.listSessionMembers(sessionId).then((members) => {
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
        solidrClient!.listSessionExpenses(sessionId).then((expenses) => {
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
        solidrClient!.listSessionRefunds(sessionId).then((refunds) => {
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
        const { totalExpenses, totalRefunds, balances, transfers } = solidrClient!.computeBalance(
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

            solidrClient.getSession(sessionAccountAddress).then((session) => {
                if (!session) {
                    setSessionNotFound(true);
                } else {
                    Promise.all([
                        // TODO: manage pagination for members and expenses
                        solidrClient.listSessionMembers(sid),
                        solidrClient.listSessionExpenses(sid),
                        solidrClient.listSessionRefunds(sid),
                    ]).then(([members, expenses, refunds]) => {
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
                }
            });

        } else {
            const sessionClosedListener = solidrClient.addEventListener('sessionClosed', (event) => {
                if (sessionId != event.sessionId) return;
                console.log('sessionClosed');
                updateSessionClosed();
            });
            sessionClosedListener && listeners.push(sessionClosedListener);
            const sessionDeletedListener = solidrClient.addEventListener('sessionDeleted', (event) => {
                if (sessionId != event.sessionId) return;
                console.log('sessionDeleted');
                router.push('/sessions');
            });
            sessionDeletedListener && listeners.push(sessionDeletedListener);
            const memberAddedListener = solidrClient.addEventListener('memberAdded', (event) => {
                if (sessionId != event.sessionId) return;
                console.log('memberAdded');
                updateMemberList(event.sessionId);
            });
            memberAddedListener && listeners.push(memberAddedListener);
            const memberUpdatedListener = solidrClient.addEventListener('memberUpdated', (event) => {
                if (sessionId != event.sessionId) return;
                console.log('memberUpdated');
                updateMemberList(event.sessionId);
            });
            memberUpdatedListener && listeners.push(memberUpdatedListener);
            const expenseAddedListener = solidrClient.addEventListener('expenseAdded', (event) => {
                if (sessionId != event.sessionId) return;
                console.log('expenseAdded');
                updateExpenseList(event.sessionId);
            });
            expenseAddedListener && listeners.push(expenseAddedListener);
            const expenseUpdatedListener = solidrClient.addEventListener('expenseUpdated', (event) => {
                if (sessionId != event.sessionId) return;
                console.log('expenseUpdated');
                updateExpenseList(event.sessionId);
            });
            expenseUpdatedListener && listeners.push(expenseUpdatedListener);
            const expenseDeletedListener = solidrClient.addEventListener('expenseDeleted', (event) => {
                if (sessionId != event.sessionId) return;
                console.log('expenseDeleted');
                updateExpenseList(event.sessionId);
            });
            expenseDeletedListener && listeners.push(expenseDeletedListener);
            const refundAddedListener = solidrClient.addEventListener('refundAdded', (event) => {
                if (sessionId != event.sessionId) return;
                console.log('refundAdded');
                updateRefundList(event.sessionId);
            });
            refundAddedListener && listeners.push(refundAddedListener);
        }

        return () => {
            listeners.forEach((listener) => {
                solidrClient.program.removeEventListener(listener);
            });
        };
    }, [solidrClient, sessionCurrent.session?.sessionId]);

    if (sessionNotFound) {
        return <SessionNotFound />
    }

    if (!sessionCurrent.session) {
        return <Suspense />;
    }

    if (!_.keys(sessionCurrent.members).includes(anchorWallet.publicKey.toString())) {
        return <SessionAccessDenied />;
    }

    return (
        <>
            <Head>
                <title>{sessionCurrent.session.name} - {sessionCurrent.session.description}</title>
            </Head>
            <div className="space-y-4">
                <div>
                    <SessionInfo session={sessionCurrent.session} />
                    <SessionExpenseSummary
                        myTotalCost={sessionCurrent.myTotalCost}
                        totalExpenses={sessionCurrent.totalExpenses}
                        totalRefunds={sessionCurrent.totalRefunds}
                    />
                </div>
                <div>
                    <div className={`flex justify-center border-b border-gray-200`}>
                        <TabPanelButton label={t('session.tabs.members')} isActive={value === 0} onClick={() => handleChange(0)} />
                        <TabPanelButton label={t('session.tabs.expenses')} isActive={value === 1} onClick={() => handleChange(1)} />
                        <TabPanelButton label={t('session.tabs.balance')} isActive={value === 2} onClick={() => handleChange(2)} />
                    </div>
                    <TabPanel value={value} index={0}>
                        <div className="space-y-4">
                            <div>
                                <SessionMembersContainer />
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value={value} index={1}>
                        <div className="space-y-4">
                            <div>
                                <SessionExpensesContainer />
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value={value} index={2}>
                        <div className="space-y-4">
                            <div>
                                <SessionTransfersContainer />
                            </div>
                        </div>
                    </TabPanel>
                </div>
            </div>
        </>
    );
}
