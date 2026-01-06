import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const repoRoot = path.resolve(__dirname, "..");
const realHotelsPath = path.resolve(repoRoot, "src", "services", "realHotelsData.js");
const seedHotelsPath = path.resolve(repoRoot, "lambda", "hotels-data.json");
const outPath = path.resolve(repoRoot, "HOTEL_IMAGE_PICKLIST.md");

const toArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const normalizeUrl = (value) => {
  if (typeof value !== "string") return "";
  const url = value.trim();
  if (!url) return "";
  // Drop obviously-bad URLs (spaces, missing scheme, etc.)
  if (/\s/.test(url)) return "";
  if (!/^https?:\/\//i.test(url)) return "";
  return url;
};

const collectImages = (hotel) => {
  const urls = [];
  {
    const normalized = normalizeUrl(hotel.image);
    if (normalized) urls.push(normalized);
  }
  for (const u of toArray(hotel.images)) {
    const normalized = normalizeUrl(u);
    if (normalized) urls.push(normalized);
  }
  return Array.from(new Set(urls));
};

const loadRealHotels = async () => {
  const mod = await import(pathToFileURL(realHotelsPath).href);
  const api = mod?.default || mod?.realHotelsAPI;
  if (!api?.getAllHotels) throw new Error("Could not load realHotelsAPI from realHotelsData.js");
  const hotels = await api.getAllHotels("");
  return Array.isArray(hotels) ? hotels : [];
};

const loadSeedHotels = () => {
  const json = JSON.parse(fs.readFileSync(seedHotelsPath, "utf8"));
  return Array.isArray(json) ? json : [];
};

const main = async () => {
  const [realHotels, seedHotels] = await Promise.all([loadRealHotels(), Promise.resolve(loadSeedHotels())]);

  // Build a global unique URL registry so we can reference images by number.
  const urlToNum = new Map();
  const urls = [];
  const addUrl = (url) => {
    if (!urlToNum.has(url)) {
      urls.push(url);
      urlToNum.set(url, urls.length);
    }
  };

  const allHotels = [
    ...realHotels.map((h) => ({ source: "realHotelsData", id: h.id, name: h.name, location: h.location || h.destination || "", raw: h })),
    ...seedHotels.map((h) => ({ source: "seed/hotels-data.json", id: h.id, name: h.name, location: h.city || h.location || "", raw: h })),
  ];

  for (const h of allHotels) {
    for (const url of collectImages(h.raw)) addUrl(url);
  }

  const lines = [];
  lines.push("# Hotel Image Pick List");
  lines.push("");
  lines.push("This file lists **every unique image URL** found in the repo’s hotel datasets, and shows which image numbers are currently associated with each hotel.");
  lines.push("");
  lines.push("How to use:");
  lines.push("- Pick images by **number** from the Global Image Library below.");
  lines.push("- Tell me your desired mapping like:");
  lines.push("  - `h-dead-sea-marriott: primary #12, gallery #12 #35 #36` ");
  lines.push("  - `h16 (Kempinski Hotel Ishtar Dead Sea): primary #88` ");
  lines.push("");

  lines.push("## Global Image Library (numbered)");
  lines.push("");
  urls.forEach((u, idx) => {
    lines.push(`${idx + 1}. ${u}`);
  });

  const renderHotelSection = (title, sourceKey, hotels) => {
    lines.push("");
    lines.push(`## ${title}`);
    lines.push("");

    const sorted = [...hotels].sort((a, b) => String(a.name).localeCompare(String(b.name)));
    for (const h of sorted) {
      const imageUrls = collectImages(h.raw);
      const nums = imageUrls.map((u) => urlToNum.get(u)).filter(Boolean);
      const primary = typeof h.raw.image === "string" && h.raw.image.trim() ? urlToNum.get(h.raw.image.trim()) : (nums[0] || "");

      lines.push(`### ${h.name}`);
      lines.push("");
      lines.push(`- Source: ${sourceKey}`);
      lines.push(`- Id: ${h.id}`);
      if (h.location) lines.push(`- Location: ${h.location}`);
      lines.push(`- Current primary image: ${primary ? `#${primary}` : "(none)"}`);
      lines.push(`- Images for this hotel: ${nums.length ? nums.map((n) => `#${n}`).join(" ") : "(none)"}`);
      lines.push("");
    }
  };

  renderHotelSection("Hotels (Frontend: realHotelsData.js)", "realHotelsData", allHotels.filter((h) => h.source === "realHotelsData"));
  renderHotelSection("Hotels (Backend seed: lambda/hotels-data.json)", "seed/hotels-data.json", allHotels.filter((h) => h.source === "seed/hotels-data.json"));

  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(`Unique images: ${urls.length}`);
  console.log(`Real hotels: ${realHotels.length}, Seed hotels: ${seedHotels.length}`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
