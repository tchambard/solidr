import * as _ from 'lodash';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useTranslations, useFormatter } from 'next-intl';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PlusCircleIcon, ArrowDownIcon, ArrowUpIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { Expense, Refund, SessionStatus } from '@solidr';

import { sessionCurrentState } from '@/store/sessions';
import AddressAvatarGroup from '@/components/AddressAvatarGroup';
import SectionTitleWrapper from '@/components/SectionTitleWrapper';
import Tooltip from '@/components/Tooltip';
import ActionsMenu, { IActionMenuItem } from '@/components/ActionsMenu';
import SessionAddExpenseDialog from './SessionAddExpenseDialog';
import SessionEditExpenseDialog from './SessionEditExpenseDialog';

export default () => {
    const t = useTranslations();
    const format = useFormatter();

    const anchorWallet = useAnchorWallet();

    const [addExpenseDialogVisible, setAddExpenseDialogVisible] = useState(false);
    const [editExpenseDialogVisible, setEditExpenseDialogVisible] = useState(false);
    const [currentExpense, setCurrentExpense] = useState<Expense | undefined>(undefined);

    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const itemsList = _.sortBy([...sessionCurrent?.expenses, ...sessionCurrent?.refunds], 'date');

    const renderExpense = (expense: Expense) => {
        const expenseOwner = _.find(sessionCurrent?.members, (member) => expense.owner.toString() === member.addr.toString());
        if (!expenseOwner) return null;

        const menuItems: IActionMenuItem[] = [];
        if (expenseOwner.addr.toString() === anchorWallet?.publicKey.toString()) {
            menuItems.push({
                title: t('session.operations.expense.item.menu.edit.title'),
                onClick: () => {
                    setCurrentExpense(expense);
                    setEditExpenseDialogVisible(true);
                },
                icon: <PencilIcon className="w-6 h-6 fill-customBlue" />,
            });
        }
        return (
            <li key={`expense_${expense.expenseId}`} className="flex items-center p-4 space-x-4">
                <div className="text-red-500">
                    <ArrowUpIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="font-medium text-zinc-900 dark:text-zinc-200">
                        {expense.name}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {`${t('session.operations.expense.item.paidby')} ${expenseOwner.name}`}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        <Tooltip text={format.dateTime(expense.date, "short")}>
                            {`${format.relativeTime(expense.date)}`}
                        </Tooltip>
                    </div>
                    <div className="text-zinc-900 dark:text-zinc-200">
                        {`${format.number(expense.amount, { style: 'currency', currency: 'USD' })}`}
                    </div>
                </div>
                <div className="relative flex flex-col items-end h-full">
                    <div className="flex-shrink-0">
                        {menuItems.length > 0 && (
                            <ActionsMenu items={menuItems} />
                        )}
                    </div>
                    <div className="mt-auto p-2">
                        <AddressAvatarGroup addresses={expense.participants.map((part) => part.toString())} size={20} />
                    </div>
                </div>


            </li>
        );
    };

    const renderRefund = (refund: Refund) => {
        const refundFrom = _.find(sessionCurrent?.members, (member) => refund.from.toString() === member.addr.toString());
        const refundTo = _.find(sessionCurrent?.members, (member) => refund.to.toString() === member.addr.toString());
        if (!refundFrom || !refundTo) return null;

        return (
            <li key={`refund_${refund.refundId}`} className="flex items-center p-4 space-x-4">
                <div className="text-green-500">
                    <ArrowDownIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                    <div className="font-medium text-zinc-900 dark:text-zinc-200">
                        {t('session.operations.refund.item.label')}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        {`${t('session.operations.refund.item.paidby')} ${refundFrom.name} ${t('session.operations.refund.item.paidto')} ${refundTo.name}`}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        <Tooltip text={format.dateTime(refund.date, "short")}>
                            {`${format.relativeTime(refund.date)}`}
                        </Tooltip>
                    </div>
                    <div className="flex justify-between items-center py-2">
                        <div>
                            <p className="text-zinc-900 dark:text-white">{`${format.number(refund.amount, { style: 'currency', currency: 'USD' })}`}</p>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{`${refund.amountInLamports / LAMPORTS_PER_SOL} SOL`}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-auto p-2">
                    <AddressAvatarGroup addresses={[refund.from.toString(), refund.to.toString()]} size={20} />
                </div>
            </li>
        );
    };

    return (
        <>
            <SectionTitleWrapper>
                <h1 className="text-xl font-bold text-zinc-800 dark:text-white tracking-wide">
                    {t('session.operations.list.title')}
                </h1>
                <div className="flex items-center space-x-2">
                    {sessionCurrent.session?.status === SessionStatus.Opened && (
                        <Tooltip text={t('session.operations.list.menu.add.title')}>
                            <button
                                onClick={() => setAddExpenseDialogVisible(true)}
                                className="focus:outline-none"
                            >
                                <PlusCircleIcon className="w-6 h-6" aria-hidden="true" />
                            </button>
                        </Tooltip>
                    )}
                </div>
            </SectionTitleWrapper>

            <div className="border-t border-zinc-200 dark:border-zinc-700"></div>

            <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {itemsList.length > 0 ? (
                    itemsList.map((expenseOrRefund) =>
                        (expenseOrRefund as Expense).expenseId != null ? renderExpense(expenseOrRefund as Expense) : renderRefund(expenseOrRefund as Refund),
                    )
                ) : (
                    <p className="text-center text-zinc-500 dark:text-zinc-400 mt-4">
                        {t('session.operations.list.empty')}
                    </p>
                )}
            </ul>

            {addExpenseDialogVisible && <SessionAddExpenseDialog dialogVisible={addExpenseDialogVisible} setDialogVisible={setAddExpenseDialogVisible} />}
            {editExpenseDialogVisible && (
                <SessionEditExpenseDialog dialogVisible={editExpenseDialogVisible} setDialogVisible={setEditExpenseDialogVisible} currentExpense={currentExpense!} />
            )}
        </>
    );
};
