import { Trophy, Star } from 'lucide-react';
import { getUserBadge, getAchievements, ACHIEVEMENTS } from '../services/gamificationService';

export default function LoyaltyBadges({ bookingCount = 0, reviewCount = 0, destinations = [] }) {
  const points = bookingCount * 500 + reviewCount * 100;
  const badge = getUserBadge(points);
  const achievements = getAchievements(bookingCount, reviewCount, destinations);

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Trophy size={20} className="text-yellow-600" /> Your Loyalty Status
      </h3>

      <div className="bg-white rounded-lg p-4 mb-4 text-center">
        <div className="text-5xl mb-2">{badge.icon}</div>
        <div className="text-2xl font-bold text-gray-800">{badge.level}</div>
        <div className="text-gray-600 text-sm">{points} loyalty points</div>

        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((points / 5000) * 100, 100)}%` }}
          />
        </div>
        <div className="text-xs text-gray-600 mt-1">
          {5000 - points > 0 ? `${5000 - points} points to Platinum` : 'Platinum Member! 🎉'}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-bold text-gray-700 mb-3">Your Achievements:</div>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="bg-white border border-yellow-300 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">{achievement.icon}</div>
                <div className="text-sm font-bold text-gray-800">{achievement.name}</div>
                <div className="text-xs text-gray-600">{achievement.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center text-gray-600 text-sm">
            🎯 Make your first booking to unlock achievements!
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-3">
        <div className="font-bold text-gray-800 mb-2">💰 Member Perks:</div>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✓ {badge.level} member exclusive discounts up to 15%</li>
          <li>✓ Free cancellation on eligible bookings</li>
          <li>✓ Priority customer support (24/7)</li>
          <li>✓ Birthday bonus: 10% off your travel month</li>
          <li>✓ Earn points on every booking</li>
        </ul>
      </div>
    </div>
  );
}
