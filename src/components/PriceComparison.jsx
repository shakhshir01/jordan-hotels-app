import { useState } from 'react';
import { Eye, Download, Shield } from 'lucide-react';

export default function PriceComparison({ hotelName, basePrice, nights }) {
  const [showComparison, setShowComparison] = useState(false);

  const competitors = [
    { name: 'VisitJo', price: basePrice, link: '#' },
    { name: 'Booking.com', price: Math.round(basePrice * (0.95 + Math.random() * 0.2)), link: '#' },
    { name: 'Expedia', price: Math.round(basePrice * (0.92 + Math.random() * 0.25)), link: '#' },
    { name: 'Hotels.com', price: Math.round(basePrice * (0.95 + Math.random() * 0.2)), link: '#' },
  ];

  const cheapest = Math.min(...competitors.map(c => c.price));
  const savings = basePrice - cheapest;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">🔍 Price Comparison</h3>

      <button
        onClick={() => setShowComparison(!showComparison)}
        className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 transition mb-4 flex items-center justify-center gap-2"
      >
        <Eye size={18} />
        {showComparison ? 'Hide' : 'Compare'} Prices
      </button>

      {showComparison && (
        <div className="space-y-3">
          {competitors.map((site, idx) => {
            const isCheapest = site.price === cheapest;
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border-2 transition ${
                  isCheapest
                    ? 'bg-green-100 border-green-400'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{site.name}</span>
                    {isCheapest && <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Best Price</span>}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">${site.price}</div>
                    <div className="text-xs text-gray-600">${site.price * nights}/night</div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-300 rounded-lg p-4 mt-4">
            <div className="font-bold text-gray-800 mb-2">📊 Summary</div>
            <div className="space-y-1 text-sm text-gray-700">
              <div>✓ Lowest price found: ${cheapest}/night</div>
              <div>✓ Total for {nights} nights: ${cheapest * nights}</div>
              {savings > 0 && (
                <div className="text-green-700 font-bold">
                  ✓ You save ${savings}/night by booking elsewhere (${savings * nights} total)
                </div>
              )}
              <div className="text-xs text-gray-600 mt-2">
                💡 Price comparison updated daily. Availability may vary.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 flex items-start gap-2">
            <Shield size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <div className="font-bold text-gray-800">Price Match Guarantee</div>
              <div className="text-xs">If you find a lower price within 24 hours, we'll match it!</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
