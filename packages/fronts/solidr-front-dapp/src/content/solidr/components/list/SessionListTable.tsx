import React, { useEffect } from 'react';
import { Card, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import SessionListItemActions from './SessionListItemActions';

import { defaultSessionState, sessionCurrentState, sessionListState } from '@/store/sessions';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { solidrClientState } from '@/store/wallet';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';
import { useTranslation } from 'react-i18next';
import { SessionStatus } from '@solidr';

export default () => {
    const { t } = useTranslation();

    const solidrClient = useRecoilValue(solidrClientState);
    const anchorWallet = useAnchorWallet() as Wallet;
    const [sessionList, setSessionList] = useRecoilState(sessionListState);
    const setSessionCurrentState = useSetRecoilState(sessionCurrentState);

    useEffect(() => {
        if (!solidrClient) return;

        setSessionCurrentState(defaultSessionState);

        const refreshUserSessions = () => {
            solidrClient.listUserSessions(anchorWallet.publicKey).then((sessions) => {
                setSessionList({
                    items: sessions,
                });
            });
        };

        refreshUserSessions();

        const listeners: number[] = [];

        const sessionOpenedListener = solidrClient.addEventListener('sessionOpened', (event) => {
            refreshUserSessions();
        });
        sessionOpenedListener && listeners.push(sessionOpenedListener);

        const sessionClosedListener = solidrClient.addEventListener('sessionClosed', (event) => {
            refreshUserSessions();
        });
        sessionClosedListener && listeners.push(sessionClosedListener);

        return () => {
            listeners.forEach((listener) => {
                solidrClient.program.removeEventListener(listener);
            });
        };
    }, [solidrClient]);

    return (
        <>
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('sessions.table.head.name')}</TableCell>
                                <TableCell>{t('sessions.table.head.description')}</TableCell>
                                <TableCell align={'right'}>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {sessionList.items.map((session) => {
                                return (
                                    <TableRow hover key={session.sessionId.toString()}>
                                        <TableCell>
                                            <Link to={`/sessions/${session.sessionId}`}>
                                                <Typography variant={'body1'} fontWeight={'bold'} color={'text.primary'} gutterBottom noWrap>
                                                    {session.name}
                                                    {session.status == SessionStatus.Closed && (
                                                        <Chip label="Session Closed" size="small" color="error" variant="outlined" sx={{ marginLeft: '16px' }} />
                                                    )}
                                                </Typography>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant={'body1'} fontWeight={'bold'} color={'text.primary'} gutterBottom noWrap>
                                                {session.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align={'right'}>
                                            <SessionListItemActions currentView={'list'} session={session} />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Card>
        </>
    );
};
