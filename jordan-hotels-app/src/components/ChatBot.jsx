import { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { generateChatResponse } from '../services/chatbot';
import OptimizedImage from './OptimizedImage';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! I\'m Nashmi, your witty Jordan travel companion! 🌟 How can I make your Jordan adventure unforgettable today?',
      sender: 'bot',
      timestamp: new Date(),
      status: 'read'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const mountedRef = useRef(true);
  const { userProfile } = useContext(AuthContext);

  // Enhanced greeting with user personalization
  useEffect(() => {
    if (userProfile?.displayName || userProfile?.name) {
      const userName = userProfile.displayName || userProfile.name;
      setMessages(prev => prev.map(msg =>
        msg.id === 1
          ? {
              ...msg,
              text: `Ahlan ${userName}! I'm Nashmi, your witty Jordan travel companion! 🌟 Ready to turn your Jordan dreams into unforgettable adventures? Wallahi, you'll love every moment!`,
              timestamp: new Date()
            }
          : msg
      ));
    }
  }, [userProfile]);

  // Listen for external open chat events
  useEffect(() => {
    const handleOpenChat = () => {
      console.log('ChatBot: Received openChatBot event, opening chat...');
      setIsOpen(true);
    };

    console.log('ChatBot: Setting up event listener for openChatBot');
    window.addEventListener('openChatBot', handleOpenChat);

    // Also expose a global function for direct calling
    window.openChatBot = () => {
      console.log('ChatBot: openChatBot() function called, opening chat...');
      setIsOpen(true);
    };

    return () => {
      console.log('ChatBot: Removing event listener for openChatBot');
      window.removeEventListener('openChatBot', handleOpenChat);
      delete window.openChatBot;
    };
  }, []);

  // Auto-scroll with smooth animation
  const scrollToBottom = () => {
    if (mountedRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  // Keyboard support for chat
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      const timeoutId = setTimeout(() => {
        if (mountedRef.current && inputRef.current) {
          inputRef.current.focus();
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Update message status to sent
    setTimeout(() => {
      if (mountedRef.current) {
        setMessages(prev => prev.map(msg =>
          msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
        ));
      }
    }, 500);

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
        hotels: response.hotels || [],
        timestamp: new Date(),
        status: 'delivered'
      };

      setMessages(prev => [...prev, botResponse]);

      // Mark as read after a short delay
      setTimeout(() => {
        setMessages(prev => prev.map(msg =>
          msg.id === botResponse.id ? { ...msg, status: 'read' } : msg
        ));
      }, 1000);

    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse = {
        id: messages.length + 2,
        text: "Oops! I'm having a little technical difficulty. Can you try asking that again? Maybe I can help with hotels, deals, or travel tips instead! 🏨✨",
        sender: 'bot',
        timestamp: new Date(),
        status: 'error'
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickAction = (action) => {
    const quickMessages = {
      hotels: "Show me the best hotels in Amman",
      deals: "What deals do you have this week?",
      petra: "Tell me about Petra",
      food: "What's the best Jordanian food to try?"
    };
    setInputValue(quickMessages[action] || action);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sending': return '⏳';
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      case 'error': return '❌';
      default: return '';
    }
  };

  return (
    <>
      {/* Premium Jordan-Inspired Chat Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        {/* Notification Badge */}
        {messages.length > 1 && (
          <div className="absolute -top-2 -right-2 bg-jordan-gold text-slate-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
            {messages.filter(m => m.sender === 'bot' && m.status !== 'read').length}
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="group relative bg-gradient-to-br from-jordan-blue via-jordan-teal to-jordan-rose hover:from-jordan-blue/90 hover:via-jordan-teal/90 hover:to-jordan-rose/90 text-white p-4 rounded-full shadow-2xl hover:shadow-jordan-gold/25 transition-all duration-500 transform hover:scale-110 animate-float"
          aria-label="Open Nashmi Chat - Your Jordan Travel Companion"
          aria-expanded={isOpen}
        >
          {/* Enhanced Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-jordan-gold/50 to-jordan-rose/50 blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-jordan-blue/30 to-jordan-teal/30 blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>

          <div className="relative">
            {isOpen ? (
              <svg className="w-6 h-6 transform rotate-0 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <div className="relative">
                {/* Jordan-Inspired Chat Icon */}
                <div className="w-6 h-6 flex items-center justify-center">
                  <span className="text-lg animate-pulse">🤖</span>
                </div>
                {/* Enhanced Online Indicator */}
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white shadow-lg ${isOnline ? 'bg-jordan-gold animate-pulse' : 'bg-slate-400'}`}></div>
              </div>
            )}
          </div>

          {/* Floating Sparkles */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-jordan-gold rounded-full animate-ping opacity-75"></div>
          <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-jordan-rose rounded-full animate-ping opacity-75" style={{ animationDelay: '1s' }}></div>
        </button>
      </div>

      {/* Enhanced Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-2 sm:inset-x-4 bottom-16 sm:bottom-20 sm:right-6 sm:left-auto w-[calc(100vw-1rem)] sm:w-auto max-w-lg mx-auto sm:mx-0 h-[calc(100vh-8rem)] sm:h-[48rem] glass-card rounded-3xl shadow-2xl z-50 flex flex-col max-w-lg mx-auto sm:mx-0 border border-white/30 backdrop-blur-2xl">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white p-5 rounded-t-3xl flex-shrink-0 shadow-xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            </div>

            <div className="relative flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Nashmi Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <span className="text-lg">🤖</span>
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                </div>

                <div>
                  <h3 className="font-bold text-lg flex items-center">
                    Nashmi
                    <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
                      {isOnline ? 'Online' : 'Away'}
                    </span>
                  </h3>
                  <p className="text-sm opacity-90 font-light">Your witty Jordan travel companion! ✨</p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Emoji picker"
                >
                  😊
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  aria-label="Minimize chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-3 flex-shrink-0">
            <div className="flex space-x-2 overflow-x-auto">
              {['hotels', 'deals', 'petra', 'food'].map((action) => (
                <button
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className="flex-shrink-0 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs rounded-full transition-all duration-200 transform hover:scale-105 backdrop-blur-sm"
                >
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 custom-scrollbar">
            {messages.map((message, _index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setSelectedMessage(selectedMessage === message.id ? null : message.id);
                }}
              >
                <div className="flex items-end space-x-2 max-w-[95%] sm:max-w-[85%]">
                  {/* Avatar for bot messages */}
                  {message.sender === 'bot' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-sm">🤖</span>
                    </div>
                  )}

                  <div className="relative">
                    {/* Message Bubble */}
                    <div
                      className={`px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-br-md'
                          : 'bg-white/90 dark:bg-slate-700/90 text-slate-800 dark:text-slate-200 rounded-bl-md backdrop-blur-sm'
                      } ${message.status === 'error' ? 'border border-red-300 bg-red-50 dark:bg-red-900/20' : ''}`}
                    >
                      <p className="text-base leading-relaxed whitespace-pre-line">{message.text}</p>

                      {/* Timestamp */}
                      <div className={`text-sm mt-2 flex items-center justify-end space-x-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        <span>{formatTime(message.timestamp)}</span>
                        {message.sender === 'user' && (
                          <span className="text-xs">{getMessageStatusIcon(message.status)}</span>
                        )}
                      </div>
                    </div>

                    {/* Message Actions (on hover/right-click) */}
                    {selectedMessage === message.id && (
                      <div className="absolute top-0 right-0 mt-1 mr-1 bg-black/80 text-white text-xs rounded px-2 py-1 opacity-0 animate-fade-in">
                        Message actions coming soon!
                      </div>
                    )}

                    {/* Enhanced Content: Images */}
                    {message.images && message.images.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <OptimizedImage
                              src={img.url}
                              alt={img.alt || 'Hotel image'}
                              className="w-full h-32 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
                              onClick={() => window.open(img.url, '_blank')}
                              sizes="100vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Enhanced Content: Offers */}
                    {message.offers && message.offers.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.offers.map((offer, idx) => (
                          <div key={idx} className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 p-3 rounded-xl border-l-4 border-green-500 shadow-lg backdrop-blur-sm">
                            <p className="text-sm font-semibold text-green-800 dark:text-green-200">{offer.title}</p>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">{offer.description}</p>
                            {offer.discount && <p className="text-xs font-bold text-red-600 mt-1">{offer.discount}</p>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Enhanced Content: Hotels */}
                    {message.hotels && message.hotels.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {message.hotels.map((hotel, idx) => (
                          <div key={idx} className="bg-white/95 dark:bg-slate-800/95 p-4 rounded-xl border border-slate-200/50 dark:border-slate-600/50 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
                            {hotel.image && (
                              <OptimizedImage
                                src={hotel.image}
                                alt={hotel.name}
                                className="w-full h-32 object-cover rounded-lg mb-3 shadow-md"
                                sizes="100vw"
                              />
                            )}
                            <h4 className="font-bold text-base text-slate-800 dark:text-white mb-1">{hotel.name}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">{hotel.description || hotel.location}</p>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-1">
                                <span className="text-lg">⭐</span>
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{hotel.rating || '4.5'}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{hotel.price ? `${hotel.price} JOD` : 'Check price'}</span>
                                <a
                                  href={`/hotels/${hotel.id}`}
                                  className="block mt-2 text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg text-center"
                                >
                                  Book Now ✨
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Enhanced Content: Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setInputValue(suggestion)}
                            aria-label={`Use suggestion: ${suggestion}`}
                            className="text-xs bg-white/20 dark:bg-slate-600/50 hover:bg-white/30 dark:hover:bg-slate-500/70 px-3 py-2 rounded-full transition-all duration-200 transform hover:scale-105 backdrop-blur-sm border border-white/20 shadow-sm"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Enhanced Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-end space-x-2">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="bg-white/90 dark:bg-slate-700/90 px-4 py-3 rounded-2xl rounded-bl-md shadow-lg backdrop-blur-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Nashmi is typing...</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Input Area */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20 flex-shrink-0 bg-white/5 backdrop-blur-sm">
            <div className="flex gap-3 items-end">
              {/* Emoji Picker Toggle */}
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 transform hover:scale-110 backdrop-blur-sm"
                aria-label="Add emoji"
              >
                <span className="text-xl">😊</span>
              </button>

              {/* Input Field */}
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Nashmi about Jordan travel... ✨"
                  className="w-full px-4 py-4 text-base border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white/10 backdrop-blur-sm text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-200"
                  maxLength={500}
                />

                {/* Character Counter */}
                {inputValue.length > 400 && (
                  <div className="absolute right-3 top-4 text-sm text-slate-500">
                    {inputValue.length}/500
                  </div>
                )}
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl transition-all duration-200 transform hover:scale-110 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                aria-label="Send message"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {/* Emoji Picker Panel */}
            {showEmojiPicker && (
              <div className="mt-3 p-4 bg-white/95 dark:bg-slate-800/95 rounded-xl shadow-xl backdrop-blur-sm border border-white/20">
                <div className="grid grid-cols-8 gap-3">
                  {['😊', '😂', '🤔', '❤️', '👍', '👎', '🎉', '🔥', '⭐', '🏨', '✈️', '🌟', '🍕', '☕', '🏛️', '🏜️'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setInputValue(prev => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="text-3xl hover:bg-slate-100 dark:hover:bg-slate-700 p-3 rounded-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </>
  );
}
