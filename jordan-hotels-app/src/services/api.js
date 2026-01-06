import axios from "axios";
import {
  mockHotels,
  mockDestinations,
  mockDeals,
  mockExperiences,
  mockBlogPosts,
  mockSearchResult,
} from "./mockData.js";
import { sanitizeHotelImageUrls } from "../utils/hotelImageFallback";

// Resolve API URL in this order:
// 1) runtime config (public/runtime-config.js) - works in Amplify without env vars
// 2) Vite env var (works locally)
// Avoid old API IDs that are known to be stale.
const STALE_API_IDS = ["ny5ohksmc3"];

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

const rawRuntimeApiUrl = getRuntimeApiUrl();
const rawEnvApiUrl = import.meta.env.VITE_API_GATEWAY_URL || "";

const effectiveApiUrl =
  rawRuntimeApiUrl && !isStaleApiUrl(rawRuntimeApiUrl)
    ? rawRuntimeApiUrl
    : rawEnvApiUrl && !isStaleApiUrl(rawEnvApiUrl)
      ? rawEnvApiUrl
      : "";

const resolvedApiBaseUrl = normalizeBaseUrl(effectiveApiUrl);

// Local dev: avoid CORS by routing through Vite's dev proxy (/api -> VITE_API_GATEWAY_URL)
const shouldUseDevProxy =
  import.meta.env.DEV &&
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const API_BASE_URL = shouldUseDevProxy ? "/api" : resolvedApiBaseUrl;
const API_KEY = import.meta.env.VITE_API_KEY || "";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: API_KEY ? { "x-api-key": API_KEY } : undefined,
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

const normalizeHotel = (rawHotel) => {
  if (!rawHotel || typeof rawHotel !== "object") return rawHotel;

  const key = rawHotel.id || rawHotel.hotelId || rawHotel.name || "";
  const rawImages = Array.isArray(rawHotel.images) ? rawHotel.images.filter(Boolean) : [];
  const rawImage = typeof rawHotel.image === "string" && rawHotel.image.trim() ? rawHotel.image.trim() : "";

  const sanitized = sanitizeHotelImageUrls([rawImage, ...rawImages], key);
  const image = sanitized[0] || "";
  const images = sanitized;

  return {
    ...rawHotel,
    images,
    image,
  };
};

export const hotelAPI = {
  getAllHotels: async (location = "") => {
    if (getUseMocks()) {
      return mockHotels.filter(
        (h) => !location || h.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    try {
      const url = location ? `/hotels?location=${encodeURIComponent(location)}` : "/hotels";
      const response = await apiClient.get(url);
      const data = normalizeLambdaResponse(response.data);
      if (Array.isArray(data)) return data.map(normalizeHotel);
      if (data?.hotels && Array.isArray(data.hotels)) return data.hotels.map(normalizeHotel);
      return [];
    } catch (error) {
      // fallback to mocks on auth error
      if (lastAuthError) return mockHotels;
      throw error;
    }
  },

  getHotelById: async (id) => {
    if (getUseMocks()) {
      return mockHotels.find((h) => h.id === id) || null;
    }
    try {
      const response = await apiClient.get(`/hotels/${id}`);
      return normalizeHotel(normalizeLambdaResponse(response.data));
    } catch (error) {
      if (lastAuthError) return mockHotels.find((h) => h.id === id) || null;
      throw error;
    }
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
    if (getUseMocks()) {
      return { sessionId: `stub_${Date.now()}` };
    }
    try {
      const response = await apiClient.post(`/payments/create-checkout-session`, { hotelId, ...bookingData });
      return normalizeLambdaResponse(response.data);
    } catch (error) {
      if (lastAuthError) return { sessionId: `stub_${Date.now()}` };
      throw error;
    }
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
  searchAll: async (q = "") => {
    if (getUseMocks()) return mockSearchResult({ q });
    try {
      const url = q ? `/search?q=${encodeURIComponent(q)}` : "/search";
      const response = await apiClient.get(url);
      return normalizeLambdaResponse(response.data) || mockSearchResult({ q });
    } catch (error) {
      if (lastAuthError) return mockSearchResult({ q });
      throw error;
    }
  },

  getDestinations: async () => {
    if (getUseMocks()) return mockDestinations;
    try {
      const res = await apiClient.get("/destinations");
      return normalizeLambdaResponse(res.data) || mockDestinations;
    } catch (error) {
      if (lastAuthError) return mockDestinations;
      throw error;
    }
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
    if (getUseMocks()) return mockDeals;
    try {
      const res = await apiClient.get("/deals");
      return normalizeLambdaResponse(res.data) || mockDeals;
    } catch (error) {
      if (lastAuthError) return mockDeals;
      throw error;
    }
  },
  getExperiences: async () => {
    if (getUseMocks()) return mockExperiences;
    try {
      const res = await apiClient.get("/experiences");
      return normalizeLambdaResponse(res.data) || mockExperiences;
    } catch (error) {
      if (lastAuthError) return mockExperiences;
      throw error;
    }
  },

  getBlogPosts: async () => {
    if (getUseMocks()) return mockBlogPosts;
    try {
      const res = await apiClient.get("/blog");
      return normalizeLambdaResponse(res.data) || mockBlogPosts;
    } catch (error) {
      if (lastAuthError) return mockBlogPosts;
      throw error;
    }
  },
};

export const api = apiClient;
export default apiClient;
