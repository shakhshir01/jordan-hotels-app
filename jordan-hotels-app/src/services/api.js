import axios from "axios";
import { XOTELO_JORDAN_HOTELS } from "./xoteloJordanHotelsData.js";
import { sanitizeHotelImageUrls, GENERIC_HOTEL_FALLBACK_IMAGES, getGenericHotelFallbackImage } from "../utils/hotelImageFallback";

// Resolve API URL in this order:
// 1) runtime config (public/runtime-config.js) - works in Amplify without env vars
// 2) Vite env var (works locally)
// Avoid old API IDs that are known to be stale.
const STALE_API_IDS = ["ny5ohksmc3", "g7itqnbol9", "b47h3h8tnb", "4yj6ft3108"];

const normalizeBaseUrl = (value) => String(value || "").trim().replace(/\/$/, "");

const isStaleApiUrl = (value) => {
  const url = String(value || "");
  return STALE_API_IDS.some((id) => url.includes(id));
};

const getRuntimeApiUrl = () => {
  if (typeof window === "undefined") return "";
  const cfg = window.__VISITJO_RUNTIME_CONFIG__;
  return cfg && typeof cfg.VITE_API_GATEWAY_URL === "string" ? cfg.VITE_API_GATEWAY_URL : "";
};

const getRuntimeApiTimeoutMs = () => {
  if (typeof window === "undefined") return null;
  const cfg = window.__VISITJO_RUNTIME_CONFIG__;
  const raw = cfg ? cfg.VITE_API_TIMEOUT_MS : null;
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const rawRuntimeApiUrl = getRuntimeApiUrl();
const rawEnvApiUrl = import.meta.env.VITE_API_GATEWAY_URL || "";

const rawRuntimeTimeoutMs = getRuntimeApiTimeoutMs();
const rawEnvTimeoutMs = import.meta.env.VITE_API_TIMEOUT_MS;
const resolvedTimeoutMs = (() => {
  const candidates = [rawRuntimeTimeoutMs, rawEnvTimeoutMs].map((v) => Number(v));
  const picked = candidates.find((n) => Number.isFinite(n) && n > 0);
  const base = picked ?? 15000;
  return Math.min(60000, Math.max(5000, Math.round(base)));
})();

const effectiveApiUrl =
  rawRuntimeApiUrl && !isStaleApiUrl(rawRuntimeApiUrl)
    ? rawRuntimeApiUrl
    : rawEnvApiUrl && !isStaleApiUrl(rawEnvApiUrl)
      ? rawEnvApiUrl
      : "";

const resolvedApiBaseUrl = normalizeBaseUrl(effectiveApiUrl);

// Local dev: optionally avoid CORS by routing through Vite's dev proxy (/api -> VITE_API_GATEWAY_URL).
// Important: the Vite proxy is only configured from VITE_API_GATEWAY_URL (not runtime-config),
// so don't force /api unless that env var is present.
const isLocalDevHost =
  import.meta.env.DEV &&
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

// In local dev always use the Vite dev proxy path `/api` so requests are proxied
// to the configured `VITE_API_GATEWAY_URL`. This avoids CORS / 403 problems
// when the frontend and local API gateway are on different ports.
// Smart routing: use public API for hotels, deals, destinations, experiences, search
const PUBLIC_API_BASE_URL = resolvedApiBaseUrl || "";
const LOCAL_API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || "";
// API Key for public endpoints (if required)
// Try runtime config, then Vite env, else undefined
let API_KEY = undefined;
if (typeof window !== "undefined" && window.__VISITJO_RUNTIME_CONFIG__ && window.__VISITJO_RUNTIME_CONFIG__.VITE_API_KEY) {
  API_KEY = window.__VISITJO_RUNTIME_CONFIG__.VITE_API_KEY;
} else if (import.meta.env.VITE_API_KEY) {
  API_KEY = import.meta.env.VITE_API_KEY;
}

function getApiBaseUrl(path) {
  // Always use public API for hotels, deals, destinations, experiences, search
  if (PUBLIC_API_BASE_URL) return PUBLIC_API_BASE_URL;

  // In local dev, force Vite proxy for user/profile endpoints to avoid CORS
  if (
    isLocalDevHost &&
    (/^\/user/.test(path) ||
      /^\/profile/.test(path) ||
      /^\/bookings/.test(path) ||
      /^\/uploads/.test(path) ||
      /^\/payments/.test(path))
  ) {
    return "/api";
  }

  // Otherwise, use local backend or fallback to public API
  return LOCAL_API_BASE_URL || PUBLIC_API_BASE_URL;
}

const apiClient = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  timeout: resolvedTimeoutMs,
  headers: API_KEY ? { "x-api-key": API_KEY } : undefined,
});

// Patch axios to use correct baseURL per endpoint
apiClient.interceptors.request.use((config) => {
  if (config && config.url) {
    const baseUrl = getApiBaseUrl(config.url);
    config.baseURL = baseUrl;
  }
  return config;
});

// Export function to set auth token (used by AuthContext)
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.Authorization;
  }
};

let lastAuthError = null;

const isAuthError = (status, message) => {
  if (!status && !message) return false;
  return (
    status === 401 ||
    status === 403 ||
    /Missing Authentication Token/i.test(message) ||
    /Authentication/i.test(message)
  );
};

