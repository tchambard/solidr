"use client";

import { useRecoilValue } from 'recoil';
import { sessionCurrentState } from '@/store/sessions';
import { Bar } from 'react-chartjs-2';
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip as ChartTooltip } from 'chart.js/auto';
import { hexToRgba, stringToColor } from '@/services/colors';
import { useTheme } from 'next-themes';
import { useFormatter } from 'next-intl';

ChartJS.register(BarElement, CategoryScale, LinearScale, ChartTooltip);

export default () => {
    const { theme } = useTheme();
    const format = useFormatter();

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

    return <Bar
        data={{
            labels: sortedBalances.map((balance) => sessionCurrent.members[balance.owner.toString()].name),
            datasets: [
                {
                    data: sortedBalances.map((balance) => balance.balance),
                    backgroundColor: sortedBalances.map((balance) => hexToRgba(stringToColor(balance.owner.toString()), 1).toString()),
                    borderColor: sortedBalances.map((balance) => stringToColor(balance.owner.toString())),
                    hoverBackgroundColor: sortedBalances.map((balance) => hexToRgba(stringToColor(balance.owner.toString()), 0.5).toString()),
                    barPercentage: 0.9,
                    borderWidth: 1,
                },
            ],
        }}
        options={{
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
            } as any,
            scales: {
                x: {
                    display: false, // Hide x-axis completely
                },
                y: {
                    display: true, // Hide y-axis labels and ticks
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: (context: any) => {
                            if (context.tick.value === 0) {
                                return theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'; // Color of the zero line
                            }
                            return 'rgba(0, 0, 0, 0)'; // Transparent color for other grid lines
                        },
                    } as any,
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
                    right: 40,
                    bottom: 40,
                    left: 40,
                },
            },
            maintainAspectRatio: false, // Set this to false to allow the chart to resize freely
            responsive: true, // Set this to true to make the chart responsive
        }}
        plugins={[{
            id: 'customLabels',
            afterDatasetsDraw(chart, args, pluginOptions) {
                const { ctx, data, scales } = chart;

                ctx.save();
                ctx.font = `${pluginOptions?.font.weight} ${pluginOptions?.font.size}px sans-serif`;
                ctx.textAlign = 'center';

                data.datasets[0].data.forEach((value, index) => {
                    const x = scales.x.getPixelForValue(index);
                    const y = scales.y.getPixelForValue(Number(value));

                    ctx.fillStyle = Number(value) >= 0 ? '#1dc17d' : '#e36f6f';
                    const yPos = Number(value) >= 0 ? y - 10 : y + 20;
                    ctx.fillText(`${format.number(+Number(value).toFixed(2), { style: 'currency', currency: 'USD' })}`, x, yPos);
                });

                ctx.restore();
            },
        }]}
    />;
};
