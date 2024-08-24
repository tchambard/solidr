import { useTranslations } from 'next-intl';

export default function TestimonialsSection() {
    const t = useTranslations('home.testimonials');

    return (
        <section id="testimonials" className="py-20 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-semibold text-center">{t('heading')}</h2>
                <div className="mt-10 flex justify-center">
                    <p className="text-lg md:text-xl font-medium text-center">
                        {t('comingSoon')}
                    </p>
                </div>
            </div>
        </section>
    );
}