apiClient.interceptors.response.use(
  (response) => {
    lastAuthError = null;
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const dataMessage = error.response?.data?.message || error.response?.data || null;
    const errorMessage = dataMessage || error.message || "An error occurred";

    if (isAuthError(status, errorMessage)) {
      lastAuthError = `API Authentication error: ${errorMessage}`;
      return Promise.reject(new Error(lastAuthError));
    }

    return Promise.reject(new Error(errorMessage));
  }
);

// Helpers for mock mode
export const getUseMocks = () => {
  // Allow opt-in mock mode via localStorage in the browser.
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("visitjo.useMocks") === "1";
  } catch {
    return false;
  }
};

export const enableMocks = (enable = true) => {
  try {
    localStorage.setItem("visitjo.useMocks", enable ? "1" : "0");
  } catch {
    // ignore (storage unavailable)
  }
  // reload so components re-run hooks and pick up mock data
  if (typeof window !== "undefined") {
    setTimeout(() => window.location.reload(), 100);
  }
};

const paymentsEnabled = String(import.meta.env.VITE_PAYMENTS_ENABLED || "").toLowerCase() === "true";

export const getLastAuthError = () => lastAuthError;

// Lambda proxy response normalizer
const normalizeLambdaResponse = (raw) => {
  let data = raw;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      // ignore (not JSON)
    }
  }
  if (data && typeof data.body === "string") {
    try {
      data = JSON.parse(data.body);
    } catch {
      // ignore (not JSON)
    }
  }
  return data;
};

// Generate default room types for hotels that don't have detailed room information
const generateDefaultRoomTypes = (hotel) => {
  const basePrice = hotel.price || 100;
  const rating = hotel.rating || 4.0;

  // Adjust prices based on hotel rating and location
  const priceMultiplier = rating >= 4.5 ? 1.3 : rating >= 4.0 ? 1.1 : 0.9;
  const adjustedBasePrice = Math.round(basePrice * priceMultiplier);

  // Determine if hotel has special features based on amenities or location
  const hasPool = hotel.amenities?.some(a => a.toLowerCase().includes('pool')) || false;
  const hasSpa = hotel.amenities?.some(a => a.toLowerCase().includes('spa')) || false;
  const isLuxury = rating >= 4.5 || basePrice > 200;

  const roomTypes = [
    {
      name: 'Standard Room',
      price: Math.round(adjustedBasePrice * 0.8),
      capacity: 2,
      features: [
        'City View',
        'Non-Smoking',
        'Mini Bar',
        'Safe',
        'Hair Dryer',
        'Air Conditioning',
        'Coffee Maker',
        'Work Desk'
      ],
      size: '28 m²',
      bedType: 'King or Twin Beds'
    },
    {
      name: 'Superior Room',
      price: adjustedBasePrice,
      capacity: 3,
      features: [
        'City View',
        'Balcony',
        'Non-Smoking',
        'Mini Bar',
        'Safe',
        'Hair Dryer',
        'Air Conditioning',
        'Coffee Maker',
        'Work Desk',
        ...(hasPool ? ['Pool Access'] : [])
      ],
      size: '35 m²',
      bedType: 'King Bed + Sofa Bed'
    }
  ];

  // Add premium rooms for higher-rated hotels
  if (rating >= 4.0) {
    roomTypes.push({
      name: 'Deluxe Room',
      price: Math.round(adjustedBasePrice * 1.3),
      capacity: 3,
      features: [
        'City View',
        'Balcony',
        'Executive Lounge Access',
        'Non-Smoking',
        'Mini Bar',
        'Safe',
        'Hair Dryer',
        'Air Conditioning',
        'Coffee Maker',
        'Work Desk',
        'Bathrobe & Slippers',
        ...(hasPool ? ['Pool Access'] : []),
        ...(hasSpa ? ['Spa Access'] : [])
      ],
      size: '42 m²',
      bedType: 'King Bed + Sofa Bed'
    });
  }

  // Add suite for luxury hotels
  if (isLuxury || rating >= 4.5) {
    roomTypes.push({
      name: 'Executive Suite',
      price: Math.round(adjustedBasePrice * 1.8),
      capacity: 4,
      features: [
        'Panoramic City View',
        'Separate Living Area',
        'Executive Lounge Access',
        'Balcony',
        'Non-Smoking',
        'Mini Bar',
        'Safe',
        'Hair Dryer',
        'Air Conditioning',
        'Coffee Maker',
        'Work Desk',
        'Bathrobe & Slippers',
        'Jacuzzi',
        ...(hasPool ? ['Pool Access'] : []),
        ...(hasSpa ? ['Spa Access'] : [])
      ],
      size: '65 m²',
      bedType: 'King Bed + Sofa Bed'
    });
  }

  // Add smoking room option
  roomTypes.push({
    name: 'Smoking Room',
    price: Math.round(adjustedBasePrice * 0.9),
    capacity: 2,
    features: [
      'City View',
      'Smoking Allowed',
      'Mini Bar',
      'Safe',
      'Hair Dryer',
      'Air Conditioning'
    ],
    size: '28 m²',
    bedType: 'King or Twin Beds',
    smoking: true
  });

  return roomTypes;
};

