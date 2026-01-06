import { useState } from 'react';
import { Users, Calendar, DollarSign, Check, X } from 'lucide-react';

export default function WaitlistFeature({ hotelName, roomType }) {
  const [isWaitlisted, setIsWaitlisted] = useState(false);

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Users size={18} /> Waitlist & Price Drop Alert
      </h3>

      {!isWaitlisted ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            No availability for your dates? Get notified immediately when rooms become available or prices drop!
          </p>
          <button
            onClick={() => setIsWaitlisted(true)}
            className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition font-bold"
          >
            Join Waitlist
          </button>
        </div>
      ) : (
        <div className="bg-white border border-green-300 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
            <Check size={18} />
            You're on the waitlist!
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <div>✓ Notified when availability opens</div>
            <div>✓ Alert if prices drop by 10%+</div>
            <div>✓ Priority booking access</div>
          </div>
          <button
            onClick={() => setIsWaitlisted(false)}
            className="mt-3 w-full text-red-600 border border-red-300 py-1 rounded hover:bg-red-50 transition text-sm"
          >
            Remove from Waitlist
          </button>
        </div>
      )}
    </div>
  );
}
