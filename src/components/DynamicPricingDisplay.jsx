import { useState } from 'react';
import { Plus, Minus, MapPin, Users, DollarSign } from 'lucide-react';

export default function DynamicPricingDisplay({ basePrice, nights = 3 }) {
  const [extraGuests, setExtraGuests] = useState(0);

  const guestFee = 15;
  const cleaningFee = 25;
  const taxRate = 0.10;

  const subtotal = basePrice * nights;
  const guestCharges = extraGuests * guestFee * nights;
  const subtotalWithGuests = subtotal + guestCharges;
  const taxes = subtotalWithGuests * taxRate;
  const total = subtotalWithGuests + taxes + cleaningFee;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-bold text-gray-800 mb-3">Price Breakdown</h3>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between text-gray-700">
          <span>${basePrice} × {nights} nights</span>
          <span className="font-bold">${subtotal.toFixed(2)}</span>
        </div>

        <div className="border-t pt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Extra Guests</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExtraGuests(Math.max(0, extraGuests - 1))}
                className="bg-gray-200 p-1 rounded hover:bg-gray-300"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center font-bold">{extraGuests}</span>
              <button
                onClick={() => setExtraGuests(extraGuests + 1)}
                className="bg-gray-200 p-1 rounded hover:bg-gray-300"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
          {extraGuests > 0 && (
            <div className="flex justify-between text-gray-600 ml-2">
              <span>+${guestFee} × {extraGuests} × {nights} nights</span>
              <span>${guestCharges.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-2 space-y-1">
          <div className="flex justify-between text-gray-600">
            <span>Cleaning Fee</span>
            <span>${cleaningFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Taxes ({Math.round(taxRate * 100)}%)</span>
            <span>${taxes.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t pt-2 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-blue-600">${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-2 text-xs text-blue-900">
        ✓ Final price includes taxes and all mandatory fees
      </div>
    </div>
  );
}
