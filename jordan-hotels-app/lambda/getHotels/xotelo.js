const DEFAULT_LOCATION_KEY = "g293985"; // Jordan (country-level) in Xotelo

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const parsePlaceFromTripAdvisorUrl = (url) => {
  if (typeof url !== "string") return "";
  const lastDash = url.lastIndexOf("-");
  if (lastDash === -1) return "";
  const tail = url.slice(lastDash + 1);
  const htmlCut = tail.split(".html")[0] || tail;
  const cleaned = htmlCut
    .replace(/_Governorate$/i, "")
    .replace(/_Region$/i, "")
    .replace(/_District$/i, "")
    .replace(/_Province$/i, "");
  return cleaned.replace(/_/g, " ").trim();
};

const inferDestination = (place) => {
  const p = String(place || "").toLowerCase();
  if (!p) return "Jordan";
  if (p.includes("amman")) return "Amman";
  if (p.includes("aqaba") || p.includes("al aqabah")) return "Aqaba";
  if (p.includes("wadi rum")) return "Wadi Rum";
  if (p.includes("petra") || p.includes("wadi musa")) return "Petra";
  if (p.includes("dead sea") || p.includes("sweimah") || p.includes("swemeh") || p.includes("swaimeh")) return "Dead Sea";
  if (p.includes("jerash")) return "Jerash";
  if (p.includes("madaba")) return "Madaba";
  if (p.includes("irbid")) return "Irbid";
  if (p.includes("ajloun") || p.includes("ajlun")) return "Ajloun";
  if (p.includes("karak") || p.includes("kerak")) return "Karak";
  return place || "Jordan";
};

const mapXoteloHotel = (item, createdAt = new Date().toISOString()) => {
  const name = String(item?.name || "").trim();
  const key = String(item?.key || "").trim();
  const url = String(item?.url || "").trim();
  const place = parsePlaceFromTripAdvisorUrl(url);
  const destination = inferDestination(place);
  const rating = toNum(item?.review_summary?.rating);
  const reviews = toNum(item?.review_summary?.count);
  const min = item?.price_ranges?.minimum;
  const price = min == null ? 0 : toNum(min);
  const image = typeof item?.image === "string" ? item.image.trim() : "";
  const address = String(item?.address || "").trim();
  const latitude = toNum(item?.latitude);
  const longitude = toNum(item?.longitude);

  return {
    id: key,
    name,
    destination,
    rating,
    reviews,
    price,
    image,
    address,
    latitude,
    longitude,
    url,
    createdAt,
    updatedAt: createdAt,
  };
};

const fetchXoteloHotels = async ({ locationKey = DEFAULT_LOCATION_KEY, limit = 200 } = {}) => {
  const url = `https://data.xotelo.com/api/list?location_key=${encodeURIComponent(locationKey)}&limit=${encodeURIComponent(limit)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Xotelo API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Xotelo API returned non-array data");
  }
  return data.map(mapXoteloHotel);
};

module.exports = { mapXoteloHotel, fetchXoteloHotels };