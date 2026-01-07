const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const haversineKm = (aLat, aLon, bLat, bLon) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
};

export const getHotelCoordinates = (hotel) => {
  if (!hotel || typeof hotel !== "object") return null;

  const geo = hotel.geo && typeof hotel.geo === "object" ? hotel.geo : null;
  const candidates = [
    { lat: geo?.lat, lon: geo?.lon },
    { lat: geo?.latitude, lon: geo?.longitude },
    { lat: hotel?.lat, lon: hotel?.lon },
    { lat: hotel?.latitude, lon: hotel?.longitude },
  ];

  for (const c of candidates) {
    const lat = toNum(c?.lat);
    const lon = toNum(c?.lon);
    if (lat == null || lon == null) continue;
    if (lat === 0 && lon === 0) continue;
    return { lat, lon };
  }
  return null;
};

export const sortHotelsByDistance = (hotels, userLat, userLon) => {
  const out = [];
  for (const h of Array.isArray(hotels) ? hotels : []) {
    const coords = getHotelCoordinates(h);
    if (!coords) continue;
    const distKm = haversineKm(userLat, userLon, coords.lat, coords.lon);
    out.push({ hotel: h, distKm });
  }

  out.sort((a, b) => {
    const d = a.distKm - b.distKm;
    if (d !== 0) return d;
    return (b.hotel?.rating || 0) - (a.hotel?.rating || 0);
  });

  return out;
};
