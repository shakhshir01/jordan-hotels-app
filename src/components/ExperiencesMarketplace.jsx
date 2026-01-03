import { useState } from 'react';
import { MapPin, Compass, Users, Utensils, Camera, ShoppingCart } from 'lucide-react';

export default function ExperiencesMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [bookedExperience, setBookedExperience] = useState(null);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);

  const experiences = [
    {
      id: 1,
      name: 'Desert Sunset Jeep Safari',
      destination: 'Wadi Rum',
      category: 'adventure',
      price: '$60',
      rating: 4.9,
      icon: '🚙',
      duration: '4 hours',
      groupSize: '2-6 people',
      description: 'Experience the stunning red dunes at golden hour',
    },
    {
      id: 2,
      name: 'Petra Night Adventure',
      destination: 'Petra',
      category: 'cultural',
      price: '$45',
      rating: 4.8,
      icon: '🏛️',
      duration: '3 hours',
      groupSize: '4-20 people',
      description: 'Explore the Treasury under moonlight with Bedouin music',
    },
    {
      id: 3,
      name: 'Traditional Jordanian Cooking Class',
      destination: 'Amman',
      category: 'culinary',
      price: '$55',
      rating: 4.7,
      icon: '👨‍🍳',
      duration: '3 hours',
      groupSize: '2-8 people',
      description: 'Learn to cook authentic Jordanian dishes from locals',
    },
    {
      id: 4,
      name: 'Scuba Diving Certification',
      destination: 'Aqaba',
      category: 'water',
      price: '$120',
      rating: 4.9,
      icon: '🤿',
      duration: 'Full day',
      groupSize: '1-4 people',
      description: 'PADI certified diving with coral reef exploration',
    },
    {
      id: 5,
      name: 'Camel Trekking Trek',
      destination: 'Wadi Rum',
      category: 'adventure',
      price: '$50',
      rating: 4.8,
      icon: '🐪',
      duration: '2-3 hours',
      groupSize: '2-10 people',
      description: 'Ride through the desert like Bedouin nomads',
    },
    {
      id: 6,
      name: 'Dead Sea Spa Experience',
      destination: 'Dead Sea',
      category: 'wellness',
      price: '$80',
      rating: 4.9,
      icon: '🧖',
      duration: '4 hours',
      groupSize: '1-6 people',
      description: 'Mud therapy, floating, and luxury spa treatments',
    },
    {
      id: 7,
      name: 'Photography Tour',
      destination: 'Petra',
      category: 'cultural',
      price: '$65',
      rating: 4.7,
      icon: '📸',
      duration: 'Full day',
      groupSize: '2-12 people',
      description: 'Professional photography tips in iconic locations',
    },
    {
      id: 8,
      name: 'Street Food Tour',
      destination: 'Amman',
      category: 'culinary',
      price: '$40',
      rating: 4.8,
      icon: '🍖',
      duration: '2.5 hours',
      groupSize: '4-15 people',
      description: 'Taste authentic Jordanian street food with a local guide',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Experiences', icon: '🌟' },
    { id: 'adventure', label: 'Adventure', icon: '🎯' },
    { id: 'cultural', label: 'Cultural', icon: '🏛️' },
    { id: 'culinary', label: 'Food & Drink', icon: '🍽️' },
    { id: 'water', label: 'Water Sports', icon: '🌊' },
    { id: 'wellness', label: 'Wellness', icon: '🧘' },
  ];

  const filtered =
    selectedCategory === 'all'
      ? experiences
      : experiences.filter((e) => e.category === selectedCategory);

  return (
    <div className="bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Compass size={20} /> Experiences & Activities
      </h3>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full transition font-medium ${
              selectedCategory === cat.id
                ? 'bg-violet-600 text-white'
                : 'bg-white border border-gray-300 hover:border-violet-400'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 mb-4">
        {filtered.map((exp) => (
          <div
            key={exp.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-2xl mb-1">{exp.icon}</div>
                <h4 className="font-bold text-gray-800">{exp.name}</h4>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-violet-600">{exp.price}</div>
                <div className="text-sm text-yellow-600">⭐ {exp.rating}</div>
              </div>
            </div>

            <div className="text-sm text-gray-700 mb-2">{exp.description}</div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin size={14} /> {exp.destination}
              </div>
              <div className="flex items-center gap-1">
                <Camera size={14} /> {exp.duration}
              </div>
              <div className="flex items-center gap-1">
                <Users size={14} /> {exp.groupSize}
              </div>
            </div>

            <button 
              onClick={() => {
                setBookedExperience(exp);
                setShowBookingConfirm(true);
              }}
              className="w-full bg-violet-600 text-white py-2 rounded-lg hover:bg-violet-700 transition font-bold flex items-center justify-center gap-2"
            >
              <ShoppingCart size={16} />
              Book Now
            </button>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button className="text-violet-600 font-bold hover:text-violet-700">
          → View All {experiences.length} Experiences
        </button>
      </div>

      {showBookingConfirm && bookedExperience && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">{bookedExperience.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800">{bookedExperience.name}</h3>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-600 text-xs font-bold">PRICE</div>
                  <div className="text-lg font-bold text-violet-600">{bookedExperience.price}</div>
                </div>
                <div>
                  <div className="text-gray-600 text-xs font-bold">DURATION</div>
                  <div className="font-bold text-gray-800">{bookedExperience.duration}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-gray-600 text-xs font-bold mb-1">GROUP SIZE</div>
                  <div className="font-bold text-gray-800">{bookedExperience.groupSize}</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 mb-2">Select Date</label>
              <input 
                type="date" 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none dark:bg-slate-800 dark:text-white dark:border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowBookingConfirm(false);
                  alert(`✅ Successfully booked: ${bookedExperience.name}!\nA confirmation email has been sent to your account.`);
                }}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-bold"
              >
                Confirm Booking
              </button>
              <button
                onClick={() => setShowBookingConfirm(false)}
                className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
