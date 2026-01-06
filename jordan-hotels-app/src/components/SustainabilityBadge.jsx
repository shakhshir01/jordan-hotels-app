import { useState } from 'react';
import { Leaf, TrendingUp, Award } from 'lucide-react';
import { calculateSustainabilityScore, getEcoScore } from '../services/sustainabilityService';

export default function SustainabilityBadge({ hotel }) {
  const [showDetails, setShowDetails] = useState(false);
  const scoreData = calculateSustainabilityScore(hotel);
  const ecoScore = getEcoScore(scoreData.score);

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Leaf size={18} className="text-green-600" /> Eco-Friendly
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-green-600 font-bold hover:text-green-700"
        >
          {showDetails ? '−' : '+'}
        </button>
      </div>

      <div className="bg-white rounded-lg p-3 mb-3 text-center">
        <div className="text-4xl mb-1">{ecoScore.label}</div>
        <div className="text-sm font-bold text-gray-800">{ecoScore.description}</div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-center text-sm">
        <div className="bg-white rounded p-2">
          <div className="text-gray-600 text-xs">Carbon Footprint</div>
          <div className="font-bold text-gray-800">{scoreData.carbonFootprint.toFixed(1)} tons</div>
        </div>
        <div className="bg-white rounded p-2">
          <div className="text-gray-600 text-xs">Sustainability Score</div>
          <div className="font-bold text-green-600">{scoreData.score}/5</div>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-2">
          <div className="bg-white rounded-lg p-3">
            <div className="font-bold text-gray-800 mb-2">Green Features:</div>
            <ul className="space-y-1 text-sm text-gray-700">
              {scoreData.features.length > 0 ? (
                scoreData.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    {feature}
                  </li>
                ))
              ) : (
                <li className="text-gray-500">No sustainability features listed</li>
              )}
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
            <div className="text-sm text-blue-900">
              <div className="font-bold mb-1">🌍 Your Impact</div>
              <div className="text-xs">By choosing this eco-hotel, you help reduce carbon emissions and support sustainable tourism in Jordan.</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-1 pt-2 border-t border-green-200">
        <Award size={14} className="text-green-600" />
        <span className="text-xs text-green-700 font-bold">Certified Eco-Hotel</span>
      </div>
    </div>
  );
}
