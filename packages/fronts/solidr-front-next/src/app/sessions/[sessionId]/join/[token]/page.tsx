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
import { Session } from '@solidr';
import SessionNotFound from '../../components/SessionNotFound';

interface IEditSessionParams {
    memberName: string;
}

export default () => {

    const t = useTranslations();
    const { sessionId, token } = useParams();
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
        if (!solidrClient || !session || !data.memberName) return;
        setFormData(data);
        await solidrClient.joinSessionAsMember(anchorWallet, session.sessionId, data.memberName, token as string);
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

    return (
        <div className="flex flex-col space-y-4">
            <div className="w-full">
                <PageTitleWrapper>
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white tracking-wide">
                            {t('session.join.title', { name: session.name })}
                        </h1>
                    </div>
                </PageTitleWrapper>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 rounded-lg max-w-sm mx-auto">
                    <div>
                        <label className="block text-gray-900 dark:text-white mb-1" htmlFor="name">{t('session.join.form.memberName.label')}*</label>
                        <input
                            type="text"
                            id="memberName"
                            {...register('memberName', { required: true })}
                            className="w-full px-4 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-customBlue focus:outline-none"
                        />
                        {errors.memberName && <span className="text-red-500 text-sm">{t('session.join.form.memberName.required')}</span>}
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
