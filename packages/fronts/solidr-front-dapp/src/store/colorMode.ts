import { atom } from 'recoil';

export type ColorModeState = 'light' | 'dark';

export const colorModeState = atom<ColorModeState>({
    key: 'colorModeState',
    default: 'light',
});
