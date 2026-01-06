import { useState } from 'react';
import { X } from 'lucide-react';

export default function GroupBooking({ onApply, roomPrice, nights }) {
  const [groupSize, setGroupSize] = useState(1);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const calculateGroupDiscount = (size) => {
    if (size >= 10) return 0.20;
    if (size >= 6) return 0.15;
    if (size >= 4) return 0.10;
    if (size >= 2) return 0.05;
    return 0;
  };

  const discount = calculateGroupDiscount(groupSize);
  const discountedPrice = roomPrice * (1 - discount);
  const totalPrice = discountedPrice * nights * groupSize;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">👥 Group Booking Discount</h3>

      <div className="flex items-center gap-4 mb-6">
        <label className="flex-1">
          <span className="block text-sm font-medium text-gray-700 mb-2">Group Size:</span>
          <input
            type="number"
            min="1"
            max="100"
            value={groupSize}
            onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition h-fit"
        >
          Details
        </button>
      </div>

      {discount > 0 && (
        <div className="bg-green-100 border border-green-400 rounded-lg p-4 mb-4">
          <div className="text-green-800 font-bold">💰 {(discount * 100)}% Group Discount!</div>
          <div className="text-sm text-green-700 mt-1">You save ${Math.round(roomPrice * discount * nights * groupSize)}</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white p-3 rounded-lg">
          <div className="text-xs text-gray-600">Per Room/Night</div>
          <div className="text-lg font-bold text-gray-800">${Math.round(discountedPrice)}</div>
        </div>
        <div className="bg-white p-3 rounded-lg">
          <div className="text-xs text-gray-600">Total ({nights} nights)</div>
          <div className="text-lg font-bold text-gray-800">${Math.round(totalPrice)}</div>
        </div>
      </div>

      {showBreakdown && (
        <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4 text-sm">
          <div className="font-bold mb-2">Cost Breakdown:</div>
          <div className="space-y-1 text-gray-700">
            <div>• Base Price: ${roomPrice} × {nights} nights × {groupSize} people</div>
            <div>• Discount Applied: -{(discount * 100).toFixed(0)}%</div>
            <div>• Discounted Rate: ${Math.round(discountedPrice)}/night</div>
            <div className="font-bold mt-2 text-green-700">Total: ${Math.round(totalPrice)}</div>
          </div>
        </div>
      )}

      <button
        onClick={() => onApply({ groupSize, discount, totalPrice })}
        className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition"
      >
        Apply Group Booking
      </button>
    </div>
  );
}
