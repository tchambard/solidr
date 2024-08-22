"use client";

import React, { useEffect, useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';
import { Session, SessionStatus } from '@solidr';
import { defaultSessionState, sessionCurrentState } from '@/store/sessions';
import { useTranslations } from 'next-intl';
import { useSolidrClient } from '@/providers/solidr/SolidrClientContext';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Head from 'next/head';
import Tooltip from '@/components/Tooltip';
import { useSetRecoilState } from 'recoil';
import PageTitleWrapper from '@/components/PageTitleWrapper';

export default () => {
    const t = useTranslations();
    const solidrClient = useSolidrClient();
    const anchorWallet = useAnchorWallet() as Wallet;
    const [sessionList, setSessionList] = useState<Session[]>([]);
    const setSessionCurrentState = useSetRecoilState(sessionCurrentState);

    useEffect(() => {
        if (!solidrClient) return;

        setSessionCurrentState(defaultSessionState);

        const refreshUserSessions = () => {
            solidrClient.listUserSessions(anchorWallet.publicKey).then((sessions) => {
                setSessionList(sessions);
            });
        };

        refreshUserSessions();

        const listeners: number[] = [];

        const sessionOpenedListener = solidrClient.addEventListener('sessionOpened', () => {
            refreshUserSessions();
        });
        sessionOpenedListener && listeners.push(sessionOpenedListener);

        return () => {
            listeners.forEach((listener) => {
                solidrClient.program.removeEventListener(listener);
            });
        };
    }, [solidrClient]);

    return (
        <>
            <Head>
                <title>{t('sessions.list.title')}</title>
            </Head>

            <div className="flex flex-col space-y-4">
                <div className="w-full">
                    <PageTitleWrapper>
                        <h1 className="text-xl font-bold text-zinc-800 dark:text-white tracking-wide">
                            {t('sessions.list.title')}
                        </h1>
                        <div className="flex space-x-2">
                            <Tooltip text={t('sessions.create.title')}>
                                <Link href={`/sessions/create`} passHref>
                                    <PlusCircleIcon className="w-6 h-6" />
                                </Link>
                            </Tooltip>
                        </div>
                    </PageTitleWrapper>

                    <ul className="w-full">
                        {sessionList?.map((session) => (
                            <li key={`session_${session.sessionId}`}>
                                <div className="px-4 py-2">
                                    <Link href={`/sessions/${session.sessionId}`} className="block text-lg font-semibold text-zinc-800 dark:text-zinc-200 no-underline hover:underline">
                                        {session.name}
                                        {session.status === SessionStatus.Closed && (
                                            <span className="ml-4 inline-block px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 dark:bg-red-800 dark:text-red-100 border border-red-400 rounded">
                                                {t('sessions.list.item.closed')}
                                            </span>
                                        )}
                                    </Link>
                                    <p className="text-zinc-600 dark:text-zinc-400">
                                        {session.description}
                                    </p>
                                </div>
                                <hr className="my-2 border-zinc-300 dark:border-zinc-700" />
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}
