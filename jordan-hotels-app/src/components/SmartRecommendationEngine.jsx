import { useState } from 'react';
import { RefreshCw, TrendingDown, Bell } from 'lucide-react';

export default function SmartRecommendationEngine() {
  const [showRecommendations, setShowRecommendations] = useState(true);

  const recommendations = [
    {
      type: 'Trending Now',
      icon: '🔥',
      items: ['Hilton Aqaba', 'Wadi Rum Luxury', 'Dead Sea Marriott'],
      reason: 'Most booked this week',
    },
    {
      type: 'Similar to Your Searches',
      icon: '🎯',
      items: ['Amman Kempinski', 'Grand Hyatt Amman', 'Petra Mövenpick'],
      reason: 'Based on your preferences',
    },
    {
      type: 'Best Value',
      icon: '💰',
      items: ['Hilton Aqaba', 'Grand Hyatt Amman', 'Mövenpick Dead Sea'],
      reason: '4.5+ ratings under $100/night',
    },
    {
      type: 'Hidden Gems',
      icon: '💎',
      items: ['Wadi Rum Luxury Camp', 'Amman Kempinski', 'Petra Mövenpick'],
      reason: 'Unique experiences, top-rated',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <RefreshCw size={18} className="text-purple-600" /> Smart Recommendations
        </h3>
        <button
          onClick={() => setShowRecommendations(!showRecommendations)}
          className="text-purple-600 hover:text-purple-700 text-sm font-bold"
        >
          {showRecommendations ? 'Hide' : 'Show'}
        </button>
      </div>

      {showRecommendations && (
        <div className="grid gap-3">
          {recommendations.map((rec, i) => (
            <div key={i} className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-gray-800">
                    {rec.icon} {rec.type}
                  </h4>
                  <p className="text-xs text-gray-600">{rec.reason}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {rec.items.map((item, j) => (
                  <button
                    key={j}
                    className="text-xs px-3 py-1 bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
