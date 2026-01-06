import { useState } from 'react';
import { ShieldAlert, Clock, RefreshCw, DollarSign } from 'lucide-react';

export default function TravelInsurance({ basePrice, nights }) {
  const [selected, setSelected] = useState(null);

  const insuranceOptions = [
    {
      id: 'basic',
      name: 'Basic Coverage',
      icon: '🛡️',
      price: Math.round(basePrice * nights * 0.05),
      coverage: [
        'Trip cancellation up to 100%',
        'Medical evacuation',
        'Lost luggage ($500)',
        'Emergency contact',
      ],
    },
    {
      id: 'standard',
      name: 'Standard Protection',
      icon: '🏥',
      price: Math.round(basePrice * nights * 0.10),
      coverage: [
        'Trip cancellation up to 125%',
        'Medical evacuation ($250k)',
        'Lost luggage ($2000)',
        'Delayed baggage',
        'Medical expenses abroad',
        'Emergency dental',
      ],
    },
    {
      id: 'premium',
      name: 'Premium Shield',
      icon: '💎',
      price: Math.round(basePrice * nights * 0.15),
      coverage: [
        'Trip cancellation up to 150%',
        'Medical evacuation ($500k)',
        'Lost luggage ($5000)',
        'Delayed baggage with daily allowance',
        'Medical expenses abroad ($100k)',
        'Emergency dental & vision',
        'Adventure activities covered',
        'Pre-existing conditions option',
      ],
    },
  ];

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <ShieldAlert size={20} /> Travel Insurance
      </h3>

      <div className="grid gap-3 mb-4">
        {insuranceOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelected(selected === option.id ? null : option.id)}
            className={`p-4 rounded-lg border-2 transition text-left ${
              selected === option.id ? 'border-red-600 bg-red-100' : 'border-gray-300 bg-white hover:border-red-400'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xl mb-1">{option.icon}</div>
                <div className="font-bold text-gray-800">{option.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">+ ${option.price}</div>
              </div>
            </div>

            {selected === option.id && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                <div className="text-sm font-bold text-gray-700 mb-2">Coverage includes:</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {option.coverage.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="p-2 bg-gray-50 rounded">
              <div className="text-gray-600">Trip Value</div>
              <div className="font-bold text-gray-800">${basePrice * nights}</div>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <div className="text-gray-600">Insurance</div>
              <div className="font-bold text-green-600">
                +${insuranceOptions.find((o) => o.id === selected).price}
              </div>
            </div>
            <div className="p-2 bg-green-50 rounded border border-green-200">
              <div className="text-gray-600">Total</div>
              <div className="font-bold text-green-600">
                ${basePrice * nights + insuranceOptions.find((o) => o.id === selected).price}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <Clock size={16} className="mt-0.5 flex-shrink-0" />
          <span>Coverage starts 14 days before trip</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <RefreshCw size={16} className="mt-0.5 flex-shrink-0" />
          <span>7-day cancellation period with full refund</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <DollarSign size={16} className="mt-0.5 flex-shrink-0" />
          <span>24/7 emergency claims support</span>
        </div>
      </div>

      <button className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition">
        {selected ? 'Add to Cart' : 'Select Insurance'}
      </button>
    </div>
  );
}
