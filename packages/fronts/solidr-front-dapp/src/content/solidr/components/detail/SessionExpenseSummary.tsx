import { Card, CardContent, Grid, Typography } from '@mui/material';

import { sessionCurrentState } from '@/store/sessions';
import { useRecoilValue } from 'recoil';

export default () => {


    const sessionCurrent = useRecoilValue(sessionCurrentState);

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            My total cost
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
                            Total expenses
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
                            Total refunds
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