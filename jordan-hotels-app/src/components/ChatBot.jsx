import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can I help you with your Jordan hotel booking today?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const { t } = useTranslation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputValue),
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userInput) => {
    const input = userInput.toLowerCase();

    if (input.includes('hotel') || input.includes('booking')) {
      return t('chatbot.hotel_help', 'I can help you find and book the perfect hotel in Jordan! What type of accommodation are you looking for?');
    }
    if (input.includes('price') || input.includes('cost')) {
      return t('chatbot.price_help', 'Hotel prices in Jordan vary by location and season. Petra and Aqaba tend to be more expensive. Would you like me to show you current deals?');
    }
    if (input.includes('location') || input.includes('where')) {
      return t('chatbot.location_help', 'Popular destinations include Amman, Petra, Aqaba, and the Dead Sea. Each offers unique experiences!');
    }
    if (input.includes('help') || input.includes('support')) {
      return t('chatbot.support_help', 'I can assist with hotel bookings, destination information, and travel tips. What would you like to know?');
    }

    return t('chatbot.default', 'I\'m here to help with your Jordan travel plans! Feel free to ask about hotels, destinations, or booking assistance.');
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-jordan-blue to-jordan-teal text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        aria-label="Open chat"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 z-50 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-jordan-blue to-jordan-teal text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">{t('chatbot.title', 'Jordan Travel Assistant')}</h3>
            <p className="text-sm opacity-90">{t('chatbot.subtitle', 'Ask me anything about your trip!')}</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-jordan-blue text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('chatbot.placeholder', 'Type your message...')}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-jordan-blue dark:bg-slate-700 dark:text-slate-100"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-jordan-blue hover:bg-jordan-teal text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
