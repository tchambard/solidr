import { Card, Container, Grid } from '@mui/material';
import { Helmet } from 'react-helmet-async';

import PageTitleWrapper from '@/components/PageTitleWrapper';
import SessionsListHeader from './SessionListHeader';
import SessionsListTable from './SessionListTable';

export default () => {
    return (
        <>
            <Helmet>
                <title>Solidr sessions</title>
            </Helmet>
            <PageTitleWrapper>
                <SessionsListHeader />
            </PageTitleWrapper>
            <Container maxWidth={'xl'}>
                <Grid
                    container
                    direction={'row'}
                    justifyContent={'center'}
                    alignItems={'stretch'}
                    spacing={3}
                >
                    <Grid item xs={12}>
                        <Card>
                            <SessionsListTable />
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};
