"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import _ from 'lodash';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { BN, Wallet } from '@coral-xyz/anchor';
import { useSolidrClient } from '@/providers/solidr/SolidrClientContext';
import { useTranslations } from 'next-intl';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { Session } from '@solidr';
import { useRecoilValue } from 'recoil';
import { sessionCurrentState } from '@/store/sessions';
import SessionNotFound from '../components/SessionNotFound';
import SessionAccessDenied from '../components/SessionAccessDenied';

interface IEditSessionParams {
    name: string;
    description: string;
}

export default () => {

    const t = useTranslations();
    const { sessionId } = useParams();
    const router = useRouter();
    const anchorWallet = useAnchorWallet() as Wallet;
    const solidrClient = useSolidrClient();

    const [session, setSession] = useState<Session>();
    const [sessionNotFound, setSessionNotFound] = useState(false)

    const [formData, setFormData] = useState<Partial<IEditSessionParams>>({});

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: formData,
    });

    const onSubmit = async (data: any) => {
        if (!solidrClient || !data.name || !data.description) return;
        setFormData(data);
        await solidrClient.updateSession(anchorWallet, new BN(sessionId), data.name, data.description);
        router.push(`/sessions/${sessionId}`)
    };

    useEffect(() => {
        if (solidrClient == null || sessionId == null) return;

        if (!session || session.sessionId.toString() !== sessionId) {
            const sessionAccountAddress = solidrClient.findSessionAccountAddress(new BN(sessionId));

            solidrClient.getSession(sessionAccountAddress).then((session) => {
                if (!session) {
                    setSessionNotFound(true);
                } else {
                    setSession(session);
                }
            });
        }
    });

    if (!anchorWallet || !solidrClient || !session) return <Suspense />;

    if (sessionNotFound) {
        return <SessionNotFound />
    }

    if (session.admin.toString() !== anchorWallet.publicKey.toString()) {
        return <SessionAccessDenied />;
    }

    return (
        <div className="flex flex-col space-y-4">
            <div className="w-full">
                <PageTitleWrapper>
                    <div className="flex items-center">
                        <button onClick={() => router.push(`/session/${session.sessionId}`)} className="mr-4 cursor-pointer">
                            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-wide">
                            {t('session.edit.title')}
                        </h1>
                    </div>
                </PageTitleWrapper>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 rounded-lg max-w-sm mx-auto">
                    <div>
                        <label className="block text-gray-900 dark:text-white mb-1" htmlFor="name">{t('session.edit.form.name.label')}*</label>
                        <input
                            type="text"
                            id="name"
                            defaultValue={session.name}
                            {...register('name', { required: true })}
                            className="w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                        />
                        {errors.name && <span className="text-red-500 text-sm">{t('session.edit.form.name.required')}</span>}
                    </div>

                    <div>
                        <label className="block text-gray-900 dark:text-white mb-1" htmlFor="description">{t('session.edit.form.description.label')}*</label>
                        <input
                            type="text"
                            id="description"
                            defaultValue={session.description}
                            {...register('description', { required: true })}
                            className="w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                        />
                        {errors.description && <span className="text-red-500 text-sm">{t('session.edit.form.description.required')}</span>}
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
            </div >
        </div >

    );
};
