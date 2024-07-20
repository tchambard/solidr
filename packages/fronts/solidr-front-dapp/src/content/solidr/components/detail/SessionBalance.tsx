import { useRecoilValue } from 'recoil';
import { sessionCurrentState } from '@/store/sessions';
import { Doughnut } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Tooltip as ChartTooltip } from 'chart.js/auto';
import { hexToRgba, stringToColor } from '@/lib/colors';

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
                backgroundColor: sortedBalances.map((balance) => stringToColor(balance.owner.toString())),
                hoverBackgroundColor: sortedBalances.map((balance) => hexToRgba(stringToColor(balance.owner.toString()), 0.5).toString()),
            },
        ],
    };
    const options = {
        plugins: {
            title: {
                display: true,
                text: 'Costs balance',
                position: 'bottom' as const,
            },
            legend: {
                display: false,
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
        layout: {
            padding: {
                top: 20,
                right: 50,
                bottom: 20,
                left: 0,
            },
        },
        maintainAspectRatio: false, // Set this to false to allow the chart to resize freely
        responsive: true, // Set this to true to make the chart responsive
    };

    return <Doughnut data={data} options={options} />;
};