// Function to select the best available image for hotel profile/main display
const selectBestHotelImage = (sanitizedImages, key) => {
  if (!Array.isArray(sanitizedImages) || sanitizedImages.length === 0) {
    return getGenericHotelFallbackImage(key);
  }

  // Prioritize images that are not generic fallbacks
  // Generic fallbacks are from GENERIC_HOTEL_FALLBACK_IMAGES array
  const genericFallbacks = new Set(GENERIC_HOTEL_FALLBACK_IMAGES);

  // First, try to find a non-generic image
  for (const img of sanitizedImages) {
    if (img && !genericFallbacks.has(img)) {
      return img;
    }
  }

  // If all images are generic fallbacks, return the first one
  return sanitizedImages[0];
};

const normalizeHotel = (rawHotel) => {
  if (!rawHotel || typeof rawHotel !== "object") return rawHotel;

  const key = rawHotel.id || rawHotel.hotelId || rawHotel.name || "";
  // Prefer images array, fallback to image string
  let images = [];
  if (Array.isArray(rawHotel.images) && rawHotel.images.length > 0) {
    images = rawHotel.images.filter((img) => typeof img === "string" && img.trim() && !img.includes('caption.jpg'));
  } else if (typeof rawHotel.image === "string" && rawHotel.image.trim() && !rawHotel.image.includes('caption.jpg')) {
    images = [rawHotel.image.trim()];
  }
  const sanitized = sanitizeHotelImageUrls(images, key);

  // Select the best available image for the main profile image
  const image = selectBestHotelImage(sanitized, key);

  // Add default room types if not present
  const roomTypes = rawHotel.roomTypes || generateDefaultRoomTypes(rawHotel);

  // Add default policies if not present
  const policies = rawHotel.policies || {
    smoking: 'Designated smoking rooms available, non-smoking floors',
    pets: 'Pets not allowed',
    cancellation: 'Free cancellation up to 24 hours before check-in'
  };

  return {
    ...rawHotel,
    images: sanitized,
    image,
    roomTypes,
    policies,
  };
};

// Names / ids to exclude from searches (quick blacklist)
const EXCLUDED_HOTEL_NAMES = new Set([
  'namla bedouin camp'
]);

// Helper function to get hotels from static data with filtering and pagination
const getHotelsFromStatic = ({ q = "", cursor = "", limit = 30 } = {}) => {
  const allHotels = Array.isArray(XOTELO_JORDAN_HOTELS) ? XOTELO_JORDAN_HOTELS : [];

  // No deduplication needed since we only use one dataset
  const uniqueHotels = allHotels;

  // Normalize hotels (and filter out any blacklisted names/ids)
  const normalizedHotels = uniqueHotels.map(normalizeHotel).filter(h => {
    const name = String(h.name || "").toLowerCase();
    const id = String(h.id || "").toLowerCase();
    if (EXCLUDED_HOTEL_NAMES.has(name)) return false;
    if (EXCLUDED_HOTEL_NAMES.has(id)) return false;
    return true;
  });

  // Filter by query if provided
  let filteredHotels = normalizedHotels;
  if (q && String(q).trim()) {
    const normalizedQuery = String(q).toLowerCase().trim();
    filteredHotels = normalizedHotels.filter((hotel) => {
      const searchFields = [
        hotel.name,
        hotel.location,
        hotel.destination,
        hotel.city
      ].filter(Boolean).map(field => String(field).toLowerCase());

      return searchFields.some(field => field.includes(normalizedQuery));
    });
  }

  // Handle pagination
  const startIndex = cursor ? parseInt(cursor, 10) || 0 : 0;
  const endIndex = startIndex + limit;
  const hotels = filteredHotels.slice(startIndex, endIndex);
  const nextCursor = endIndex < filteredHotels.length ? String(endIndex) : null;

  return { hotels, nextCursor };
};

