import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, X, Minimize2, Maximize2, MessageCircle, Headphones } from 'lucide-react';
import { chatQuery } from '../services/chatService';
import hotelsService from '../services/hotelsService';
import { createHotelImageOnErrorHandler } from '../utils/hotelImageFallback';
import { useTranslation } from 'react-i18next';

export default function ChatBot() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: t('chat.greeting.default'),
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setSuggestions] = useState([
    t('chat.suggestions.spa'),
    t('chat.suggestions.beach'),
    t('chat.suggestions.adventure'),
    t('chat.suggestions.luxury'),
    t('chat.suggestions.city'),
  ]);
  const [, setViewedHotels] = useState([]);
  const [, setAwaitingHuman] = useState(false);
  const [hotelDetailsById, setHotelDetailsById] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const ids = new Set();
    for (const msg of messages) {
      if (msg?.sender === 'bot' && Array.isArray(msg?.hotels)) {
        for (const id of msg.hotels) ids.add(id);
      }
    }

    const missing = [...ids].filter((id) => id && !hotelDetailsById[id]);
    if (missing.length === 0) return;

    let cancelled = false;
    (async () => {
      try {
        const results = await Promise.all(
          missing.map(async (id) => {
            try {
              const hotel = await hotelsService.getHotelById(id);
              return [id, hotel];
            } catch {
              return [id, null];
            }
          })
        );

        if (cancelled) return;
        setHotelDetailsById((prev) => {
          const next = { ...prev };
          for (const [id, hotel] of results) {
            if (!next[id]) next[id] = hotel;
          }
          return next;
        });
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [messages, hotelDetailsById]);

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
    const nextHistory = [...messages, userMessage];
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Get bot response
    setTimeout(async () => {
      try {
        const response = await chatQuery(input, nextHistory);

        const botText = response?.text || '';
        if (Array.isArray(response?.hotels) && response.hotels.length > 0) {
          setViewedHotels((prev) => [...new Set([...prev, ...response.hotels])]);
        }

        const botMessage = {
          id: nextHistory.length + 1,
          text: botText,
          sender: 'bot',
          timestamp: new Date(),
          suggestions: response?.suggestions,
          hotels: response?.hotels,
          links: response?.links,
        };
        setMessages((prev) => [...prev, botMessage]);
        setSuggestions(response?.suggestions || []);
      } catch (err) {
        console.error('ChatBot error:', err);
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: t('chat.ui.error'),
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
          t('chat.ui.escalate'),
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
        aria-label={t('chat.ui.open')}
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
            <h3 className="font-bold">{t('chat.ui.title')}</h3>
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

                    {Array.isArray(msg.links) && msg.links.length > 0 && msg.sender === 'bot' && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {msg.links.slice(0, 3).map((l, idx) => (
                          <Link
                            key={`${l.to}-${idx}`}
                            to={l.to}
                            onClick={() => setIsOpen(false)}
                            className="text-xs bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800 transition"
                          >
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    )}

                    {Array.isArray(msg.hotels) && msg.hotels.length > 0 && msg.sender === 'bot' && (
                      <div className="mt-3 space-y-2">
                        {msg.hotels.slice(0, 3).map((id) => {
                          const d = hotelDetailsById[id];
                          const name = d?.name || id;
                          const location = d?.location || 'Jordan';
                          const image = d?.image || (Array.isArray(d?.images) ? d.images[0] : '') || '';
                          const price = d?.price;

                          return (
                            <div key={id} className="flex gap-3 bg-white/70 rounded-lg p-2 border border-gray-200">
                              <img
                                src={image}
                                alt={name}
                                onError={createHotelImageOnErrorHandler(`chat:${id}`)}
                                className="w-16 h-16 rounded-md object-cover flex-shrink-0"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-sm truncate">{name}</div>
                                <div className="text-xs text-gray-600 truncate">{location}</div>
                                {typeof price === 'number' && price > 0 && (
                                  <div className="text-xs text-blue-900 font-bold">{price} JOD {t('hotels.perNight')}</div>
                                )}
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Link
                                    to={`/hotels/${id}`}
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs bg-gray-200 text-gray-900 px-2 py-1 rounded hover:bg-gray-300 transition"
                                  >
                                    {t('common.view')}
                                  </Link>
                                  <Link
                                    to="/checkout"
                                    state={{
                                      hotelId: id,
                                      bookingData: { checkInDate: '', checkOutDate: '', nights: 1, guests: 2 },
                                    }}
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800 transition"
                                  >
                                    {t('common.book')}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

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
                  placeholder={t('chat.ui.placeholder')}
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
                  {t('chat.ui.tip')}
                </span>
                <button
                  type="button"
                  onClick={handleEscalateToHuman}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-300 text-[11px] hover:bg-gray-50"
                >
                  <Headphones size={12} />
                  {t('chat.ui.askHuman')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
