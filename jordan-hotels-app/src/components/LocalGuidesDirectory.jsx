import { useState } from 'react';
import { Download, FileText, MapPin, Mountain } from 'lucide-react';

export default function LocalGuidesDirectory() {
  const [selectedGuide, setSelectedGuide] = useState(null);

  const localGuides = [
    {
      id: 1,
      name: 'Ahmed Al-Azzam',
      destination: 'Petra',
      rating: 4.9,
      reviews: 256,
      languages: ['Arabic', 'English', 'French'],
      price: '$45/hour',
      specialty: 'Ancient history & archaeology',
      about: 'Expert archaeologist with 20+ years experience at Petra',
      contact: 'ahmed.petra@visitjo.com',
    },
    {
      id: 2,
      name: 'Fatima Al-Hassan',
      destination: 'Wadi Rum',
      rating: 4.8,
      reviews: 189,
      languages: ['Arabic', 'English', 'German'],
      price: '$40/hour',
      specialty: 'Bedouin culture & desert survival',
      about: 'Born & raised in Wadi Rum - authentic Bedouin stories',
      contact: 'fatima.wadirum@visitjo.com',
    },
    {
      id: 3,
      name: 'Hassan Al-Omari',
      destination: 'Amman',
      rating: 4.7,
      reviews: 324,
      languages: ['Arabic', 'English', 'Spanish', 'Italian'],
      price: '$35/hour',
      specialty: 'Modern city tours & food experiences',
      about: 'Local foodie guide showcasing hidden gems',
      contact: 'hassan.amman@visitjo.com',
    },
    {
      id: 4,
      name: 'Layla Al-Rashid',
      destination: 'Dead Sea & Bethany',
      rating: 4.9,
      reviews: 211,
      languages: ['Arabic', 'English', 'Hebrew'],
      price: '$50/hour',
      specialty: 'Biblical & spiritual sites',
      about: 'Expert in biblical history and spiritual significance',
      contact: 'layla.deadsea@visitjo.com',
    },
    {
      id: 5,
      name: 'Omar Al-Khatib',
      destination: 'Aqaba',
      rating: 4.6,
      reviews: 156,
      languages: ['Arabic', 'English'],
      price: '$40/hour',
      specialty: 'Diving, snorkeling & marine life',
      about: 'PADI certified diving instructor and marine biologist',
      contact: 'omar.aqaba@visitjo.com',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <MapPin size={20} /> Meet Local Expert Guides
      </h3>

      <div className="grid gap-3 mb-4">
        {localGuides.map((guide) => (
          <button
            key={guide.id}
            onClick={() => setSelectedGuide(selectedGuide?.id === guide.id ? null : guide)}
            className={`p-4 rounded-lg border-2 transition text-left ${
              selectedGuide?.id === guide.id
                ? 'border-orange-600 bg-orange-100'
                : 'border-gray-300 bg-white hover:border-orange-400'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-bold text-gray-800">{guide.name}</div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  <MapPin size={14} />
                  {guide.destination} • {guide.specialty}
                </div>
                <div className="text-sm text-yellow-600 font-bold mt-1">
                  ⭐ {guide.rating} ({guide.reviews} reviews) • {guide.price}
                </div>
              </div>
            </div>

            {selectedGuide?.id === guide.id && (
              <div className="mt-4 pt-4 border-t border-gray-300 space-y-2">
                <div>
                  <div className="text-sm font-bold text-gray-800">About</div>
                  <div className="text-sm text-gray-700">{guide.about}</div>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">Languages</div>
                  <div className="flex flex-wrap gap-1">
                    {guide.languages.map((lang) => (
                      <span key={lang} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="w-full bg-orange-600 text-white py-2 rounded-lg font-bold hover:bg-orange-700 transition mt-2">
                  Book {guide.name}
                </button>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="font-bold text-gray-800 mb-2">📋 Why Use Local Guides?</div>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✓ Expert local knowledge & hidden gems</li>
          <li>✓ Authentic experiences & cultural immersion</li>
          <li>✓ Support local economies</li>
          <li>✓ Flexible scheduling & customized tours</li>
          <li>✓ Real-time insights & stories</li>
        </ul>
      </div>
    </div>
  );
}
