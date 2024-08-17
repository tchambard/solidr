"use client";

import React, { useState } from 'react';
import { setUserLocale } from '@/services/i18n/locale';
import { Locale } from '@/services/i18n/config';
import { GlobeAltIcon } from "@heroicons/react/24/solid";

const languages: { [lang: string]: { nativeName: string; flag: string } } = {
    en: { nativeName: 'English', flag: '🇬🇧' },
    fr: { nativeName: 'Français', flag: '🇫🇷' },
};

const LanguageSwitcher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleToggleMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setIsOpen(!isOpen);
    };

    const handleCloseMenu = () => {
        setAnchorEl(null);
        setIsOpen(false);
    };

    const handleLocaleChange = (lng: string) => {
        setUserLocale(lng as Locale);
        handleCloseMenu();
    };

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={handleToggleMenu}
                className="p-2 rounded-full text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none"
                aria-label="language"
            >
                <GlobeAltIcon className="w-6 h-6" />
            </button>
            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5"
                >
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="language-menu">
                        {Object.keys(languages).map((lng) => (
                            <button
                                key={lng}
                                onClick={() => handleLocaleChange(lng)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                                role="menuitem"
                            >
                                <span className="flex items-center">
                                    <span className="mr-3 text-lg">{languages[lng].flag}</span>
                                    {languages[lng].nativeName}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
