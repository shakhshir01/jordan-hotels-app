import React, { useState } from 'react';

export default function InsureTrip() {
  const [selected, setSelected] = useState('standard');
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 25,
      coverage: ['Trip Cancellation', 'Medical Coverage', 'Baggage Loss'],
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 45,
      coverage: ['Trip Cancellation', 'Medical Coverage', 'Baggage Loss', 'Flight Delay', 'Emergency Evacuation'],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 75,
      coverage: [
        'Trip Cancellation',
        'Medical Coverage',
        'Baggage Loss',
        'Flight Delay',
        'Emergency Evacuation',
        'Travel Assistance 24/7',
        'Rental Car Coverage',
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Travel Insurance</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-12">Protect your Jordan trip with comprehensive coverage</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelected(plan.id)}
            className={`rounded-lg p-6 cursor-pointer transition border-2 ${
              selected === plan.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
            <p className="text-4xl font-bold text-blue-600 mb-6">${plan.price}</p>
            <ul className="space-y-3 mb-6">
              {plan.coverage.map((item) => (
                <li key={item} className="flex items-center">
                  <span className="text-green-500 mr-3">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button className={`w-full py-2 rounded-lg transition ${
              selected === plan.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}>
              Select
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
