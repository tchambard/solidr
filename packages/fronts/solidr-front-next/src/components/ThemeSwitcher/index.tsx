"use client";

import React, { useCallback, useEffect } from "react";
import { useLocalStorage } from "@solana/wallet-adapter-react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { useTheme } from 'next-themes';

const ThemeSwitcher = () => {
    const [localColorMode, setLocalColorMode] = useLocalStorage<string>("solidr.color.mode", "dark");
    const { theme, setTheme } = useTheme();

    const toggleColorMode = useCallback(() => {
        if (theme === "light") {
            setLocalColorMode("dark");
            setTheme("dark");
        } else {
            setLocalColorMode("light");
            setTheme("light");
        }
    }, [theme, setLocalColorMode, setTheme]);

    useEffect(() => {
        if (localColorMode === "dark") {
            setTheme("dark");
        } else {
            setTheme("light");
        }
    }, [localColorMode]);

    return (
        <button
            onClick={toggleColorMode}
            className="p-2 rounded-full text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none"
        >
            {theme === "light" ? (
                <MoonIcon className="h-6 w-6 text-gray-800" aria-label="Dark Mode" />
            ) : (
                <SunIcon className="h-6 w-6 text-yellow-400" aria-label="Light Mode" />
            )}
        </button>
    );
}


export default ThemeSwitcher;