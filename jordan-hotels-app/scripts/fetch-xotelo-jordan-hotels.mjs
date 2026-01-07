import fs from "node:fs/promises";
import path from "node:path";

const LOCATION_KEY = process.env.LOCATION_KEY || "g293985"; // appears to be Jordan (country-level) in Xotelo
const LIMIT = Number(process.env.LIMIT || 100);
const SORT = process.env.SORT || "best_value";
const SLEEP_MS = Number(process.env.SLEEP_MS || 180);

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
  return place;
};

const mapXoteloHotel = (item) => {
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

  return {
    id: key || `xotelo-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: name || "Jordan stay",
    nameAr: "",
    location: destination,
    destination,
    price,
    currency: "JOD",
    rating,
    reviews,
    image,
    images: image ? [image] : [],
    description: "",
    address: "",
    phone: "",
    email: "",
    amenities: ["WiFi"],
    rooms: 0,
    checkIn: "15:00",
    checkOut: "11:00",
    bedTypes: ["Standard"],

    // extra metadata (not required by UI)
    source: "xotelo",
    tripadvisorUrl: url,
    accommodationType: item?.accommodation_type || "",
    mentions: Array.isArray(item?.mentions) ? item.mentions : [],
    merchandisingLabels: Array.isArray(item?.merchandising_labels) ? item.merchandising_labels : [],
    geo: item?.geo || null,
    priceRanges: item?.price_ranges || null,
  };
};

const fetchPage = async (offset) => {
  const url = `https://data.xotelo.com/api/list?location_key=${encodeURIComponent(LOCATION_KEY)}&limit=${LIMIT}&offset=${offset}&sort=${encodeURIComponent(SORT)}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const json = await res.json();
  if (json?.error) {
    const msg = json?.error?.message || JSON.stringify(json.error);
    throw new Error(`Xotelo error for offset=${offset}: ${msg}`);
  }
  return json?.result;
};

const main = async () => {
  const all = [];
  let total = Infinity;
  let offset = 0;

  while (offset < total) {
    const result = await fetchPage(offset);
    const list = Array.isArray(result?.list) ? result.list : [];
    total = toNum(result?.total_count);

    all.push(...list);
    offset += LIMIT;

    process.stdout.write(`Fetched ${Math.min(offset, total)}/${total}...\n`);
    if (offset < total) await sleep(SLEEP_MS);
  }

  // Dedupe by key
  const byKey = new Map();
  for (const it of all) {
    const key = String(it?.key || "").trim();
    if (!key) continue;
    if (!byKey.has(key)) byKey.set(key, it);
  }

  const hotels = Array.from(byKey.values()).map(mapXoteloHotel);

  const outFile = path.resolve("src/services/xoteloJordanHotelsData.js");
  const banner = `/* eslint-disable */\n// GENERATED FILE — do not edit by hand\n// Source: https://data.xotelo.com/api/list?location_key=${LOCATION_KEY}\n// Generated at: ${new Date().toISOString()}\n\n`;
  const body = `export const XOTELO_JORDAN_HOTELS = ${JSON.stringify(hotels, null, 2)};\n\nexport default XOTELO_JORDAN_HOTELS;\n`;

  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, banner + body, "utf8");

  console.log(`\nWrote ${hotels.length} hotels to ${outFile}`);
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
