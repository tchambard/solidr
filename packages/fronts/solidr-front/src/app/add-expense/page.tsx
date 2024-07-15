'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

const AddExpense = () => {
  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      title: '',
      amount: '',
      paidBy: 'Alex.sol (Me)',
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const [splitEqually, setSplitEqually] = useState(true);
  const participants = ['Alex.sol (Me)', 'Brian.sol', 'Julia.sol', 'Thomas.sol'];

  const onSubmit = (data: any) => {
    console.log(data);
    reset();
  };

  const amount = watch('amount');
  const amountPerPerson = splitEqually ? (Number(amount) / participants.length).toFixed(2) : '';

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl mb-4">Add Expense</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-gray-400">Title</label>
            <div className="relative">
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-400">Amount</label>
            <div className="relative">
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-400">Paid By</label>
            <Controller
              name="paidBy"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {participants.map((participant) => (
                    <option key={participant} value={participant}>
                      {participant}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400">When</label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="date"
                  className="w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-400">Split</label>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={splitEqually}
                onChange={() => setSplitEqually(!splitEqually)}
                className="mr-2"
              />
              <span>Equally</span>
            </div>
          </div>

          <div className="mb-4">
            {participants.map((participant) => (
              <div key={participant} className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={splitEqually}
                    readOnly
                  />
                  <span>{participant}</span>
                </div>
                <span>{splitEqually ? `€${amountPerPerson}` : ''}</span>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded p-2 mt-4 hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddExpense;
