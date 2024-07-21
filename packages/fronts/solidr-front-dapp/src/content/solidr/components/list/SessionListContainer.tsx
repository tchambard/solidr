import { Grid } from '@mui/material';
import { Helmet } from 'react-helmet-async';
import SessionsListTable from './SessionListTable';
import { useTranslation } from 'react-i18next';

export default () => {
    const { t } = useTranslation();

    return (
        <>
            <Helmet>
                <title>{t('sessions.list.title')}</title>
            </Helmet>

            <Grid container spacing={2} direction={'column'}>
                <Grid item xs={1}>
                    <SessionsListTable />
                </Grid>
            </Grid>
        </>
    );
};
