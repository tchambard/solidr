import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function GetStartedSection() {
    const t = useTranslations('home.getStarted');

    return (
        <section id="get-started" className="py-20 bg-gradient-to-r from-solanaGreen to-solanaPurple text-white text-center">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-semibold">{t('heading')}</h2>
                <p className="mt-4 text-lg md:text-xl">{t('description')}</p>
                <div className="mt-8">
                    <Link href={`/sessions`} passHref>
                        <button className="bg-white text-black py-2 px-4 rounded-md">
                            {t('button')}
                        </button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
