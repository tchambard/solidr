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

    const data = {
        labels: Object.keys(sessionCurrent.balances)
            .map((address) => sessionCurrent.members[sessionCurrent.balances[address].owner.toString()].name)
            .sort((a, b) => {
                const balanceA =
                    sessionCurrent.balances[Object.keys(sessionCurrent.balances).find((key) => sessionCurrent.members[sessionCurrent.balances[key].owner.toString()].name === a)]
                        .balance;
                const balanceB =
                    sessionCurrent.balances[Object.keys(sessionCurrent.balances).find((key) => sessionCurrent.members[sessionCurrent.balances[key].owner.toString()].name === b)]
                        .balance;

                // Sort in descending order, with positive balances first, then negative balances
                if (balanceA >= 0 && balanceB >= 0) {
                    return balanceB - balanceA;
                } else if (balanceA < 0 && balanceB < 0) {
                    return balanceA - balanceB;
                } else {
                    return balanceB >= 0 ? -1 : 1;
                }
            }),
        datasets: [
            {
                data: Object.values(sessionCurrent.balances)
                    .sort((a, b) => {
                        // Sort in descending order, with positive balances first, then negative balances
                        if (a.balance >= 0 && b.balance >= 0) {
                            return b.balance - a.balance;
                        } else if (a.balance < 0 && b.balance < 0) {
                            return a.balance - b.balance;
                        } else {
                            return b.balance >= 0 ? -1 : 1;
                        }
                    })
                    .map((owner) => owner.balance),
                backgroundColor: Object.values(sessionCurrent.balances)
                    .sort((a, b) => b.balance - a.balance)
                    .map((balance) =>
                        balance.balance >= 0
                            ? `rgba(255, 0, 0, ${Math.min(1, Math.abs(balance.balance) / 80)})`
                            : `rgba(0, 255, 0, ${Math.min(1, Math.abs(balance.balance) / 80)})`,
                    ),
                hoverBackgroundColor: Object.values(sessionCurrent.balances)
                    .sort((a, b) => b.balance - a.balance)
                    .map((balance) =>
                        balance.balance >= 0
                            ? `rgba(255, 0, 0, ${Math.min(1, Math.abs(balance.balance) / 200)})`
                            : `rgba(0, 255, 0, ${Math.min(1, Math.abs(balance.balance) / 200)})`,
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
                position: 'right',
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
