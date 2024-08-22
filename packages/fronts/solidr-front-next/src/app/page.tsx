import Image from "next/image";
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default () => {
    const t = useTranslations('homePage');

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 px-4 md:px-8 flex flex-col items-center justify-center w-full">
            <div className="flex items-center justify-center mb-4 md:mb-4 mr-[-28px] z-10">
                <Image
                    width={240}
                    height={240}
                    src={'/logo.png'}
                    alt="Logo"
                />
            </div>
            <div className="flex items-center justify-center mt-4 md:mt-8 ml-0 md:ml-8 z-10">
                <Link href={`/sessions`} passHref>
                    <div className="bg-gradient-to-r from-purple-500 to-teal-400 text-white py-4 px-8 text-2xl font-semibold rounded-lg shadow-md hover:bg-gradient-to-r hover:from-purple-600 hover:to-teal-500 transition-colors duration-300 cursor-pointer">
                        {t('start')}
                    </div>
                </Link>
            </div>
        </div>
    );
}
