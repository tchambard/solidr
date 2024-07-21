import React from 'react';
import { Chip, Typography } from '@mui/material';

import { useRecoilValue, useResetRecoilState } from 'recoil';
import { sessionCurrentState } from '@/store/sessions';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import Grid from '@mui/material/Grid';
import { NavigateBefore } from '@mui/icons-material';
import { SessionStatus } from '@solidr';
import SessionListItemActions from '@/content/solidr/components/list/SessionActionsMenu';

export default () => {
    const navigate = useNavigate();
    const sessionCurrent = useRecoilValue(sessionCurrentState);
    const resetSessionCurrent = useResetRecoilState(sessionCurrentState);

    const { t } = useTranslation();

    const handleDisplayAllSessions = () => {
        resetSessionCurrent();
        navigate('/sessions');
    };

    return (
        <PageTitleWrapper>
            <Grid container justifyContent={'space-between'} alignItems={'flex-start'} style={{ paddingTop: '10px' }}>
                <Grid item>
                    <NavigateBefore onClick={() => handleDisplayAllSessions()} />
                </Grid>
                <Grid item width={'70%'}>
                    <Typography variant={'h3'} style={{ marginBottom: '0px' }} gutterBottom>
                        {sessionCurrent.session.name}
                    </Typography>
                    <Typography variant={'subtitle2'}>
                        {sessionCurrent.session.description}
                        {sessionCurrent.session.status == SessionStatus.Closed && (
                            <Chip label="Session Closed" size="small" color="error" variant="outlined" sx={{ marginLeft: '16px' }} />
                        )}
                    </Typography>
                </Grid>
                <Grid item>
                    <SessionListItemActions session={sessionCurrent.session} />
                </Grid>
            </Grid>
        </PageTitleWrapper>
    );
};
