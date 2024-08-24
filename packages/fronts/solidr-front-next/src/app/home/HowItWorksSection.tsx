import { useTranslations } from 'next-intl';

export default function HowItWorksSection() {
    const t = useTranslations('home.howItWorks');

    return (
        <section id="how-it-works" className="py-20 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-semibold text-center">{t('heading')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-10">
                    {t.raw('steps').map((step: any, index: number) => (
                        <div key={index} className="p-6 bg-white dark:bg-zinc-700 rounded-lg shadow-lg">
                            <h3 className="text-xl font-bold">{step.title}</h3>
                            <p className="mt-4">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
