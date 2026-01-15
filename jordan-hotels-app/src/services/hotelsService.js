import { hotelAPI } from "./api";
import { sortHotelsByDistance } from "../utils/geo";

const TTL_MS = 2 * 60 * 1000;

const now = () => Date.now();

const cacheByLocation = new Map();
const cacheById = new Map();
const cacheNearby = new Map();

const normalizeKey = (value) => String(value || "").trim().toLowerCase();

const getCached = (map, key) => {
  const entry = map.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= now()) {
    map.delete(key);
    return null;
  }
  return entry.value;
};

const setCached = (map, key, value) => {
  map.set(key, { value, expiresAt: now() + TTL_MS });
};

const nearbyCacheKey = ({ lat, lon, limit, targetKm }) => {
  const la = Number(lat);
  const lo = Number(lon);
  const l = Math.max(1, Number(limit) || 12);
  const km = Math.max(1, Number(targetKm) || 20);
  // Bucket to ~1.1km at equator (fast + avoids over-caching)
  const latKey = Number.isFinite(la) ? la.toFixed(2) : "";
  const lonKey = Number.isFinite(lo) ? lo.toFixed(2) : "";
  return `${latKey},${lonKey}|l=${l}|km=${km}`;
};

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const cacheHotelsToIdMap = (hotels) => {
  for (const h of Array.isArray(hotels) ? hotels : []) {
    if (h && typeof h === "object" && h.id) {
      setCached(cacheById, normalizeKey(h.id), h);
    }
  }
};

const hotelsService = {
  getHotelsPage: async ({ cursor = "", limit = 100 } = {}) => {
    const page = await hotelAPI.getHotelsPage({ cursor, limit });
    const hotels = Array.isArray(page?.hotels) ? page.hotels : [];
    cacheHotelsToIdMap(hotels);
    return { hotels, nextCursor: page?.nextCursor || null };
  },

  getHotelsSample: async ({ limit = 200 } = {}) => {
    const page = await hotelsService.getHotelsPage({ limit });
    return page.hotels;
  },

  getNearbyHotelsByGeo: async (opts = {}) => {
    const { lat, lon, limit = 12, targetKm = 20, pageLimit = 80, maxPages = 3 } = opts;
    const userLat = Number(lat);
    const userLon = Number(lon);
    if (!Number.isFinite(userLat) || !Number.isFinite(userLon)) return [];

    const cacheKey = nearbyCacheKey({ lat: userLat, lon: userLon, limit, targetKm });
    const cached = getCached(cacheNearby, cacheKey);
    if (cached) return cached;

    const all = [];
    let cursor = "";

    for (let i = 0; i < maxPages; i++) {
      const page = await hotelsService.getHotelsPage({ cursor, limit: pageLimit });
      all.push(...page.hotels);
      cursor = page.nextCursor || "";

      const sorted = sortHotelsByDistance(all, userLat, userLon);
      const closeEnough = sorted.filter((x) => x.distKm <= targetKm);
      if (closeEnough.length >= limit) {
        const out = closeEnough.slice(0, limit).map((x) => x.hotel);
        setCached(cacheNearby, cacheKey, out);
        return out;
      }

      if (!cursor) break;
    }

    const sorted = sortHotelsByDistance(all, userLat, userLon);
    const out = sorted.slice(0, limit).map((x) => x.hotel);
    setCached(cacheNearby, cacheKey, out);
    return out;
  },

  getAllHotels: async (location = "") => {
    const key = normalizeKey(location);
    const cached = getCached(cacheByLocation, key);
    if (cached) return cached;

    const hotels = await hotelAPI.getAllHotels(location);
    const normalized = Array.isArray(hotels) ? hotels : [];

    setCached(cacheByLocation, key, normalized);
    cacheHotelsToIdMap(normalized);

    return normalized;
  },

  getHotelById: async (id) => {
    const key = normalizeKey(id);
    const cached = getCached(cacheById, key);
    if (cached) return cached;

    const hotel = await hotelAPI.getHotelById(id);
    if (hotel && typeof hotel === "object") {
      setCached(cacheById, key, hotel);
    }
    return hotel || null;
  },

  getFeaturedHotels: async () => {
    const hotels = await hotelsService.getHotelsSample({ limit: 300 });
    return hotels
      .filter((h) => safeNumber(h?.rating, 0) >= 4.7)
      .sort((a, b) => safeNumber(b?.rating, 0) - safeNumber(a?.rating, 0));
  },

  getPopularHotels: async () => {
    const hotels = await hotelsService.getHotelsSample({ limit: 400 });
    return [...hotels]
      .sort((a, b) => {
        const ratingDiff = safeNumber(b?.rating, 0) - safeNumber(a?.rating, 0);
        if (ratingDiff !== 0) return ratingDiff;
        return safeNumber(b?.reviews, 0) - safeNumber(a?.reviews, 0);
      })
      .slice(0, 6);
  },
};

export default hotelsService;
export { hotelsService };
