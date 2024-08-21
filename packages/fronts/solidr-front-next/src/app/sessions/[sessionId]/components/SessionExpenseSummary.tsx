

import { useTranslations } from 'next-intl';
import { useFormatter } from 'next-intl';

interface Props {
    myTotalCost: number;
    totalExpenses: number;
    totalRefunds: number;
}
export default ({ myTotalCost, totalExpenses, totalRefunds }: Props) => {
    const t = useTranslations();
    const format = useFormatter();
    const currency = 'USD';

    return <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Cost */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h6 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-200">
                {t('session.summary.totalCost')}
            </h6>
            <p className="text-2xl text-customBlue dark:text-customBlue">
                {format.number(myTotalCost, { style: 'currency', currency })}
            </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h6 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-200">
                {t('session.summary.totalExpenses')}
            </h6>
            <p className="text-2xl text-customBlue dark:text-customBlue">
                {format.number(totalExpenses, { style: 'currency', currency })}
            </p>
        </div>

        {/* Total Refunds (Visible only on lg screens and above) */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 shadow-md rounded-lg p-4">
            <h6 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-200">
                {t('session.summary.totalRefunds')}
            </h6>
            <p className="text-2xl text-customBlue dark:text-customBlue">
                {format.number(totalRefunds, { style: 'currency', currency })}
            </p>
        </div>
    </div>
}