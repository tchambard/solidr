"use client";

import React, { Suspense } from 'react';
import { ReactNode, useMemo, useCallback } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { TorusWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { createDefaultAddressSelector, createDefaultAuthorizationResultCache, createDefaultWalletNotFoundHandler, SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile';
import { clusterApiUrl } from '@solana/web3.js';

import { useSnackbar } from 'notistack';

import './SolanaWalletProvider.css';

export const network = WalletAdapterNetwork.Devnet;

export default function SolanaWalletProvider({ children }: { children: ReactNode }) {

    const { enqueueSnackbar } = useSnackbar();

    const endpoint = useMemo(() => clusterApiUrl(network), []);

    const wallets = useMemo(() => [
        new SolanaMobileWalletAdapter({
            addressSelector: createDefaultAddressSelector(),
            appIdentity: {
                name: 'SolidR',
                uri: 'https://solidr.vercel.app',
                icon: '/logo.png',
            },
            authorizationResultCache: createDefaultAuthorizationResultCache(),
            chain: WalletAdapterNetwork.Devnet,
            onWalletNotFound: createDefaultWalletNotFoundHandler(),
        }),
        new TorusWalletAdapter()
    ], []);

    const onError = useCallback(
        (error: WalletError) => {
            enqueueSnackbar(
                error.message ? `${error.name}: ${error.message}` : error.name,
                { variant: 'error' },
            );
            console.error("wallet error", error);
        },
        [
            enqueueSnackbar
        ],
    );

    if (!wallets?.length) {
        return <Suspense />
    }
    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
