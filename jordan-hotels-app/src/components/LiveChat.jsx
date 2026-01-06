import { useState } from 'react';
import { MessageCircle, Send, Minimize2 } from 'lucide-react';

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello! 👋 Welcome to VisitJo Hotel Support. How can we help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const botResponses = {
    booking: 'We can help you with your booking! Would you like to modify, cancel, or get more info?',
    refund: 'Refunds are processed within 5-7 business days. Can you provide your booking reference?',
    availability: 'Which destination and dates are you interested in?',
    cancel: 'You can cancel free of charge up to 48 hours before check-in.',
    payment: 'We accept credit cards, debit cards, and digital wallets. Is there an issue with payment?',
    default: 'I can help with bookings, payments, cancellations, and more. What do you need?',
  };

  const getResponse = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('book') || lower.includes('booking')) return botResponses.booking;
    if (lower.includes('refund') || lower.includes('money')) return botResponses.refund;
    if (lower.includes('available') || lower.includes('date')) return botResponses.availability;
    if (lower.includes('cancel')) return botResponses.cancel;
    if (lower.includes('pay') || lower.includes('payment')) return botResponses.payment;
    return botResponses.default;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { id: messages.length + 1, type: 'user', text: input }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: prev.length + 1, type: 'bot', text: getResponse(input) },
      ]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition z-40 flex items-center justify-center"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 max-h-96">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 flex justify-between items-center">
            <div>
              <h3 className="font-bold">VisitJo Support</h3>
              <div className="text-xs text-green-100">💚 Usually replies in seconds</div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-green-500 rounded">
              <Minimize2 size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`px-4 py-2 rounded-lg max-w-xs ${
                    msg.type === 'user'
                      ? 'bg-green-600 text-white rounded-br-none'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </div>

          <div className="border-t p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
            <button
              onClick={handleSend}
              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
