import { useState } from 'react';
import { CreditCard, Calendar } from 'lucide-react';

export default function FlexiblePaymentPlans({ totalPrice }) {
  const [selectedPlan, setSelectedPlan] = useState('full');

  const plans = {
    full: {
      name: 'Pay in Full',
      icon: '💵',
      description: 'Best Value - Save 5%',
      amount: Math.round(totalPrice * 0.95),
      payments: [{ date: 'Today', amount: Math.round(totalPrice * 0.95) }],
      discount: '5%',
    },
    split: {
      name: '50/50 Payment Plan',
      icon: '↔️',
      description: 'Half now, Half at booking',
      amount: totalPrice,
      payments: [
        { date: 'Today', amount: Math.round(totalPrice / 2) },
        { date: 'Before arrival', amount: Math.round(totalPrice / 2) },
      ],
      discount: '0%',
    },
    installment: {
      name: '3-Month Installment',
      icon: '📅',
      description: 'Spread over 3 months',
      amount: Math.round(totalPrice * 1.02), // 2% fee
      payments: [
        { date: 'Now', amount: Math.round((totalPrice * 1.02) / 3) },
        { date: 'Month 1', amount: Math.round((totalPrice * 1.02) / 3) },
        { date: 'Month 2', amount: Math.round((totalPrice * 1.02) / 3) },
      ],
      discount: '-2% fee',
    },
    afterpay: {
      name: 'Afterpay (4x Payments)',
      icon: '🛍️',
      description: 'Pay 4 equal amounts',
      amount: totalPrice,
      payments: [
        { date: 'Now', amount: Math.round(totalPrice / 4) },
        { date: '2 weeks', amount: Math.round(totalPrice / 4) },
        { date: '4 weeks', amount: Math.round(totalPrice / 4) },
        { date: '6 weeks', amount: Math.round(totalPrice / 4) },
      ],
      discount: '0%',
    },
  };

  const currentPlan = plans[selectedPlan];

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <CreditCard size={20} /> Flexible Payment Options
      </h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {Object.entries(plans).map(([key, plan]) => (
          <button
            key={key}
            onClick={() => setSelectedPlan(key)}
            className={`p-3 rounded-lg border-2 transition ${
              selectedPlan === key
                ? 'border-green-600 bg-green-100 text-green-900'
                : 'border-gray-300 bg-white hover:border-green-400'
            }`}
          >
            <div className="text-2xl mb-1">{plan.icon}</div>
            <div className="text-sm font-bold">{plan.name}</div>
            <div className="text-xs text-gray-600">{plan.discount}</div>
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="text-center mb-4">
          <div className="text-gray-600 text-sm mb-1">{currentPlan.description}</div>
          <div className="text-3xl font-bold text-green-600">${currentPlan.amount}</div>
        </div>

        <div className="space-y-2">
          <div className="font-bold text-gray-800 mb-2">Payment Schedule:</div>
          {currentPlan.payments.map((payment, i) => (
            <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700 flex items-center gap-2">
                <Calendar size={14} />
                {payment.date}
              </span>
              <span className="font-bold text-gray-800">${payment.amount}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-gray-700">
        ℹ️ {selectedPlan === 'full' ? 'Save 5% by paying in full' : selectedPlan === 'installment' ? '2% fee applies' : 'Interest-free payment plan'}
      </div>

      <button className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition">
        Proceed with {currentPlan.name}
      </button>
    </div>
  );
}
