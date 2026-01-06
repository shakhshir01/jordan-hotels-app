import { useState } from 'react';
import { MapPin, Clock, Users, ChefHat, AlertCircle } from 'lucide-react';

export default function ItineraryBuilder({ destination, nights = 3, groupSize = 1 }) {
  const [showItinerary, setShowItinerary] = useState(false);

  const itineraries = {
    Amman: [
      {
        day: 1,
        title: 'Arrival & Old City Exploration',
        activities: [
          { time: '10:00', activity: 'Arrive at hotel, check-in', icon: '🏨' },
          { time: '12:30', activity: 'Lunch at Hashem Restaurant', icon: '🍽️', cost: '$15/person' },
          { time: '14:00', activity: 'Visit Roman Theater', icon: '🏛️', cost: '$5/person' },
          { time: '17:00', activity: 'Sunset at Citadel', icon: '🌅', cost: 'Free' },
          { time: '19:00', activity: 'Dinner at Tazza Cafe', icon: '🍴', cost: '$20/person' },
        ],
      },
      {
        day: 2,
        title: 'Historical Tour',
        activities: [
          { time: '09:00', activity: 'Breakfast at hotel', icon: '🥐' },
          { time: '10:00', activity: 'Full-day Petra tour', icon: '🚗', cost: '$60/person' },
          { time: '13:00', activity: 'Lunch at local restaurant in Wadi Musa', icon: '🥙', cost: '$12/person' },
          { time: '17:30', activity: 'Return to Amman', icon: '🚙' },
          { time: '20:00', activity: 'Dinner & rest', icon: '😴' },
        ],
      },
      {
        day: 3,
        title: 'Dead Sea Wellness',
        activities: [
          { time: '08:00', activity: 'Early breakfast', icon: '🥣' },
          { time: '09:00', activity: 'Drive to Dead Sea', icon: '🚗', cost: '$25/person transport' },
          { time: '11:00', activity: 'Float & mud therapy', icon: '🧖', cost: '$30/person' },
          { time: '13:00', activity: 'Beachside lunch', icon: '🥗', cost: '$18/person' },
          { time: '15:00', activity: 'Spa treatment (optional)', icon: '💆', cost: '$50-100/person' },
          { time: '18:00', activity: 'Return to Amman', icon: '🚗' },
        ],
      },
    ],
    Petra: [
      {
        day: 1,
        title: 'Arrival & Orientation',
        activities: [
          { time: '09:00', activity: 'Arrive at Petra', icon: '🏨' },
          { time: '12:00', activity: 'Lunch at local restaurant', icon: '🍴', cost: '$15/person' },
          { time: '14:00', activity: 'First visit to Treasury', icon: '🏛️', cost: '$50/person' },
          { time: '17:00', activity: 'Sunset photography', icon: '📸' },
        ],
      },
      {
        day: 2,
        title: 'Deep Exploration',
        activities: [
          { time: '07:00', activity: 'Early start to The Monastery', icon: '🥾', cost: '$50/person guide' },
          { time: '13:00', activity: 'Packed lunch', icon: '🥪' },
          { time: '16:00', activity: 'Rest at hotel', icon: '😴' },
          { time: '19:00', activity: 'Dinner feast', icon: '🍖', cost: '$25/person' },
        ],
      },
    ],
    'Wadi Rum': [
      {
        day: 1,
        title: 'Desert Adventure',
        activities: [
          { time: '08:00', activity: 'Jeep safari through dunes', icon: '🚙', cost: '$40/person' },
          { time: '12:00', activity: 'Bedouin lunch', icon: '🥙', cost: 'Included' },
          { time: '14:00', activity: 'Rock climbing & exploration', icon: '🧗', cost: 'Included' },
          { time: '18:00', activity: 'Sunset in desert', icon: '🌅' },
          { time: '20:00', activity: 'Traditional camp dinner & bonfire', icon: '🔥', cost: '$30/person' },
        ],
      },
      {
        day: 2,
        title: 'Bedouin Experience',
        activities: [
          { time: '06:30', activity: 'Sunrise in desert', icon: '🌄' },
          { time: '08:00', activity: 'Bedouin breakfast', icon: '☕' },
          { time: '10:00', activity: 'Camel riding', icon: '🐪', cost: '$25/person' },
          { time: '13:00', activity: 'Lunch & rest', icon: '😴' },
          { time: '15:00', activity: 'Stargazing preparation', icon: '🔭' },
          { time: '20:00', activity: 'Night sky experience', icon: '⭐' },
        ],
      },
    ],
  };

  const selectedItinerary = itineraries[destination] || [];
  const totalCost = selectedItinerary.reduce((sum, day) => {
    return sum + day.activities.reduce((daySum, activity) => {
      if (activity.cost) {
        const match = activity.cost.match(/\$(\d+)/);
        return daySum + (match ? parseInt(match[1]) * groupSize : 0);
      }
      return daySum;
    }, 0);
  }, 0);

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <MapPin size={20} /> {nights}-Day Itinerary
      </h3>

      <button
        onClick={() => setShowItinerary(!showItinerary)}
        className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold hover:bg-purple-700 transition mb-4"
      >
        {showItinerary ? '↑ Hide' : '↓ View'} Suggested Itinerary
      </button>

      {showItinerary && selectedItinerary.length > 0 && (
        <div className="space-y-4">
          {selectedItinerary.slice(0, nights).map((dayPlan, dayIndex) => (
            <div key={dayIndex} className="bg-white border border-purple-200 rounded-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3">
                <h4 className="font-bold">Day {dayPlan.day}: {dayPlan.title}</h4>
              </div>
              <div className="p-4 space-y-2">
                {dayPlan.activities.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start py-2 border-b border-gray-100 last:border-0">
                    <div className="text-2xl">{item.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-800">{item.time} - {item.activity}</div>
                      {item.cost && <div className="text-xs text-green-600">{item.cost}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-400 rounded-lg p-4">
            <div className="font-bold text-gray-800 mb-2">💰 Estimated Costs</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Activities & Tours:</div>
              <div className="text-right font-bold">${totalCost}</div>
              <div>Group Size:</div>
              <div className="text-right">{groupSize} people</div>
              <div className="text-xs text-gray-600 col-span-2">* Food & transport estimates included</div>
            </div>
          </div>
        </div>
      )}

      {!showItinerary && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
          <div className="text-sm text-blue-900">
            ℹ️ Custom itinerary built for {nights} days in {destination}
          </div>
        </div>
      )}
    </div>
  );
}
