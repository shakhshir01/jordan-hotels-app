import { useState } from 'react';
import { Zap, TrendingUp, Award } from 'lucide-react';

export default function RecentBookings() {
  const [showActivity, setShowActivity] = useState(false);

  const recentActivity = [
    { name: 'Sarah M.', action: 'booked', hotel: 'Dead Sea Marriott', time: '2 hours ago', quantity: 2 },
    { name: 'Ahmed K.', action: 'viewing', hotel: 'Petra Mövenpick', time: '15 min ago', quantity: 1 },
    { name: 'Emma L.', action: 'booked', hotel: 'Hilton Aqaba', time: '45 min ago', quantity: 3 },
    { name: 'Hassan R.', action: 'booked', hotel: 'Amman Kempinski', time: '1 hour ago', quantity: 2 },
    { name: 'Lisa W.', action: 'viewing', hotel: 'Wadi Rum Luxury Camp', time: '3 hours ago', quantity: 4 },
  ];

  return (
    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
      <button
        onClick={() => setShowActivity(!showActivity)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Zap size={18} className="text-teal-600" /> Live Activity
        </h3>
        <span className="text-gray-500">{showActivity ? '−' : '+'}</span>
      </button>

      {showActivity && (
        <div className="mt-3 space-y-2">
          {recentActivity.map((activity, i) => (
            <div key={i} className="bg-white rounded p-2 text-sm border-l-4 border-teal-400">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-gray-800">{activity.name}</span>
                  <span className="text-gray-600">
                    {' '}
                    {activity.action === 'booked' ? '🎫 booked' : '👀 viewing'} {activity.hotel}
                  </span>
                  <div className="text-xs text-gray-500 mt-0.5">{activity.time}</div>
                </div>
                <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded font-bold">
                  {activity.quantity} room{activity.quantity > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
          <div className="bg-teal-100 rounded p-2 text-center text-sm text-teal-800 font-bold mt-2">
            ✨ Only {Math.floor(Math.random() * 5) + 1} rooms left at this price!
          </div>
        </div>
      )}
    </div>
  );
}
