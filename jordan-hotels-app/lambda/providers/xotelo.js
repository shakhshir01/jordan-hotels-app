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

export const mapXoteloHotel = (item, createdAt = new Date().toISOString()) => {
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
  const geo = item?.geo && typeof item.geo === "object" ? item.geo : null;

  return {
    id: key || `xotelo-${(name || "jordan-stay").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: name || "Jordan stay",
    location: destination,
    destination,
    price,
    currency: "USD",
    rating,
    reviews,
    image,
    images: image ? [image] : [],
    description: "",
    createdAt,
    source: "xotelo",
    tripadvisorUrl: url,
    accommodationType: String(item?.accommodation_type || ""),
    mentions: Array.isArray(item?.mentions) ? item.mentions : [],
    merchandisingLabels: Array.isArray(item?.merchandising_labels) ? item.merchandising_labels : [],
    geo,
    priceRanges: item?.price_ranges || null,
  };
};

export async function fetchXoteloListPage({
  locationKey = DEFAULT_LOCATION_KEY,
  limit = 100,
  offset = 0,
  sort = "best_value",
}) {
  const url = `https://data.xotelo.com/api/list?location_key=${encodeURIComponent(locationKey)}&limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}&sort=${encodeURIComponent(sort)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "VISIT-JO/1.0 (+https://VISIT-JO.com)",
      "Accept": "application/json",
    },
  });

  const json = await res.json();
  if (json?.error) {
    const msg = json?.error?.message || JSON.stringify(json.error);
    throw new Error(`Xotelo error: ${msg}`);
  }

  const result = json?.result;
  const list = Array.isArray(result?.list) ? result.list : [];
  const totalCount = toNum(result?.total_count);

  return { list, totalCount, limit: toNum(result?.limit) || limit, offset: toNum(result?.offset) || offset };
}

export async function fetchXoteloHotels({
  locationKey = DEFAULT_LOCATION_KEY,
  limit = 100,
  sort = "best_value",
  maxHotels = 2500,
  sleepMs = 180,
}) {
  const createdAt = new Date().toISOString();
  const all = [];
  let totalCount = Infinity;
  let offset = 0;

  while (offset < totalCount) {
    const page = await fetchXoteloListPage({ locationKey, limit, offset, sort });
    totalCount = page.totalCount || totalCount;

    all.push(...page.list);
    offset += limit;

    if (Number.isFinite(maxHotels) && maxHotels > 0 && all.length >= maxHotels) break;
    if (offset < totalCount && sleepMs > 0) await sleep(sleepMs);
  }

  const byKey = new Map();
  for (const it of all) {
    const key = String(it?.key || "").trim();
    if (!key) continue;
    if (!byKey.has(key)) byKey.set(key, it);
  }

  const raw = Array.from(byKey.values());
  const sliced = Number.isFinite(maxHotels) && maxHotels > 0 ? raw.slice(0, maxHotels) : raw;
  return sliced.map((it) => mapXoteloHotel(it, createdAt));
}
