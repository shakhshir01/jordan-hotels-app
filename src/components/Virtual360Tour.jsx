import { useState } from 'react';
import { Video, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Virtual360Tour({ hotelName, roomType = 'Deluxe Room' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
      >
        <Video size={18} />
        360° Virtual Tour
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full overflow-hidden">
            <div className="bg-gray-900 aspect-video relative flex items-center justify-center">
              <div className="text-white text-center">
                <ZoomIn size={48} className="mx-auto mb-3 opacity-50" />
                <div className="text-lg font-bold">360° Interactive Tour Loading</div>
                <div className="text-sm text-gray-400 mt-2">{roomType} - {hotelName}</div>
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-400">🖱️ Click and drag to rotate</div>
                  <div className="text-sm text-gray-400">🔍 Scroll to zoom in/out</div>
                  <div className="text-sm text-gray-400">👆 Touch to explore on mobile</div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">{roomType}</h3>
                <p className="text-sm text-gray-600">Interactive 360° view of the room</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
