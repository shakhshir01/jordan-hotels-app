import { useState } from 'react';
import { Gift, Sparkles, Lock } from 'lucide-react';

export default function ExclusiveDeals() {
  const [showDeals, setShowDeals] = useState(false);

  const deals = [
    { code: 'EARLY2025', discount: '15%', valid: 'Book by Jan 31', hotel: 'All Properties' },
    { code: 'LOYALTY15', discount: '15%', valid: 'Members only', hotel: 'Gold+ Members' },
    { code: 'GROUPSAVE', discount: '20%', valid: '4+ rooms', hotel: 'Group Bookings' },
    { code: 'LASTMIN50', discount: '50%', valid: 'Within 48h', hotel: 'Last Minute' },
    { code: 'HONEYMOON25', discount: '25%', valid: 'Newlyweds', hotel: 'Suite Upgrades' },
  ];

  return (
    <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-lg p-4">
      <button
        onClick={() => setShowDeals(!showDeals)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Gift size={18} className="text-red-600" /> Exclusive Promo Codes
        </h3>
        <span className="text-gray-500">{showDeals ? '−' : '+'}</span>
      </button>

      {showDeals && (
        <div className="mt-3 space-y-2">
          {deals.map((deal, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-3 border-2 border-red-200 hover:border-red-400 transition cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-gray-800 font-mono">{deal.code}</div>
                  <div className="text-xs text-gray-600">{deal.valid}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">{deal.discount}</div>
                  <div className="text-xs text-gray-600">{deal.hotel}</div>
                </div>
              </div>
              <button className="w-full text-red-600 font-bold text-sm hover:text-red-700 py-1">
                Copy Code →
              </button>
            </div>
          ))}
          <div className="bg-yellow-100 border border-yellow-300 rounded p-2 text-center text-xs text-yellow-900 font-bold">
            💡 Codes automatically apply at checkout!
          </div>
        </div>
      )}
    </div>
  );
}
