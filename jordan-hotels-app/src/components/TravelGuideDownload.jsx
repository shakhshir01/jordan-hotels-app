import { useState } from 'react';
import { Download, X } from 'lucide-react';
import { generateTravelGuide, downloadGuideAsPDF } from '../services/travelGuideService';

export default function TravelGuideDownload({ destination, hotels = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [guide, setGuide] = useState(null);

  const handleGenerateGuide = () => {
    const generatedGuide = generateTravelGuide(destination, hotels);
    setGuide(generatedGuide);
  };

  const handleDownload = () => {
    if (guide) {
      downloadGuideAsPDF(guide);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          handleGenerateGuide();
        }}
        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
      >
        <Download size={18} />
        Travel Guide
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{guide?.title}</h2>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">{guide?.intro}</p>

              <div>
                <h3 className="font-bold text-lg mb-2">🎯 Attractions</h3>
                <ul className="space-y-2">
                  {guide?.attractions.map((attr, i) => (
                    <li key={i} className="border-l-4 border-purple-400 pl-3">
                      <div className="font-semibold">{attr.name}</div>
                      <div className="text-sm text-gray-600">{attr.description}</div>
                      <div className="text-xs text-purple-600">💡 {attr.tips}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg mb-2">🍽️ Restaurants</h3>
                <div className="flex flex-wrap gap-2">
                  {guide?.restaurants.map((r, i) => (
                    <span key={i} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                <h3 className="font-bold mb-1">📋 Travel Tips</h3>
                <p className="text-sm text-gray-700">{guide?.tips}</p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
                <h3 className="font-bold mb-1">📅 Best Time to Visit</h3>
                <p className="text-sm text-gray-700">{guide?.bestTime}</p>
              </div>

              <button
                onClick={handleDownload}
                className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download as Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
