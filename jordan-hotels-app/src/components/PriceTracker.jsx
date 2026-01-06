import { useState } from 'react';
import { Zap, TrendingDown, Bell } from 'lucide-react';

export default function PriceTracker({ hotelName, initialPrice }) {
  const [isTracking, setIsTracking] = useState(false);
  const [priceHistory] = useState([
    { date: '7d ago', price: initialPrice + 20 },
    { date: '5d ago', price: initialPrice + 15 },
    { date: '3d ago', price: initialPrice + 10 },
    { date: '2d ago', price: initialPrice + 5 },
    { date: 'Today', price: initialPrice },
  ]);

  const priceDropPercentage = Math.round(((priceHistory[0].price - priceHistory[priceHistory.length - 1].price) / priceHistory[0].price) * 100);
  const lowestPrice = Math.min(...priceHistory.map(p => p.price));
  const savings = lowestPrice - initialPrice;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Zap size={18} className="text-yellow-600" /> Price Tracker{hotelName ? ` — ${hotelName}` : ''}
        </h3>
        <button
          onClick={() => setIsTracking(!isTracking)}
          className={`px-3 py-1 rounded-full text-sm font-bold transition ${
            isTracking ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-700 hover:bg-blue-600 hover:text-white'
          }`}
        >
          {isTracking ? '✓ Tracking' : 'Enable'}
        </button>
      </div>

      {priceDropPercentage > 0 && (
        <div className="bg-green-100 border border-green-400 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 text-green-800 font-bold">
            <TrendingDown size={18} />
            Price dropped {priceDropPercentage}%
          </div>
          <div className="text-sm text-green-700 mt-1">
            Save ${Math.abs(savings)} at current rate
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="text-sm font-bold text-gray-700 mb-2">7-Day Price Trend</div>
        <div className="flex items-end gap-1 h-16 bg-white rounded p-2">
          {priceHistory.map((item, i) => {
            const maxPrice = Math.max(...priceHistory.map(p => p.price));
            const minPrice = Math.min(...priceHistory.map(p => p.price));
            const range = maxPrice - minPrice || 1;
            const height = ((item.price - minPrice) / range) * 100;
            return (
              <div
                key={i}
                className="flex-1 bg-blue-500 rounded-t"
                style={{ height: `${height}%` }}
                title={`${item.date}: $${item.price}`}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
        <div className="bg-white rounded p-2">
          <div className="text-gray-600 text-xs">Current</div>
          <div className="font-bold text-gray-800">${initialPrice}</div>
        </div>
        <div className="bg-white rounded p-2">
          <div className="text-gray-600 text-xs">Lowest</div>
          <div className="font-bold text-green-600">${lowestPrice}</div>
        </div>
        <div className="bg-white rounded p-2">
          <div className="text-gray-600 text-xs">Trend</div>
          <div className="font-bold text-red-600">↓ {priceDropPercentage}%</div>
        </div>
      </div>

      {isTracking && (
        <div className="bg-blue-100 border-l-4 border-blue-500 p-3 text-sm text-blue-900">
          <div className="flex items-center gap-2">
            <Bell size={16} />
            <span>You'll get notified if price drops below ${Math.round(initialPrice * 0.9)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
