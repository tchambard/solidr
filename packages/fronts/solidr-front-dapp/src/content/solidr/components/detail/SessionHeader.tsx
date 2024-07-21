import { Suspense } from 'react';
import { Box, Grid, Typography } from '@mui/material';

import { useRecoilValue } from 'recoil';
import { sessionCurrentState } from '@/store/sessions';
import AppLoading from '@/components/loading/AppLoading';

export default () => {

    const sessionCurrent = useRecoilValue(sessionCurrentState);

    if (!sessionCurrent.session) {
        return <Suspense fallback={<AppLoading />} />;
    }

    return (
        <Grid container justifyContent={'space-between'} alignItems={'center'} style={{ paddingTop: '10px', paddingBottom: '10px' }}>
            <Grid item>
                <Typography variant={'h5'} component={'h5'} gutterBottom>
                    {sessionCurrent.session.name} - {sessionCurrent.session.description}
                </Typography>
            </Grid>
            <Grid item>
                <Grid item>
                    <Box sx={{ width: '100%' }}></Box>
                </Grid>
            </Grid>
        </Grid>
    );
};
