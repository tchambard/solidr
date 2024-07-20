import { useRecoilValue } from 'recoil';
import { sessionCurrentState } from '@/store/sessions';
import { Bar } from 'react-chartjs-2';
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip as ChartTooltip } from 'chart.js/auto';
import { hexToRgba, stringToColor } from '@/lib/colors';

ChartJS.register(BarElement, CategoryScale, LinearScale, ChartTooltip);
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

    const customLabelsPlugin = {
        id: 'customLabels',
        afterDatasetsDraw(chart, args, pluginOptions) {
            const { ctx, data, scales } = chart;

            ctx.save();
            ctx.font = `${pluginOptions.font.weight} ${pluginOptions.font.size}px sans-serif`;
            ctx.textAlign = 'center';

            data.datasets[0].data.forEach((value, index) => {
                const x = scales.x.getPixelForValue(index);
                const y = scales.y.getPixelForValue(value);

                ctx.fillStyle = value >= 0 ? '#71e36f' : '#e36f6f';
                const yPos = value >= 0 ? y - 10 : y + 20;
                ctx.fillText(`${value.toFixed(2)}€`, x, yPos);
            });

            ctx.restore();
        },
    };

    const data = {
        labels: sortedBalances.map((balance) => sessionCurrent.members[balance.owner.toString()].name),
        datasets: [
            {
                data: sortedBalances.map((balance) => balance.balance),
                backgroundColor: sortedBalances.map((balance) => stringToColor(balance.owner.toString())),
                hoverBackgroundColor: sortedBalances.map((balance) => hexToRgba(stringToColor(balance.owner.toString()), 0.5).toString()),
                barPercentage: 0.9,
                borderWidth: 0,
            },
        ],
    };
    const options = {
        plugins: {
            title: {
                display: false,
                text: 'balance of costs',
                position: 'bottom' as const,
            },
            legend: {
                display: false,
            },
            customLabels: {
                font: {
                    size: 12,
                    weight: 'bold',
                },
            },
        },
        scales: {
            x: {
                display: false, // Hide x-axis completely
            },
            y: {
                display: true, // Hide y-axis labels and ticks
                beginAtZero: true,
                grid: {
                    drawBorder: false,
                    color: (context) => {
                        if (context.tick.value === 0) {
                            return 'rgba(0, 0, 0, 0.1)'; // Color of the zero line
                        }
                        return 'rgba(0, 0, 0, 0)'; // Transparent color for other grid lines
                    },
                },
                ticks: {
                    display: false,
                },
                border: {
                    display: false,
                },
            },
        },
        layout: {
            padding: {
                top: 40,
                right: 50,
                bottom: 40,
                left: 0,
            },
        },
        maintainAspectRatio: false, // Set this to false to allow the chart to resize freely
        responsive: true, // Set this to true to make the chart responsive
    };

    return <Bar data={data} options={options} plugins={[customLabelsPlugin]} />;
};