// Fallback function to fetch hotels from Xotelo API directly
const fetchXoteloFallback = async (limit = 100) => {
  try {
    const url = `https://data.xotelo.com/api/list?location_key=g293985&limit=${limit}&sort=best_value`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "VisitJo/1.0 (+https://visitjo.com)",
        "Accept": "application/json",
      },
    });
    const json = await response.json();
    if (json?.error) throw new Error(json.error.message || 'Xotelo API error');
    const list = Array.isArray(json?.result?.list) ? json.result.list : [];
    // Map to hotel format
    const hotels = list.map((item) => {
      const name = String(item?.name || "").trim();
      const key = String(item?.key || "").trim();
      const url = String(item?.url || "").trim();
      const rating = Number(item?.review_summary?.rating) || 0;
      const reviews = Number(item?.review_summary?.count) || 0;
      const min = item?.price_ranges?.minimum;
      const price = min != null ? Number(min) : 0;
      const image = typeof item?.image === "string" ? item.image.trim() : "";
      return {
        id: key || `xotelo-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        name: name || "Jordan stay",
        location: "Jordan",
        destination: "Jordan",
        price,
        currency: "USD",
        rating,
        reviews,
        image,
        images: image ? [image] : [],
        description: "",
        source: "xotelo",
        tripadvisorUrl: url,
        accommodationType: String(item?.accommodation_type || ""),
        mentions: Array.isArray(item?.mentions) ? item.mentions : [],
        merchandisingLabels: Array.isArray(item?.merchandising_labels) ? item.merchandising_labels : [],
        geo: item?.geo || null,
        priceRanges: item?.price_ranges || null,
        createdAt: new Date().toISOString(),
      };
    });
    // apply exclusion blacklist to fallback results as well
    const filtered = hotels.filter(h => {
      const name = String(h.name || "").toLowerCase();
      const id = String(h.id || "").toLowerCase();
      if (EXCLUDED_HOTEL_NAMES.has(name)) return false;
      if (EXCLUDED_HOTEL_NAMES.has(id)) return false;
      return true;
    });
    return filtered;
  } catch (error) {
    console.warn("Failed to fetch from Xotelo API:", error.message);
    // Fallback to static Xotelo data
    return Array.isArray(XOTELO_JORDAN_HOTELS) ? XOTELO_JORDAN_HOTELS.slice(0, limit) : [];
  }
};

export const hotelAPI = {
  getHotelsPage: async ({ cursor = "", limit = 100 } = {}) => {
    // Always use combined Xotelo + real hotel data
    const result = getHotelsFromStatic({ cursor, limit });
    if (!result.hotels || result.hotels.length === 0) {
      // Fallback: try Xotelo API
      const hotels = await fetchXoteloFallback(limit);
      return { hotels, nextCursor: null };
    }
    return result;
  },

  getAllHotels: async (location = "") => {
    const allHotels = Array.isArray(XOTELO_JORDAN_HOTELS) ? XOTELO_JORDAN_HOTELS : [];

    // No deduplication needed since we only use one dataset
    const uniqueHotels = allHotels;

    // Normalize hotels
    const normalizedHotels = uniqueHotels.map(normalizeHotel);

    // Filter by location if specified
    if (location && String(location).trim()) {
      const normalizedLocation = String(location).toLowerCase().trim();
      return normalizedHotels.filter((h) =>
        h.location.toLowerCase().includes(normalizedLocation) ||
        h.destination.toLowerCase().includes(normalizedLocation)
      );
    }

    return normalizedHotels;
  },

  getHotelById: async (id) => {
    // Always try static data first for reliability
    const allHotels = Array.isArray(XOTELO_JORDAN_HOTELS) ? XOTELO_JORDAN_HOTELS : [];
    const staticHotel = allHotels.find((h) => h.id === id);
    if (staticHotel) {
      return normalizeHotel(staticHotel);
    }

    // For now, skip API calls entirely to avoid CORS/502 errors
    // Return a basic hotel object so the page doesn't break
    console.warn('Hotel not found in static data, returning generic hotel for:', id);
    const genericHotel = {
      id,
      name: 'Jordan Hotel',
      location: 'Jordan',
      destination: 'Jordan',
      price: 100,
      currency: 'JOD',
      rating: 4.0,
      reviews: 50,
      image: '',
      images: [],
      description: 'A beautiful hotel in Jordan. More details coming soon.',
      amenities: ['Free WiFi', 'Restaurant', 'Bar', 'Gym'],
      rooms: 100,
      checkIn: '15:00',
      checkOut: '12:00',
      bedTypes: ['King', 'Twin'],
      createdAt: new Date().toISOString()
    };

    // Add room types and policies using the same logic as normalizeHotel
    return normalizeHotel(genericHotel);
  },

  bookHotel: async (hotelId, bookingData) => {
    if (getUseMocks()) {
      return { id: `mock_${Date.now()}`, hotelId, ...bookingData };
    }
    try {
      const response = await apiClient.post(`/bookings`, { hotelId, ...bookingData });
      return normalizeLambdaResponse(response.data);
    } catch (error) {
      if (lastAuthError) return { id: `mock_${Date.now()}`, hotelId, ...bookingData };
      throw error;
    }
  },

  cancelBooking: async (bookingId) => {
    if (getUseMocks()) return { success: true, deletedId: bookingId };
    try {
      const response = await apiClient.delete(`/bookings`, { params: { id: bookingId } });
      return normalizeLambdaResponse(response.data);
    } catch (error) {
      if (lastAuthError) return { success: true, deletedId: bookingId };
      throw error;
    }
  },

  createCheckoutSession: async (hotelId, bookingData) => {
    // Do not block payments just because mock mode is enabled.
    if (getUseMocks() && !paymentsEnabled) return { sessionId: `stub_${Date.now()}` };
    try {
      const response = await apiClient.post(`/payments/create-checkout-session`, { hotelId, ...bookingData });
      return normalizeLambdaResponse(response.data);
    } catch (error) {
      if (lastAuthError) return { sessionId: `stub_${Date.now()}` };
      throw error;
    }
  },

  createPaymentIntent: async (opts = {}) => {
    const { amount, currency = "jod", metadata } = opts;
    // Return mock payment intent if payments are not enabled
    if (!paymentsEnabled) {
      return {
        clientSecret: `pi_mock_${Date.now()}_secret_mock`,
        id: `pi_mock_${Date.now()}`,
        amount: amount,
        currency: currency.toLowerCase(),
        status: 'requires_payment_method',
        metadata: metadata || {}
      };
    }

    const response = await apiClient.post(`/payments/create-intent`, {
      amount,
      currency,
      metadata,
    });
    return normalizeLambdaResponse(response.data);
  },

  getS3UploadUrl: async (filename, contentType = "image/jpeg") => {
    if (getUseMocks()) {
      return { url: `https://example.com/mock-upload/${filename}`, key: `mock/${filename}` };
    }
    try {
      const response = await apiClient.post("/uploads/signed-url", { filename, contentType });
      return normalizeLambdaResponse(response.data);
    } catch (error) {
      if (lastAuthError) return { url: `https://example.com/mock-upload/${filename}`, key: `mock/${filename}` };
      throw error;
    }
  },

  uploadFileToSignedUrl: async (signedUrl, file) => {
    if (getUseMocks()) return true;
    const res = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) throw new Error("Upload to S3 failed");
    return true;
  },

  registerHotelImage: async (hotelId, imageKey) => {
    if (getUseMocks()) return { success: true };
    try {
      const response = await apiClient.post(`/hotels/${hotelId}/images`, { key: imageKey });
      return response.data;
    } catch (error) {
      if (lastAuthError) return { success: true };
      throw error;
    }
  },

  registerExperienceImage: async (experienceId, imageKey) => {
    if (getUseMocks()) return { success: true };
    try {
      const response = await apiClient.post(`/experiences/${experienceId}/images`, { key: imageKey });
      return response.data;
    } catch (error) {
      if (lastAuthError) return { success: true };
      throw error;
    }
  },

  getUserProfile: async () => {
    if (getUseMocks()) {
      // In mock mode, return an empty profile so the UI derives
      // real-looking data from the signed-in user's info instead
      // of showing hard-coded demo names.
      return {
        userId: "mock-user",
      };
    }
    try {
      const response = await apiClient.get("/user/profile");
      return response.data;
    } catch (error) {
      if (lastAuthError) {
        // If the API auth fails, surface an empty profile so
        // the frontend never shows fake "Demo User" data.
        return {
          userId: "fallback-user",
        };
      }
      throw error;
    }
  },

  updateUserProfile: async (profile) => {
    if (getUseMocks()) return { ...profile, userId: profile.userId || "demo-user" };
    try {
      const response = await apiClient.put("/user/profile", profile);
      return response.data;
    } catch (error) {
      if (lastAuthError) return { ...profile, userId: profile.userId || "demo-user" };
      throw error;
    }
  },

  // Email MFA management (backend endpoints expected)
  setupEmailMfa: async (secondaryEmail) => {
    if (getUseMocks()) return { success: true };
    try {
      const response = await apiClient.post("/user/mfa/email/setup", { secondaryEmail });
      return normalizeLambdaResponse(response.data);
    } catch (error) {
      if (lastAuthError) return { success: true };
      throw error;
    }
  },

  verifyEmailMfa: async (code) => {
    if (getUseMocks()) return { verified: true };
    try {
      const response = await apiClient.post("/user/mfa/email/verify", { code });
      return normalizeLambdaResponse(response.data);
    } catch (error) {
      if (lastAuthError) return { verified: true };
      throw error;
    }
  },

  requestEmailMfaChallenge: async () => {
    if (getUseMocks()) return { sent: true };
    try {
      const response = await apiClient.post("/auth/email-mfa/request");
      return normalizeLambdaResponse(response.data);
    } catch (error) {
      if (lastAuthError) return { sent: true };
      throw error;
    }
  },

  verifyLoginEmailMfa: async (code) => {
    if (getUseMocks()) return { verified: true };
    try {
      const response = await apiClient.post("/auth/email-mfa/verify-login", { code });
      return normalizeLambdaResponse(response.data);
    } catch (error) {
      if (lastAuthError) return { verified: true };
      throw error;
    }
  },

  disableMfa: async () => {
    if (getUseMocks()) return { success: true };
    try {
      const response = await apiClient.post("/user/mfa/disable");
      return normalizeLambdaResponse(response.data);
    } catch (error) {
      if (lastAuthError) return { success: true };
      throw error;
    }
  },

  disableMfaByEmail: async (email) => {
    if (getUseMocks()) return { success: true };
    try {
      const response = await apiClient.post("/user/mfa/disable-by-email", { email });
      return normalizeLambdaResponse(response.data);
    } catch (error) {
      // Handle CORS errors during password reset - MFA disable is not critical
      if (error.message?.includes('CORS') || error.code === 'ERR_NETWORK' || error.response?.status === 0) {
        console.warn('CORS error disabling MFA after password reset - continuing anyway:', error.message);
        return { success: true, warning: 'MFA disable failed due to CORS but password reset succeeded' };
      }
      if (lastAuthError) return { success: true };
      throw error;
    }
  },

  // TOTP MFA management
  setupTotpMfa: async () => {
    if (getUseMocks()) return { secret: 'mock-secret', qrCode: 'mock-qr', otpauthUrl: 'mock-url' };
    try {
      const response = await apiClient.post("/user/mfa/totp/setup");
      return normalizeLambdaResponse(response.data);
    } catch (error) {
      if (lastAuthError) return { secret: 'mock-secret', qrCode: 'mock-qr', otpauthUrl: 'mock-url' };
      throw error;
    }
  },

  verifyTotpMfa: async (code) => {
    if (getUseMocks()) return { verified: true };
    try {
      const response = await apiClient.post("/user/mfa/totp/verify", { code });
      return normalizeLambdaResponse(response.data);
    } catch (error) {
      if (lastAuthError) return { verified: true };
      throw error;
    }
  },

  verifyLoginTotpMfa: async (code) => {
    if (getUseMocks()) return { verified: true };
    try {
      const response = await apiClient.post("/auth/totp/verify-login", { code });
      return normalizeLambdaResponse(response.data);
    } catch (error) {
      if (lastAuthError) return { verified: true };
      throw error;
    }
  },

  getUserBookings: async () => {
    if (getUseMocks()) return [];
    try {
      const response = await apiClient.get("/user/bookings");
      const data = normalizeLambdaResponse(response.data);
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.bookings)) return data.bookings;
      return [];
    } catch (error) {
      if (lastAuthError) return [];
      throw error;
    }
  },

  // new dynamic endpoints: search / destinations / deals / experiences / blog
  searchHotelsPage: async (opts = {}) => {
    const { q = "", cursor = "", limit = 30, _signal } = opts;
    // Always use combined Xotelo + real hotel data for search
    const result = getHotelsFromStatic({ q, cursor, limit });
    if (!result.hotels || result.hotels.length === 0) {
      // Fallback: try Xotelo API
      const hotels = await fetchXoteloFallback(limit);
      return { hotels, nextCursor: null };
    }
    return result;
  },

  searchAll: async (q = '') => {
    const ql = (q || "").toLowerCase().trim();

    // Get filtered hotels from real data
    const { hotels } = getHotelsFromStatic({ q: ql, limit: 50 });

    // Try to get real destinations, fallback to mock
    let destinations = [];
    try {
      const apiDestinations = await hotelAPI.getDestinations();
      destinations = Array.isArray(apiDestinations) ? apiDestinations : [];
      if (ql) {
        destinations = destinations.filter(d =>
          !ql || d.name.toLowerCase().includes(ql) || d.description.toLowerCase().includes(ql)
        );
      }
    } catch (error) {
      console.warn("Failed to fetch destinations, using mock data:", error.message);
      destinations = mockDestinations.filter(d =>
        !ql || d.name.toLowerCase().includes(ql) || d.description.toLowerCase().includes(ql)
      );
    }

    // Try to get real deals, fallback to mock
    let deals = [];
    try {
      const apiDeals = await hotelAPI.getDeals();
      deals = Array.isArray(apiDeals) ? apiDeals : [];
      if (ql) {
        deals = deals.filter(d =>
          !ql || d.title.toLowerCase().includes(ql) || (d.meta && d.meta.toLowerCase().includes(ql))
        );
      }
    } catch (error) {
      console.warn("Failed to fetch deals, using mock data:", error.message);
      deals = mockDeals.filter(d =>
        !ql || d.title.toLowerCase().includes(ql) || (d.meta && d.meta.toLowerCase().includes(ql))
      );
    }

    // Try to get real experiences, fallback to mock
    let experiences = [];
    try {
      const apiExperiences = await hotelAPI.getExperiences();
      experiences = Array.isArray(apiExperiences) ? apiExperiences : [];
      if (ql) {
        experiences = experiences.filter(e =>
          !ql || e.title.toLowerCase().includes(ql) || (e.meta && e.meta.toLowerCase().includes(ql))
        );
      }
    } catch (error) {
      console.warn("Failed to fetch experiences, using mock data:", error.message);
      experiences = mockExperiences.filter(e =>
        !ql || e.title.toLowerCase().includes(ql) || (e.meta && e.meta.toLowerCase().includes(ql))
      );
    }

    return {
      hotels: hotels || [],
      destinations: destinations || [],
      deals: deals || [],
      experiences: experiences || [],
    };
  },

  getDestinations: async () => {
    // Try API, then mock, then derive from hotel data
    try {
      const res = await apiClient.get("/destinations");
      const apiDest = normalizeLambdaResponse(res.data);
      if (Array.isArray(apiDest) && apiDest.length > 0) return apiDest;
    } catch (_error) {
      // ignore, fallback below
    }
    if (getUseMocks() && Array.isArray(mockDestinations) && mockDestinations.length > 0) return mockDestinations;
    // Always fallback to mock data for better UX
    if (Array.isArray(mockDestinations) && mockDestinations.length > 0) return mockDestinations;
    // Derive destinations from hotel data
    const hotels = await hotelAPI.getAllHotels();
    const destMap = {};
    hotels.forEach(h => {
      const dest = h.destination || h.location || "Jordan";
      if (!destMap[dest]) {
        destMap[dest] = {
          id: `d-${dest.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          name: dest,
          description: `Hotels and stays in ${dest}`,
          hotels: [],
        };
      }
      destMap[dest].hotels.push(h.id);
    });
    return Object.values(destMap);
  },
  getDestinationById: async (id) => {
    if (getUseMocks()) return mockDestinations.find((d) => d.id === id) || null;
    try {
      const res = await apiClient.get(`/destinations/${id}`);
      return normalizeLambdaResponse(res.data);
    } catch (error) {
      if (lastAuthError) return mockDestinations.find((d) => d.id === id) || null;
      throw error;
    }
  },

  getDeals: async () => {
    return mockDeals;
  },
  getExperiences: async () => {
    // Always use mock data for now to ensure experiences show up and avoid CORS issues
    return mockExperiences;
  },

  getExperienceById: async (id) => {
    // Always use mock data first to avoid CORS issues, then try API as fallback
    const mockExperience = mockExperiences.find((exp) => exp.id === id);
    if (mockExperience) return mockExperience;

    if (getUseMocks()) {
      return null;
    }
    try {
      const res = await apiClient.get(`/experiences/${id}`);
      return normalizeLambdaResponse(res.data);
    } catch (error) {
      if (lastAuthError) return null;
      throw error;
    }
  },

  getBlogPosts: async () => {
    if (getUseMocks()) return mockBlogPosts;
    try {
      const res = await apiClient.get("/blog");
      return normalizeLambdaResponse(res.data) || mockBlogPosts;
    } catch (error) {
      console.warn("Failed to fetch blog posts, using mock data:", error.message);
      return mockBlogPosts;
    }
  },
};

const mockDestinations = [
  { id: "d-amman", name: "Amman", description: "Capital city with rich culture", count: 15, createdAt: new Date().toISOString() },
  { id: "d-petra", name: "Petra", description: "Ancient rock-cut city", count: 8, createdAt: new Date().toISOString() },
  { id: "d-wadi-rum", name: "Wadi Rum", description: "Dramatic desert landscapes", count: 5, createdAt: new Date().toISOString() },
  { id: "d-dead-sea", name: "Dead Sea", description: "Lowest point on Earth with mineral waters", count: 12, createdAt: new Date().toISOString() },
  { id: "d-aqaba", name: "Aqaba", description: "Red Sea resort town", count: 10, createdAt: new Date().toISOString() },
];

const mockDeals = [
  { id: "deal-weekend-escape", title: "Weekend Escape", meta: "City stays • Limited time", price: 99, discount: 25, rating: 4.5, createdAt: new Date().toISOString() },
  { id: "deal-desert-combo", title: "Desert + Petra Combo", meta: "Curated itinerary • Best value", price: 299, discount: 30, rating: 4.7, createdAt: new Date().toISOString() },
  { id: "deal-family-discount", title: "Family Stay Discount", meta: "Up to 4 people • Valid all year", price: 150, discount: 20, rating: 4.3, createdAt: new Date().toISOString() },
];

const mockExperiences = [
  {
    id: "exp-dana-petra-wadirum-deadsea",
    title: "Dana to Petra Trek + Wadi Rum & the Dead Sea",
    meta: "Trek • Adventure • 9 days",
    price: 120,
    rating: 4.8,
    reviews: 85,
    description: "Join a small group on the Dana to Petra Trek, then continue to Wadi Rum and the Dead Sea. 9 days, challenging adventure. Includes guided hikes, all meals, accommodation, and transfers.",
    duration: "9 days",
    difficulty: "Challenging",
    includes: ["Guided hikes", "All meals", "Hotel & camp accommodation", "Transfers", "Entrance fees"],
    highlights: ["Dana Biosphere Reserve", "Petra UNESCO site", "Wadi Rum desert", "Dead Sea swim"],
    imageUrl: "https://storage.googleapis.com/cf-public-eu/experiencejordan-98575/media/L327-8?t=1711463217913237",
    createdAt: new Date().toISOString()
  },
  {
    id: "exp-jordan-2day-petra-wadirum-deadsea",
    title: "Jordan 2-Day Tour (Petra, Wadi Rum & the Dead Sea)",
    meta: "Guided • Easy • 2 days",
    price: 55,
    rating: 4.6,
    reviews: 120,
    description: "Guided Petra tour, overnight in Bedouin camp in Wadi Rum, Dead Sea resort visit & lunch. Includes transport, guide, meals, and entrance fees.",
    duration: "2 days",
    difficulty: "Easy",
    includes: ["Transport", "Local guide", "Bedouin camp stay", "Meals", "Dead Sea resort access"],
    highlights: ["Petra Treasury", "Wadi Rum jeep tour", "Dead Sea floating"],
    imageUrl: "https://storage.googleapis.com/cf-public-eu/experiencejordan-98575/media/L384-1?t=1721915200482138",
    createdAt: new Date().toISOString()
  },
  {
    id: "exp-jordan-hiking-adventure",
    title: "Jordan Hiking Adventure",
    meta: "Hiking • Adventure • 8 days",
    price: 95,
    rating: 4.7,
    reviews: 95,
    description: "Unique hiking adventure in the best parts of Jordan. 8 days, challenging adventure. Includes guided hikes, meals, and accommodation.",
    duration: "8 days",
    difficulty: "Challenging",
    includes: ["Guided hikes", "Meals", "Hotel & camp accommodation", "Transfers"],
    highlights: ["Petra hike", "Wadi Mujib canyon", "Wadi Rum desert"],
    imageUrl: "https://storage.googleapis.com/cf-public-eu/experiencejordan-98575/media/L242-1?t=1687438161847075",
    createdAt: new Date().toISOString()
  },
  {
    id: "exp-petra-wadirum-trek",
    title: "Petra to Wadi Rum Trek",
    meta: "Trek • Tough • 6 days",
    price: 80,
    rating: 4.9,
    reviews: 75,
    description: "After Dana to Petra, continue trekking from Petra to Wadi Rum. 6 days, tough adventure. Includes guide, meals, and camp stays.",
    duration: "6 days",
    difficulty: "Tough",
    includes: ["Guided trek", "Meals", "Camp accommodation", "Transfers"],
    highlights: ["Petra trails", "Wadi Rum desert", "Bedouin camp"],
    imageUrl: "https://storage.googleapis.com/cf-public-eu/experiencejordan-98575/media/L295-8?t=1732614504053048",
    createdAt: new Date().toISOString()
  },
  {
    id: "exp-jordan-active-hike-bike",
    title: "Jordan Active Adventure (Hike & Bike)",
    meta: "Hike & Bike • Adventure • 8 days",
    price: 110,
    rating: 4.5,
    reviews: 110,
    description: "Combine hiking and biking to experience Jordan’s most beautiful sights. 8 days, challenging adventure. Includes guide, bike rental, meals, and accommodation.",
    duration: "8 days",
    difficulty: "Challenging",
    includes: ["Guided hikes", "Bike rental", "Meals", "Hotel & camp accommodation", "Transfers"],
    highlights: ["Petra hike", "Cycling Wadi Rum", "Dead Sea ride"],
    imageUrl: "https://storage.googleapis.com/cf-public-eu/experiencejordan-98575/media/L327-6?t=1649079700280540",
    createdAt: new Date().toISOString()
  },
  {
    id: "exp-summer-adventure-jordan",
    title: "Summer Adventure in Jordan",
    meta: "Summer • Moderate • 6 days",
    price: 60,
    rating: 4.4,
    reviews: 140,
    description: "Adventurous hikes, stunning landscapes, and outstanding hospitality. 6 days, moderate adventure. Includes guide, meals, and accommodation.",
    duration: "6 days",
    difficulty: "Moderate",
    includes: ["Guided hikes", "Meals", "Hotel accommodation", "Transfers"],
    highlights: ["Wadi Mujib hike", "Petra visit", "Wadi Rum sunset"],
    imageUrl: "https://storage.googleapis.com/cf-public-eu/experiencejordan-98575/media/L295-4?t=1643812377764360",
    createdAt: new Date().toISOString()
  }
];

const mockBlogPosts = [
  {
    id: "blog-welcome-visitjo",
    title: "Welcome to VisitJo - Your Jordan Travel Companion",
    slug: "welcome-to-visitjo",
    excerpt: "Discover the best of Jordan with our comprehensive travel platform",
    content: "Welcome to VisitJo, your ultimate guide to exploring the wonders of Jordan...",
    author: "VisitJo Team",
    publishedAt: new Date().toISOString(),
    tags: ["welcome", "travel", "jordan"],
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200",
  },
];

export const api = apiClient;
export default apiClient;

// --- realHotelsAPI Replacement (Using Xotelo Data) ---

const toUniqueStrings = (values) => {
  const out = [];
  const seen = new Set();
  for (const v of values || []) {
    if (typeof v !== "string") continue;
    const s = v.trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
};

const normalizeDestinationInput = (value) => {
  const v = String(value || '').trim();
  if (!v) return '';
  const compact = v.replace(/\s+/g, ' ');

  // Arabic -> canonical English destination strings
  if (/^عمّ?ان$/.test(compact)) return 'Amman';
  if (/^(ال)?بترا$/.test(compact) || /^البتراء$/.test(compact)) return 'Petra';
  if (/^البحر الميت$/.test(compact)) return 'Dead Sea';
  if (/^العقبة$/.test(compact)) return 'Aqaba';
  if (/^وادي رم$/.test(compact)) return 'Wadi Rum';

  return compact;
};

const normalizeHotelsForUi = (hotels) => {
  const fallbackSet = new Set(GENERIC_HOTEL_FALLBACK_IMAGES);
  const usedNonFallback = new Set();

  return (hotels || []).map((h) => {
    const rawImages = [h?.image, ...(Array.isArray(h?.images) ? h.images : [])]
      .filter(url => typeof url === 'string' && !url.includes('caption.jpg'));
    const sanitizedInput = sanitizeHotelImageUrls(rawImages, h?.id || h?.name || "");
    const unique = [];

    for (const url of toUniqueStrings(sanitizedInput)) {
      if (fallbackSet.has(url)) {
        unique.push(url);
        continue;
      }
      if (usedNonFallback.has(url)) continue;
      usedNonFallback.add(url);
      unique.push(url);
    }

    const fallback = getGenericHotelFallbackImage(h?.id || h?.name || "");
    const primary = unique[0] || fallback || "";
    const images = unique.length ? unique : (primary ? [primary] : []);

    return {
      ...h,
      image: primary,
      images,
    };
  });
};

let NORMALIZED_CACHE = null;
const getNormalizedHotels = () => {
  if (!NORMALIZED_CACHE) {
    // Use XOTELO_JORDAN_HOTELS instead of REAL_HOTELS
    NORMALIZED_CACHE = normalizeHotelsForUi(XOTELO_JORDAN_HOTELS);
  }
  return NORMALIZED_CACHE;
};

export const realHotelsAPI = {
  getAllHotels: async (location = '') => {
    const normalizedLocation = normalizeDestinationInput(location);
    if (normalizedLocation) {
      return getNormalizedHotels().filter((h) =>
        h.location.toLowerCase().includes(normalizedLocation.toLowerCase())
      );
    }
    return getNormalizedHotels();
  },

  getHotelById: async (id) => {
    return getNormalizedHotels().find((h) => h.id === id) || null;
  },

  getHotelsByDestination: async (destination) => {
    const normalizedDestination = normalizeDestinationInput(destination);
    return getNormalizedHotels().filter((h) =>
      h.destination.toLowerCase() === normalizedDestination.toLowerCase()
    );
  },

  searchHotels: async (filters) => {
    let results = getNormalizedHotels();
    if (filters.location) {
      const normalizedLocation = normalizeDestinationInput(filters.location);
      results = results.filter((h) => h.location.toLowerCase().includes(normalizedLocation.toLowerCase()));
    }
    if (filters.minPrice) results = results.filter((h) => h.price >= filters.minPrice);
    if (filters.maxPrice) results = results.filter((h) => h.price <= filters.maxPrice);
    if (filters.minRating) results = results.filter((h) => h.rating >= filters.minRating);
    return results;
  },

  getPopularHotels: async () => {
    return [...getNormalizedHotels()].sort((a, b) => b.rating - a.rating).slice(0, 6);
  },

  getFeaturedHotels: async () => {
    return getNormalizedHotels().filter((h) => h.rating >= 4.7);
  },
};
