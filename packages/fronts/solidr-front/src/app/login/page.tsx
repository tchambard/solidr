'use client';

import Head from 'next/head';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSetRecoilState } from 'recoil';
import { walletConnectedState } from '@/lib/recoilState';
import {
  WalletProvider,
  ConnectionProvider,
  useWallet,
} from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function LoginPage() {
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
  const [isClient, setIsClient] = React.useState(false);
  const router = useRouter();
  const setWalletConnected = useSetRecoilState(walletConnectedState);
  const { connected } = useWallet();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (connected) {
      setWalletConnected(true);
      router.push('/expenses');
    }
  }, [connected, setWalletConnected, router]);

  return (
    <main>
      <Head>
        <title>Login</title>
      </Head>
      <section className='bg-white text-black h-screen flex flex-col items-center justify-center p-4'>
        <h1 className='text-lg font-bold mb-4'>Profile</h1>
        <div className='mb-4'>
          <img
            className='rounded-full'
            src='/default-profile.png'
            alt='Profile'
            width='80'
            height='80'
          />
        </div>
        <h2 className='text-2xl font-semibold mb-2'>Sign in</h2>
        <p className='text-center mb-4'>
          Create your profile, start splitting expenses, we will handle the
          rest.
        </p>
        {isClient && (
          <ConnectionProvider endpoint='https://api.devnet.solana.com'>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <WalletMultiButton className='w-full bg-black text-white py-2 px-4 rounded mb-2' />
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        )}
      </section>
    </main>
  );
}