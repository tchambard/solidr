import React from 'react';
import { ReactNode, useMemo, useCallback } from 'react';
import {
    ConnectionProvider,
    WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { createDefaultAddressSelector, createDefaultAuthorizationResultCache, createDefaultWalletNotFoundHandler, SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile';
import '@/assets/style/WalletAdapter.css';
import { useSnackbar } from 'notistack';
import { useRecoilValue } from 'recoil';
import { walletState } from '@/store/wallet';

type Props = {
    children: ReactNode;
};

export default function SolanaWalletProvider({ children }: Props) {
    const { network, endpoint } = useRecoilValue(walletState);
    const wallets = useMemo(() => [
        new SolanaMobileWalletAdapter({
            addressSelector: createDefaultAddressSelector(),
            appIdentity: {
                name: 'SolidR',
                uri: 'https://solidr.vercel.app',
                icon: 'relative/path/to/icon.png',
            },
            authorizationResultCache: createDefaultAuthorizationResultCache(),
            chain: WalletAdapterNetwork.Devnet,
            onWalletNotFound: createDefaultWalletNotFoundHandler(),
        })
    ], [network]);

    const { enqueueSnackbar } = useSnackbar();
    const onError = useCallback(
        (error: WalletError) => {
            enqueueSnackbar(
                error.message ? `${error.name}: ${error.message}` : error.name,
                { variant: 'error' },
            );
            console.error(error);
        },
        [enqueueSnackbar],
    );

    return (
        <>
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} onError={onError} autoConnect>
                    <WalletModalProvider>{children}</WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </>
    );
}
