'use client';

import Head from 'next/head';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import '@/lib/env';

export default function ExpensesPage() {
  const router = useRouter();

  const balances = [
    { name: 'Alex.sol', balance: '+€83.25', me: true },
    { name: 'Brian.sol', balance: '-€43.75', me: false },
    { name: 'Julia.sol', balance: '+€12.25', me: false },
    { name: 'Thomas.sol', balance: '-€51.75', me: false },
  ];

  return (
    <main>
      <Head>
        <title>City trip</title>
      </Head>
      <section className='bg-white text-black h-screen flex flex-col'>
        <header className='flex justify-between items-center p-4'>
          <div className='flex items-center'>
            <button onClick={() => router.back()} className='mr-2'>
              ◀️
            </button>
            <h1 className='text-lg font-bold'>home</h1>
          </div>
        </header>
        <div className='flex flex-col items-center mt-4'>
          <img
            className='rounded-full mb-4'
            src='/city-trip.png'
            alt='City trip'
            width='80'
            height='80'
          />
          <h2 className='text-2xl font-semibold mb-4'>City trip</h2>
          <div className='flex mb-4'>
            <button className='px-4 py-2 bg-gray-800 text-white rounded-l'>
              Expenses
            </button>
            <button className='px-4 py-2 bg-gray-700 text-white rounded-r'>
              Balances
            </button>
          </div>
          <div className='flex flex-col items-center bg-gray-900 p-4 rounded mb-4 w-3/4'>
            <p className='text-lg mb-2 text-white'>
              You are owed <span className='font-bold text-white'>€83.25</span>
            </p>
            <p className='text-sm mb-4 text-gray-400'>
              See how Brian.sol and Thomas.sol need to pay you back
            </p>
            <button className='px-4 py-2 bg-blue-600 text-white rounded'>
              View All Suggested Reimbursements
            </button>
          </div>
          <div className='w-full px-8'>
            <p className='text-lg font-bold mb-2'>Balances</p>
            {balances.map((balance) => (
              <div
                key={balance.name}
                className={`flex justify-between items-center p-4 rounded mb-2 ${balance.me ? 'bg-gray-700' : 'bg-gray-800'}`}
              >
                <div className='flex items-center'>
                  <div className='w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-lg mr-4'>
                    {balance.name.charAt(0)}
                  </div>
                  <div>
                    <p className='text-lg text-white'>
                      {balance.name} {balance.me && '(Me)'}
                    </p>
                  </div>
                </div>
                <p
                  className={`text-lg font-bold ${balance.balance.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}
                >
                  {balance.balance}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
