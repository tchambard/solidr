import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('footer');

    return (
        <footer className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-6">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="text-center md:text-left">
                    <p className="text-sm">
                        {t('text', { year: new Date().getFullYear() })}
                    </p>
                    <p className="text-sm mt-1">
                        {t('solanaText')}
                    </p>
                </div>
                <div className="flex space-x-4">
                    <a
                        href="https://github.com/your-github-username"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-900 dark:text-zinc-100 hover:text-solanaGreen dark:hover:text-solanaGreen transition-colors"
                        aria-label="GitHub"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.11.82-.26.82-.577v-2.17c-3.338.726-4.042-1.416-4.042-1.416-.546-1.386-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.085 1.838 1.24 1.838 1.24 1.07 1.834 2.807 1.304 3.492.997.108-.774.419-1.304.762-1.604-2.665-.305-5.466-1.334-5.466-5.934 0-1.31.467-2.381 1.235-3.221-.124-.304-.535-1.527.117-3.176 0 0 1.007-.322 3.3 1.23a11.484 11.484 0 013.004-.404c1.02.004 2.047.138 3.004.404 2.292-1.553 3.297-1.23 3.297-1.23.653 1.65.242 2.872.118 3.176.77.84 1.234 1.911 1.234 3.221 0 4.61-2.804 5.625-5.475 5.922.43.37.814 1.1.814 2.22v3.293c0 .32.218.694.825.576C20.565 21.795 24 17.298 24 12 24 5.373 18.627 0 12 0z" />
                        </svg>
                    </a>
                    <a
                        href="https://twitter.com/your-twitter-handle"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-900 dark:text-zinc-100 hover:text-solanaGreen dark:hover:text-solanaGreen transition-colors"
                        aria-label="Twitter"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M24 4.557a9.94 9.94 0 01-2.828.775 4.932 4.932 0 002.165-2.724 9.86 9.86 0 01-3.127 1.195 4.916 4.916 0 00-8.379 4.482A13.934 13.934 0 011.671 3.149 4.903 4.903 0 003.195 9.72a4.902 4.902 0 01-2.23-.616v.062a4.918 4.918 0 003.946 4.827 4.902 4.902 0 01-2.224.084 4.923 4.923 0 004.6 3.417A9.862 9.862 0 010 21.54a13.9 13.9 0 007.548 2.212c9.056 0 14.01-7.512 14.01-14.01 0-.214-.005-.428-.014-.64A9.985 9.985 0 0024 4.557z" />
                        </svg>
                    </a>
                </div>
            </div>
        </footer>
    );
}
