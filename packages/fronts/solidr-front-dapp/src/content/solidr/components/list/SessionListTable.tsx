import React, { useEffect, useState } from 'react';
import { Chip, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import { defaultSessionState, sessionCurrentState } from '@/store/sessions';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { solidrClientState } from '@/store/wallet';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';
import { useTranslation } from 'react-i18next';
import { Session, SessionStatus } from '@solidr';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import SessionCreateButton from '@/content/solidr/components/list/SessionCreateButton';
import Divider from '@mui/material/Divider';

export default () => {
    const { t } = useTranslation();

    const solidrClient = useRecoilValue(solidrClientState);
    const anchorWallet = useAnchorWallet() as Wallet;
    //const [sessionList, setSessionList] = useRecoilState(sessionListState);
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

        const sessionOpenedListener = solidrClient.addEventListener('sessionOpened', (event) => {
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
            <PageTitleWrapper>
                <Grid container justifyContent={'space-between'} alignItems={'center'} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                    <Grid item>
                        <Typography variant={'h5'} component={'h5'} gutterBottom>
                            {t('sessions.list.title')}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <SessionCreateButton />
                    </Grid>
                </Grid>
            </PageTitleWrapper>

            <Divider variant={'middle'} />

            <List sx={{ width: '100%' }}>
                {sessionList.map((session) => {
                    return (
                        <div key={`session_${session.sessionId}`}>
                            <ListItem>
                                <ListItemText secondary={session.description}>
                                    <Link to={`/sessions/${session.sessionId}`}>
                                        <Typography variant={'body1'} fontWeight={'bold'} color={'text.primary'} gutterBottom noWrap>
                                            {session.name}
                                            {session.status == SessionStatus.Closed && (
                                                <Chip label={t('session.closed.title')} size="small" color="error" variant="outlined" sx={{ marginLeft: '16px' }} />
                                            )}
                                        </Typography>
                                    </Link>
                                </ListItemText>
                            </ListItem>

                            <Divider variant={'middle'} />
                        </div>
                    );
                })}
            </List>
        </>
    );
};
