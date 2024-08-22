import { createContext, useContext } from 'react';
import { SolidrClient } from '@solidr';

export const SolidrClientContext = createContext<SolidrClient | null>(null);

export function useSolidrClient() {
    const context = useContext(SolidrClientContext);
    // if (!context) {
    //     throw new Error('useSolidrClient must be used within a SolidrClientProvider');
    // }
    return context;
}
