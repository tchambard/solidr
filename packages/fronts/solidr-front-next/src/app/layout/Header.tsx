"use client";

import React, { useEffect, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import dynamic from 'next/dynamic';
import '@solana/wallet-adapter-react-ui'
const WalletMultiButtonDynamic = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);

export default function DefaultHeader() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const router = useRouter();

    const [solanaBalance, setSolanaBalance] = useState<number | null>(null);

    useEffect(() => {
        if (publicKey) {
            connection.getBalance(publicKey).then((balance) => setSolanaBalance(balance / LAMPORTS_PER_SOL));
        } else {
            setSolanaBalance(null);
        }
    }, [publicKey, connection]);

    return (
        <div className="container mx-auto flex items-center justify-between p-4">
            <div
                onClick={() => {
                    router.push('/');
                }}
                className="flex items-center cursor-pointer"
            >
                <Image
                    width={36}
                    height={36}
                    src={'/logo.png'}
                    alt="Logo"
                    className="mr-2"
                />
            </div>

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
        </div >
    );
}
