import { useEffect } from 'react';
import {
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';

import SessionListItemActions from './SessionListItemActions';

import { sessionCurrentState, sessionListState } from '@/store/sessions';
import { useRecoilState, useRecoilValue } from 'recoil';
import { solidrClientState } from '@/store/wallet';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';

export default () => {
    const solidrClient = useRecoilValue(solidrClientState);
    const anchorWallet = useAnchorWallet() as Wallet;
    const [sessionList, setSessionList] = useRecoilState(sessionListState);

    useEffect(() => {
        if (!solidrClient) return;
        if (sessionList.loaded) return;

        solidrClient.listUserSessions(anchorWallet.publicKey).then((sessions) => {
            setSessionList({
                items: sessions,
                loaded: true,
            });
        });

        const listener = solidrClient.addEventListener('sessionOpened', (event) => {
            setSessionList({
                items: sessionList.items,
                loaded: false,
            });
        });
        return () => {
            if (listener) {
                solidrClient.program.removeEventListener(listener);
            }
        };
    }, [solidrClient, sessionList.loaded]);

    return (
        <>
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell align={'right'}>Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {sessionList.items.map((session) => {
                                return (
                                    <TableRow hover key={session.sessionId.toString()}>
                                        <TableCell>
                                            <Link to={`/sessions/${session.sessionId}`}>
                                                <Typography
                                                    variant={'body1'}
                                                    fontWeight={'bold'}
                                                    color={'text.primary'}
                                                    gutterBottom
                                                    noWrap
                                                >
                                                    {session.name}
                                                </Typography>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant={'body1'}
                                                fontWeight={'bold'}
                                                color={'text.primary'}
                                                gutterBottom
                                                noWrap
                                            >
                                                {session.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align={'right'}>
                                            <SessionListItemActions
                                                currentView={'list'}
                                                sessionId={session.sessionId}
                                            />
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
