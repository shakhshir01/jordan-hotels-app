import { api as apiClient } from './api';

// Resolve external chat API URL from runtime config (public/runtime-config.js) if present
const getExternalChatUrl = () => {
  try {
    // runtime-config is injected to window before app boot
    const cfg = typeof window !== 'undefined' && window.__VISITJO_RUNTIME_CONFIG__;
    if (cfg && cfg.VITE_CHAT_API_URL) return cfg.VITE_CHAT_API_URL;
  } catch (_) {}
  // fallback to undefined
  return undefined;
};

// chatQuery: prefer externally-configured chat endpoint, then app /api, then local generator
export const chatQuery = async (message, history = []) => {
  const externalUrl = getExternalChatUrl();

  // 1) External (Vercel/Netlify) full URL if configured
  if (externalUrl) {
    try {
      const res = await fetch(externalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: message, history }),
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (_err) {
      // ignore and fall back
    }
  }

  // 2) App backend (/api/chat) via existing axios client
  try {
    if (apiClient && apiClient.defaults) {
      const res = await apiClient.post('/chat', { query: message, history });
      if (res && res.data) return res.data;
    }
  } catch (_err) {
    // ignore and fall back
  }

  // 3) Local fallback generator
  try {
    const mod = await import('./chatbot');
    if (mod && typeof mod.generateChatResponse === 'function') {
      return await mod.generateChatResponse(message, history);
    }
  } catch (_err) {
    console.error('Local chat fallback failed', _err);
  }

  return { text: "Sorry, I can't respond right now.", hotels: [], suggestions: [] };
};

export default { chatQuery };
