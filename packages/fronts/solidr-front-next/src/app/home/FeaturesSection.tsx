import { useTranslations } from 'next-intl';

export default function FeaturesSection() {
    const t = useTranslations('home.features');

    return (
        <section id="features" className="py-20 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-semibold text-center">{t('heading')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                    {t.raw('items').map((item: any, index: number) => (
                        <div key={index} className="p-6 bg-zinc-100 dark:bg-zinc-800 rounded-lg shadow-lg">
                            <h3 className="text-2xl font-bold">{item.title}</h3>
                            <p className="mt-4">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
