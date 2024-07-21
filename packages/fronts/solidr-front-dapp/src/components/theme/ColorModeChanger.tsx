import React from 'react';
import { useCallback, useEffect } from 'react';
import { IconButton } from '@mui/material';
import { LightModeRounded, DarkModeRounded } from '@mui/icons-material';

import { EpicsGrey, EpicsBlue } from '@/constants/colors';
import { useRecoilState } from 'recoil';
import { ColorModeState, colorModeState } from '@/store/colorMode';
import { useLocalStorage } from '@solana/wallet-adapter-react';

export default function ColorModeChanger() {
    const [localColorMode, setLocalColorMode] = useLocalStorage<ColorModeState>(`solidr.color.mode`, "light");

    const [colorMode, setColorMode] = useRecoilState(colorModeState);

    const toggleColorMode = useCallback(() => {
        if (colorMode === 'light') {
            setLocalColorMode('dark');
            setColorMode('dark');
        } else {
            setLocalColorMode('light');
            setColorMode('light');
        }
    }, [colorMode, setColorMode]);

    useEffect(() => {
        setColorMode(localColorMode);
    }, []);

    useEffect(() => {
        switch (colorMode) {
            case 'light': {
                document.documentElement.style.setProperty('--Epics-title', EpicsGrey[500]);
                document.documentElement.style.setProperty('--Epics-main', EpicsGrey[400]);
                document.documentElement.style.setProperty('--Epics-bg', EpicsGrey[100]);
                document.documentElement.style.setProperty(
                    '--Epics-border',
                    EpicsGrey.border,
                );

                document.documentElement.style.setProperty('--Epics-link', EpicsBlue[400]);
                document.documentElement.style.setProperty(
                    '--Epics-link-hover',
                    EpicsBlue[300],
                );
                document.documentElement.style.setProperty(
                    '--Epics-link-visited',
                    EpicsBlue[500],
                );

                break;
            }
            case 'dark': {
                document.documentElement.style.setProperty(
                    '--Epics-title',
                    EpicsGrey.contrastText,
                );
                document.documentElement.style.setProperty(
                    '--Epics-main',
                    EpicsGrey.darkTextMain,
                );
                document.documentElement.style.setProperty('--Epics-bg', EpicsGrey[500]);
                document.documentElement.style.setProperty(
                    '--Epics-border',
                    EpicsGrey[400],
                );
                document.documentElement.style.setProperty('--Epics-link', EpicsBlue[200]);
                document.documentElement.style.setProperty(
                    '--Epics-link-hover',
                    EpicsBlue[100],
                );
                document.documentElement.style.setProperty(
                    '--Epics-link-visited',
                    EpicsBlue[300],
                );
                break;
            }
        }
    }, [colorMode]);

    return (
        <>
            <IconButton onClick={() => toggleColorMode()}>
                {colorMode === 'light' ? (
                    <DarkModeRounded aria-label="Dark Mode" />
                ) : (
                    <LightModeRounded aria-label="Light Mode" />
                )}
            </IconButton>
        </>
    );
}
