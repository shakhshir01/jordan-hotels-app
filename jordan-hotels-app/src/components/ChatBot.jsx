import { useState, useRef, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/AuthContext';
import { generateChatResponse } from '../services/chatbot';
import OptimizedImage from './OptimizedImage';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! I\'m Nashmi, your witty Jordan travel companion! 🌟 How can I make your Jordan adventure unforgettable today?', sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const { t } = useTranslation();
  const { userProfile } = useContext(AuthContext);

  useEffect(() => {
    if (userProfile?.displayName || userProfile?.name) {
      const userName = userProfile.displayName || userProfile.name;
      setMessages(prev => prev.map(msg => 
        msg.id === 1 
          ? { ...msg, text: `Ahlan ${userName}! I'm Nashmi, your witty Jordan travel companion! 🌟 How can I make your Jordan adventure unforgettable today?` }
          : msg
      ));
    }
  }, [userProfile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Get conversation history (last 10 messages)
      const conversationHistory = messages.slice(-10).map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));

      // Generate response using the AI service
      const response = await generateChatResponse(currentInput, conversationHistory, userProfile);

      const botResponse = {
        id: messages.length + 2,
        text: response.text,
        sender: 'bot',
        images: response.images || [],
        offers: response.offers || [],
        suggestions: response.suggestions || [],
        hotels: response.hotels || []
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse = {
        id: messages.length + 2,
        text: "Oops! I'm having a little technical difficulty. Can you try asking that again?",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Chat Button - Mobile Optimized */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-3 sm:p-4 rounded-full shadow-glow hover:shadow-glow-purple transition-all duration-300 z-40 touch-manipulation animate-float"
        aria-label="Open chat"
        aria-expanded={isOpen}
        style={{ minWidth: '48px', minHeight: '48px' }} // Minimum touch target size
      >
        {isOpen ? (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>

      {/* Chat Window - Mobile Responsive */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-16 sm:bottom-24 sm:right-6 sm:left-auto w-auto sm:w-80 h-[calc(100vh-8rem)] sm:h-96 glass-card rounded-2xl shadow-glow-purple z-50 flex flex-col max-w-sm mx-auto sm:mx-0 border border-white/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white p-4 sm:p-5 rounded-t-2xl flex-shrink-0 shadow-lg">
            <h3 className="font-bold text-base sm:text-lg">{t('chatbot.title', 'Nashmi')}</h3>
            <p className="text-sm sm:text-base opacity-90 font-light">{t('chatbot.subtitle', 'Your witty Jordan travel companion!')}</p>
          </div>

          {/* Messages - Mobile Optimized */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <p className="text-sm sm:text-base whitespace-pre-line leading-relaxed">{message.text}</p>
                  {message.images && message.images.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.images.map((img, idx) => (
                        <div key={idx} className="w-full">
                          <OptimizedImage
                            src={img.url}
                            alt={img.alt || 'Hotel image'}
                            className="w-full h-24 sm:h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(img.url, '_blank')}
                            sizes="100vw"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {message.offers && message.offers.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.offers.map((offer, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 p-2 rounded border-l-4 border-green-500">
                          <p className="text-xs font-semibold text-green-800 dark:text-green-200">{offer.title}</p>
                          <p className="text-xs text-green-700 dark:text-green-300">{offer.description}</p>
                          {offer.discount && <p className="text-xs font-bold text-red-600">{offer.discount}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                  {message.hotels && message.hotels.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {message.hotels.map((hotel, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm overflow-hidden">
                          {hotel.image && (
                            <OptimizedImage src={hotel.image} alt={hotel.name} className="w-full h-24 sm:h-32 object-cover rounded-md mb-2" sizes="100vw" />
                          )}
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white">{hotel.name}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 my-1">{hotel.description || hotel.location}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{hotel.price ? `${hotel.price} JOD` : 'Check price'}</span>
                            <a href={`/hotels/${hotel.id}`} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors touch-manipulation">
                              Book Now
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setInputValue(suggestion)}
                          aria-label={`Use suggestion: ${suggestion}`}
                          className="text-xs bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 px-3 py-2 rounded transition-colors touch-manipulation min-h-[44px]"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Mobile Optimized */}
          <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('chatbot.placeholder', 'Type your message...')}
                className="flex-1 px-3 py-2 text-sm sm:text-base border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-jordan-blue dark:bg-slate-700 dark:text-slate-100 min-h-[44px] touch-manipulation"
              />
              <button
                type="submit"
                className="px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
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
