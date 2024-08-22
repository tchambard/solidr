import React, { Suspense, useEffect, useState } from 'react';
import _ from 'lodash';
import { useForm } from 'react-hook-form-mui';
import { DialogTitle } from '@headlessui/react';
import { useRecoilValue } from 'recoil';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { BN, Wallet } from '@coral-xyz/anchor';
import { sessionCurrentState } from '@/store/sessions';
import { useTranslations } from 'next-intl';
import Dialog from '@/components/Dialog';
import { useSolidrClient } from '@/providers/solidr/SolidrClientContext';
import { Expense } from '@solidr';

import SessionExpenseParticipantsList, { IParticipant } from './SessionExpenseParticipantsList';

interface IEditExpenseDialogProps {
    dialogVisible: boolean;
    setDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
    currentExpense: Expense;
}

interface IEditExpenseParams {
    name: string;
    amount: number;
}

export default ({ dialogVisible, setDialogVisible, currentExpense }: IEditExpenseDialogProps) => {

    const t = useTranslations();

    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useSolidrClient();
    const { session } = useRecoilValue(sessionCurrentState);
    const sessionCurrent = useRecoilValue(sessionCurrentState);

    const [formData, setFormData] = useState<Partial<IEditExpenseParams>>({
        name: currentExpense.name,
        amount: currentExpense.amount,
    });

    const [participants, setParticipants] = React.useState<{ [address: string]: IParticipant }>({});

    useEffect(() => {
        if (!sessionCurrent) {
            return;
        }

        const _participants: { [address: string]: IParticipant } = {};
        _.forEach(sessionCurrent.members, (member, address) => {
            _participants[address] = {
                name: member.name,
                address: member.addr,
                checked: currentExpense.participants.find((participant) => participant.toString() == member.addr.toString()) != null,
            };
        });
        setParticipants(_participants);
    }, [sessionCurrent, currentExpense.participants]);

    const handleParticipantOnClick = (participant: IParticipant) => {
        setParticipants({
            ...participants,
            [participant.address.toString()]: {
                ...participant,
                checked: !participant.checked,
            },
        });
    };

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: formData,
    });

    const onSubmit = async (data: Partial<IEditExpenseParams>) => {
        if (!solidrClient || !session || !data.name || !data.amount) return;
        setFormData(data);
        const participantList = _.filter(participants, (participant) => participant.checked).map((participant) => participant.address);
        solidrClient?.updateExpense(anchorWallet, sessionCurrent.session?.sessionId, new BN(currentExpense.expenseId), data.name, data.amount, participantList);
        setDialogVisible(false);
    };

    if (!anchorWallet || !solidrClient || !session) return <Suspense />;

    return (
        <Dialog isOpen={dialogVisible} onClose={() => setDialogVisible(false)}>
            <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-center">
                    <DialogTitle as="h3" className="text-lg font-medium leading-6 text-zinc-900 dark:text-zinc-200">
                        {t('session.operations.addExpense.title')}
                    </DialogTitle>
                </div>
                <hr className="my-4 border-zinc-300 dark:border-zinc-700" />
            </div>
            <div className="mt-5 sm:mt-4">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                    <div>
                        <label className="block text-zinc-900 dark:text-white mb-1" htmlFor="name">
                            {t('session.operations.addExpense.form.name.label')}
                        </label>
                        <input
                            type="text"
                            id="name"
                            {...register('name', { required: true })}
                            className="w-full px-4 py-2 text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                        />
                        {errors.name && <span className="text-red-500 text-sm">{t('session.operations.addExpense.form.name.required')}</span>}
                    </div>
                    <div>
                        <label className="block text-zinc-900 dark:text-white mb-1" htmlFor="amount">
                            {t('session.operations.addExpense.form.amount.label')}
                        </label>
                        <input
                            type="text"
                            id="amount"
                            {...register('amount', { required: true })}
                            className="w-full px-4 py-2 text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                        />
                        {errors.amount && <span className="text-red-500 text-sm">{t('session.operations.addExpense.form.amount.required')}</span>}
                    </div>

                    <SessionExpenseParticipantsList participants={participants} handleParticipantOnClick={handleParticipantOnClick} />

                    <div className="flex space-x-4 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 bg-customBlue hover:bg-customBlueLight text-white font-semibold rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                        >
                            {t('common.submit')} &gt;
                        </button>
                        <button
                            type="button"
                            className="px-4 py-2 text-customBlue hover:text-customBlueLight font-semibold focus:outline-none"
                            onClick={() => setDialogVisible(false)}
                        >
                            {t('common.cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </Dialog>
    );
};
