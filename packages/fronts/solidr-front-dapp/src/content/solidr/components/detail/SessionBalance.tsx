import { useRecoilValue } from 'recoil';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { sessionCurrentState } from '@/store/sessions';
import { Doughnut } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Tooltip as ChartTooltip } from 'chart.js/auto';
import { Box } from '@mui/material';

ChartJS.register(ArcElement, ChartTooltip, Legend);

export default () => {
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const sortedBalances = Object.values(sessionCurrent.balances).sort((a, b) => {
        // Sort in descending order, with positive balances first, then negative balances
        if (a.balance >= 0 && b.balance >= 0) {
            return b.balance - a.balance;
        } else if (a.balance < 0 && b.balance < 0) {
            return a.balance - b.balance;
        } else {
            return b.balance >= 0 ? -1 : 1;
        }
    });

    const data = {
        labels: sortedBalances.map((balance) => sessionCurrent.members[balance.owner.toString()].name),
        datasets: [
            {
                data: sortedBalances.map((balance) => balance.balance),
                backgroundColor: sortedBalances.map((balance) =>
                    balance.balance >= 0 ? `rgba(0, 255, 0, ${Math.min(1, Math.abs(balance.balance) / 80)})` : `rgba(255, 0, 0, ${Math.min(1, Math.abs(balance.balance) / 80)})`,
                ),
                hoverBackgroundColor: sortedBalances.map((balance) =>
                    balance.balance >= 0 ? `rgba(0, 255, 0, ${Math.min(1, Math.abs(balance.balance) / 50)})` : `rgba(255, 0, 0, ${Math.min(1, Math.abs(balance.balance) / 50)})`,
                ),
            },
        ],
    };
    const options = {
        plugins: {
            title: {
                display: false,
            },
            legend: {
                display: true,
                position: 'left' as const,
                labels: {
                    generateLabels: (chart) => {
                        const data = chart.data;
                        if (data.labels && data.datasets.length) {
                            return data.labels.map((label, index) => ({
                                text: `${label} ${data.datasets[0].data[index].toFixed(2)}€`,
                                fillStyle: data.datasets[0].backgroundColor[index],
                            }));
                        }
                        return [];
                    },
                },
            },
        },
        cutout: '70%',
    };

    return (
        <>
            <PageTitleWrapper>
                <Grid container justifyContent={'space-between'} alignItems={'center'}>
                    <Grid item>
                        <Typography variant={'h3'} component={'h3'} gutterBottom>
                            Balances
                        </Typography>
                    </Grid>
                </Grid>
            </PageTitleWrapper>

            <Divider variant={'middle'} />
            <Box height={300} display="flex" alignItems="center" px={5}>
                <Doughnut data={data} options={options} />
            </Box>
        </>
    );
};
