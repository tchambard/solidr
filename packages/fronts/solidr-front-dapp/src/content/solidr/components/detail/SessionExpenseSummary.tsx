import { Card, CardContent, Grid, Typography } from '@mui/material';

import { sessionCurrentState } from '@/store/sessions';
import { useRecoilValue } from 'recoil';
import { useTranslation } from 'react-i18next';

export default () => {

    const { t } = useTranslation();

    const sessionCurrent = useRecoilValue(sessionCurrentState);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {t('session.expense.summary.totalCost')}
                        </Typography>
                        <Typography variant="h4" color="primary">
                            {sessionCurrent.myTotalCost}$
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {t('session.expense.summary.totalExpenses')}
                        </Typography>
                        <Typography variant="h4" color="primary">
                            {sessionCurrent.totalExpenses}$
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {t('session.expense.summary.totalRefunds')}
                        </Typography>
                        <Typography variant="h4" color="primary">
                            {sessionCurrent.totalRefunds}$
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};