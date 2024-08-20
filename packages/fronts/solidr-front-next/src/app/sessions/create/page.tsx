"use client";

import { useForm } from 'react-hook-form';
import React, { useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { Wallet } from '@coral-xyz/anchor';
import { useSolidrClient } from '@/providers/solidr/SolidrClientContext';
import { useTranslations } from 'next-intl';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';

interface ICreateSessionParams {
    name: string;
    description: string;
    memberName: string;
}

export default () => {
    const t = useTranslations();
    const router = useRouter();
    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useSolidrClient();
    const [formData, setFormData] = useState<Partial<ICreateSessionParams>>({});

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: formData,
    });

    const onSubmit = async (data: Partial<ICreateSessionParams>) => {
        if (!solidrClient || !data.name || !data.description || !data.memberName) return;
        setFormData(data);
        const { data: { sessionId } } = await solidrClient.openSession(anchorWallet, data.name, data.description, data.memberName);
        router.push(`/sessions/${sessionId}`)
    };

    if (!anchorWallet || !solidrClient) return null;

    return (
        <div className="flex flex-col space-y-4">
            <div className="w-full">
                <PageTitleWrapper>
                    <div className="flex items-center">
                        <button onClick={() => router.push('/sessions')} className="mr-4 cursor-pointer">
                            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-wide">
                            {t('sessions.create.title')}
                        </h1>
                    </div>
                </PageTitleWrapper>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 rounded-lg max-w-sm mx-auto">
                    <div>
                        <label className="block text-gray-900 dark:text-white mb-1" htmlFor="name">{t('sessions.create.form.name.label')}*</label>
                        <input
                            type="text"
                            id="name"
                            {...register('name', { required: true })}
                            className="w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                        />
                        {errors.name && <span className="text-red-500 text-sm">{t('sessions.create.form.name.required')}</span>}
                    </div>

                    <div>
                        <label className="block text-gray-900 dark:text-white mb-1" htmlFor="description">{t('sessions.create.form.description.label')}*</label>
                        <input
                            type="text"
                            id="description"
                            {...register('description', { required: true })}
                            className="w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                        />
                        {errors.description && <span className="text-red-500 text-sm">{t('sessions.create.form.description.required')}</span>}
                    </div>

                    <div>
                        <label className="block text-gray-900 dark:text-white mb-1" htmlFor="memberName">{t('sessions.create.form.memberName.label')}*</label>
                        <input
                            type="text"
                            id="memberName"
                            {...register('memberName', { required: true })}
                            className="w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                        />
                        {errors.memberName && <span className="text-red-500 text-sm">{t('sessions.create.form.memberName.required')}</span>}
                    </div>

                    <div className="flex space-x-4 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 bg-customBlue hover:bg-customBlueLight text-white font-semibold rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                        >
                            {t('common.submit')} &gt;
                        </button>
                        <Link href={`/sessions`} passHref>
                            <button
                                type="button"
                                className="px-4 py-2 text-customBlue hover:text-customBlueLight font-semibold focus:outline-none"
                            >
                                {t('common.cancel')}
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>

    );
};
