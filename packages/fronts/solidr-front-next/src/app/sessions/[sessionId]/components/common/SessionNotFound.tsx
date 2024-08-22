"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default () => {

    const t = useTranslations();

    return <div className="flex flex-col justify-center items-center h-screen text-center p-5">
        <h4 className="text-2xl font-semibold mb-5">
            {t('session.notFound.title')}
        </h4>
        <p className="text-base mb-10">
            {t('session.notFound.message')}
        </p>
        <Link href={`/sessions`}>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-lg">
                {t('common.goToHome')}
            </button>
        </Link>
    </div>
};