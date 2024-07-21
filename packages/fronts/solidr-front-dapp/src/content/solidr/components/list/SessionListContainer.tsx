import { Card, Container, Grid } from '@mui/material';
import { Helmet } from 'react-helmet-async';

import PageTitleWrapper from '@/components/PageTitleWrapper';
import SessionsListTable from './SessionListTable';
import SessionNavigation from '@/content/solidr/components/navigation/SessionNavigation';
import SessionCreateButton from '@/content/solidr/components/list/SessionCreateButton';
import { useTranslation } from 'react-i18next';

export default () => {

    const { t } = useTranslation();

    return (
        <>
            <Helmet>
                <title>{t('sessions.list.title')}</title>
            </Helmet>
            <PageTitleWrapper>
                <Grid container direction="row" justifyContent="space-between" alignItems="center">
                    <Grid>
                        <SessionNavigation />
                    </Grid>
                    <Grid>
                        <SessionCreateButton />
                    </Grid>
                </Grid>
            </PageTitleWrapper>
            <Container maxWidth={'xl'}>
                <Grid container direction={'row'} justifyContent={'center'} alignItems={'stretch'} spacing={3}>
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
