"use client";

import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import Image from "next/image";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import dynamic from 'next/dynamic';
import '@solana/wallet-adapter-react-ui'
import Link from 'next/link';
const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export default function DefaultHeader() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();

    const [solanaBalance, setSolanaBalance] = useState<number | null>(null);

    useEffect(() => {
        if (publicKey) {
            connection.getBalance(publicKey).then((balance) => setSolanaBalance(balance / LAMPORTS_PER_SOL));
        } else {
            setSolanaBalance(null);
        }
    }, [publicKey, connection]);

    return (
        <header className="fixed top-0 left-0 w-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-md z-50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/">
                    <Image src="/logo.png" alt="SolidR Logo" className="h-10" />
                </Link>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {solanaBalance !== null && (
                        <div className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300">
                            <p>{solanaBalance.toFixed(4)} SOL</p>
                        </div>
                    )}

                    <ThemeSwitcher />
                    <LanguageSwitcher />

                    <div className="pl-2">
                        <div className="mt-50">
                            <WalletMultiButtonDynamic />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
