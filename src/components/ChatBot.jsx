import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Minimize2, Maximize2, MessageCircle, Headphones } from 'lucide-react';
import { generateChatResponse, HOTEL_DATA } from '../services/chatbot';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 Welcome to VisitJo! I'm your travel assistant. How can I help you find the perfect hotel today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(['spa & wellness', 'beach vacation', 'adventure', 'luxury travel', 'city exploration']);
  const [viewedHotels, setViewedHotels] = useState([]);
  const [awaitingHuman, setAwaitingHuman] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Get bot response
    setTimeout(() => {
      try {
        const response = generateChatResponse(input, messages);

        let botText = response.text;
        if (response.hotels && response.hotels.length > 0) {
          const lines = response.hotels.map((id) => {
            const meta = HOTEL_DATA[id];
            const name = meta?.name || id;
            const bestFor = Array.isArray(meta?.bestFor) ? meta.bestFor.slice(0, 2).join(', ') : '';
            return bestFor ? `• ${name} — best for ${bestFor}` : `• ${name}`;
          }).join('\n');

          botText += `\n\n✨ Recommended for you:\n${lines}`;
          setViewedHotels((prev) => [...new Set([...prev, ...response.hotels])]);
        }

        const botMessage = {
          id: messages.length + 2,
          text: botText,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: response.suggestions,
          hotels: response.hotels,
        };
        setMessages((prev) => [...prev, botMessage]);
        setSuggestions(response.suggestions || []);
      } catch (err) {
        console.error('ChatBot error:', err);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: "Sorry, something went wrong while generating a reply. Please try again.",
            sender: 'bot',
            timestamp: new Date(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const handleSuggestion = (suggestion) => {
    setInput(suggestion);
  };

  const handleEscalateToHuman = () => {
    setAwaitingHuman(true);
    setMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        text:
          "I’ve flagged this conversation for a human agent. In a live setup, this would create a support ticket with your last messages and contact details.",
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-900 to-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40"
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all ${isMinimized ? 'h-16' : 'h-96'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <h3 className="font-bold">VisitJo Travel Assistant</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-blue-600 p-2 rounded transition"
            >
              {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-600 p-2 rounded transition"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-blue-900 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    {msg.suggestions && msg.suggestions.length > 0 && msg.sender === 'bot' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.suggestions.slice(0, 3).map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestion(sug)}
                            className="text-xs bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800 transition"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-4 bg-white">
              <form onSubmit={handleSendMessage} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about hotels..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="bg-blue-900 text-white p-2 rounded-lg hover:bg-blue-800 transition disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </form>
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>
                  Tip: avoid sharing card numbers or sensitive data in chat.
                </span>
                <button
                  type="button"
                  onClick={handleEscalateToHuman}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-300 text-[11px] hover:bg-gray-50"
                >
                  <Headphones size={12} />
                  Ask for human
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
