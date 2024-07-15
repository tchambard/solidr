'use client';

import Head from 'next/head';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import '@/lib/env';

export default function HomePage() {
  const router = useRouter();

  const handleButtonClick = () => {
    router.push('/login');
  };

  return (
    <main>
      <Head>
        <title>Solidr</title>
      </Head>
      <section className='bg-white h-screen flex flex-col justify-between'>
        <header className='flex justify-between items-center p-4'>
          <h1 className='text-lg font-bold'>Solidr</h1>
        </header>
        <div className='flex flex-col items-center justify-end flex-grow pb-10'>
          <button
            className='w-16 h-16 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-2xl'
            onClick={handleButtonClick}
          >
            +
          </button>
          <p className='mt-2'>Create split account</p>
        </div>
      </section>
    </main>
  );
}
