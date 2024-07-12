'use client';

import Head from 'next/head';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import '@/lib/env';

export default function ExpensesPage() {
  const router = useRouter();

  const expenses = [
    { date: 'Xxx XX, 20XX', items: [
      { id: 1, name: 'Hotel', payer: 'Alex (me)', amount: '€X.00', icon: '🏨' },
      { id: 2, name: 'Picnic', payer: 'Brian', amount: '€X.00', icon: '🍔' },
      { id: 3, name: 'Car', payer: 'Julia', amount: '€X.00', icon: '🚗' }
    ]}
  ];

  return (
    <main>
      <Head>
        <title>Your trip</title>
      </Head>
      <section className='bg-white text-black h-screen flex flex-col'>
        <header className='flex justify-between items-center p-4'>
          <div className='flex items-center'>
            <button onClick={() => router.back()} className='mr-2'>◀️</button>
            <h1 className='text-lg font-bold'>Solidr</h1>
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
          <h2 className='text-2xl font-semibold mb-4'>Your trip</h2>
          <div className='flex mb-4'>
            <button className='px-4 py-2 bg-gray-200 text-black rounded-l'>Expenses</button>
            <button className='px-4 py-2 bg-gray-300 text-black rounded-r'>Balances</button>
          </div>
          <div className='flex justify-between w-full px-8 mb-2'>
            <p>My Expenses</p>
            <p>Total Expenses</p>
          </div>
          <div className='flex justify-between w-full px-8 mb-4'>
            <p className='text-lg font-bold'>€XX.XX</p>
            <p className='text-lg font-bold'>€XXX.00</p>
          </div>
        </div>
        {expenses.map((expense) => (
          <div key={expense.date} className='w-full px-8 mb-4'>
            <p className='text-lg font-bold mb-2'>{expense.date}</p>
            {expense.items.map((item) => (
              <div key={item.id} className='flex justify-between items-center bg-gray-200 p-4 rounded mb-2'>
                <div className='flex items-center'>
                  <span className='text-2xl mr-4'>{item.icon}</span>
                  <div>
                    <p className='text-lg'>{item.name}</p>
                    <p className='text-sm text-gray-600'>Paid by {item.payer}</p>
                  </div>
                </div>
                <p className='text-lg font-bold'>{item.amount}</p>
              </div>
            ))}
          </div>
        ))}
        <div className='flex justify-center mt-auto mb-10'>
          <button className='w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl'>
            +
          </button>
        </div>
      </section>
    </main>
  );
}
