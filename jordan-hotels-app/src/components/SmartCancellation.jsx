import { useState } from 'react';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { CANCELLATION_POLICIES, processInstantRefund, getCancellationDeadline } from '../services/cancellationService';

export default function SmartCancellation({ checkInDate, bookingAmount, policyType = 'free' }) {
  const [showDetails, setShowDetails] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const policy = CANCELLATION_POLICIES[policyType];
  const deadline = getCancellationDeadline(checkInDate, policyType);
  const refundData = processInstantRefund(bookingAmount, policyType);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Lock size={20} /> Cancellation & Refunds
        </h3>
        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
          {policy.icon} {policy.name}
        </span>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="mb-3">
          <div className="text-sm text-gray-600 mb-1">Your Cancellation Deadline</div>
          <div className="text-2xl font-bold text-gray-800">
            {deadline.deadline.toLocaleDateString()} {deadline.deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            ⏱️ {Math.round(deadline.hoursLeft)} hours remaining for full refund
          </div>
        </div>

        {deadline.hoursLeft > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.max(0, Math.min(100, (deadline.hoursLeft / (7 * 24)) * 100))}%` }}
            />
          </div>
        )}
      </div>

      {deadline.hoursLeft < 24 && deadline.hoursLeft > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-400 p-3 mb-4 flex gap-2">
          <AlertCircle size={18} className="text-yellow-700 flex-shrink-0" />
          <div className="text-sm text-yellow-900">
            <div className="font-bold">Cancellation deadline approaching</div>
            <div className="text-xs">Act within {Math.round(deadline.hoursLeft)} hours for full refund</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-gray-600 text-sm">Refund Amount</div>
          <div className="text-2xl font-bold text-green-600">${refundData.refundAmount}</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center">
          <div className="text-gray-600 text-sm">Processing Time</div>
          <div className="text-lg font-bold text-gray-800">{refundData.processingTime}</div>
        </div>
      </div>

      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full mb-4 px-4 py-2 border border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
      >
        {showDetails ? '↑ Hide Details' : '↓ Show Policy Details'}
      </button>

      {showDetails && (
        <div className="bg-white rounded-lg p-4 mb-4 space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>Free cancellation until {policy.deadline} before check-in</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>Full refund to original payment method</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>No hidden fees or penalties</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span>Instant processing - within 24-48 hours</span>
          </div>
        </div>
      )}

      {!hasRequested ? (
        <button
          onClick={() => setHasRequested(true)}
          className="w-full bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition"
        >
          Request Cancellation & Refund
        </button>
      ) : (
        <div className="bg-green-100 border border-green-400 rounded-lg p-4 text-center">
          <div className="text-green-800 font-bold mb-1">✅ Cancellation Requested</div>
          <div className="text-sm text-green-700">Your ${refundData.refundAmount} refund will be processed within {refundData.processingTime}</div>
          <div className="text-xs text-green-600 mt-2">Confirmation email sent to your inbox</div>
        </div>
      )}
    </div>
  );
}
