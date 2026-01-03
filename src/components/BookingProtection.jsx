import { useState } from 'react';
import { Shield, CheckCircle } from 'lucide-react';

export default function BookingProtection({ bookingAmount, status = 'confirmed' }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Shield size={18} className="text-blue-600" /> Booking Protection
        </h3>
        <span className="text-gray-500">{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>Price guarantee - lowest rate for your dates</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>Free cancellation up to 48 hours before check-in</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>24/7 customer support for any changes</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>Secure payment with 256-bit encryption</span>
          </div>
          <div className="bg-blue-100 rounded p-2 mt-2">
            <div className="font-bold text-blue-900 text-xs">You're covered under VisitJo Protection Plan</div>
            <div className="text-xs text-blue-800">${bookingAmount} booking fully protected</div>
          </div>
        </div>
      )}
    </div>
  );
}
