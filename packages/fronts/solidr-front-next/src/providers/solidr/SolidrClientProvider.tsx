"use client";

import { AnchorError, Program } from '@coral-xyz/anchor';
import { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Solidr, SolidrClient } from '@solidr';
import idl from '@solidr-idl';

import { SolidrClientContext } from './SolidrClientContext';
import { useTranslations } from 'next-intl';
import { useSnackbar } from 'notistack';

export function SolidrClientProvider({ children }: { children: React.ReactNode }) {
    const { connection } = useConnection();
    const [solidrClient, setSolidrClient] = useState<SolidrClient | null>(null);

    const t = useTranslations('wallet');
    const { publicKey } = useWallet();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (publicKey) {
            const program = new Program<Solidr>(idl as Solidr, { connection });

            const client = new SolidrClient(
                program,
                { skipPreflight: false },
                async (fn): Promise<any> => {
                    try {
                        return await fn();
                    } catch (e: any) {
                        console.error("eee", e);
                        let message = e?.transactionMessage || e?.message;
                        if (e.logs) {
                            const err = AnchorError.parse(e.logs);
                            if (err) message = err.error.errorMessage;
                        }
                        enqueueSnackbar(message, { variant: 'error' });
                    }
                },
            );

            setSolidrClient(client);
        }
    }, [publicKey, connection]);

    if (!publicKey) {
        return (
            <div className="bg-lightbg text-black dark:bg-darkbg dark:text-white h-screen flex items-center justify-center">
                <h1 className="text-2xl">{t('pleaseConnect')}</h1>
            </div>
        );
    }

    return (
        <SolidrClientContext.Provider value={solidrClient}>
            <div className="container mx-auto mt-8 px-4 ">
                {children}
            </div>
        </SolidrClientContext.Provider>
    );
}
