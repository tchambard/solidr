import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

export default function HeroSection() {
    const t = useTranslations('home.hero');

    return (
        <section className="bg-gradient-to-r from-solanaGreen to-solanaPurple text-white h-screen flex flex-col justify-center items-center text-center px-4">
            <div className="max-w-4xl mx-auto">
                <Image
                    src="/logo.png"
                    alt="SolidR Logo"
                    className="h-24 md:h-32 lg:h-40 mx-auto mb-8"
                />
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                    {t('title')}
                </h1>
                <p className="mt-4 text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed">
                    {t('subtitle')}
                </p>
                <p className="mt-4 text-sm sm:text-md md:text-lg lg:text-xl italic opacity-75">
                    {t('solanaText')}
                </p>
                <div className="mt-8 space-x-4">
                    <Link href={`/sessions`} passHref>
                        <button className="bg-white text-black py-2 px-4 rounded-md text-sm md:text-base lg:text-lg">
                            {t('getStarted')}
                        </button>
                    </Link>
                    <button className="bg-transparent border border-white py-2 px-4 rounded-md text-sm md:text-base lg:text-lg">
                        {t('learnMore')}
                    </button>
                </div>
            </div>
        </section>
    );
}
