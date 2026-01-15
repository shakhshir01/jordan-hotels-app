/*
Generates responsive images for hotels using Pexels API (watermark-free) and writes a client-side image manifest.
Limit: processes first 200 images to avoid long runs; adjust MAX_IMAGES.
Set PEXELS_API_KEY environment variable.
Usage: node scripts/generate-hotel-images.js
*/

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const sharp = require('sharp');

const DATA_FILE = path.resolve(__dirname, '..', 'src', 'services', 'xoteloJordanHotelsData.js');
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'static', 'hotels');
const MANIFEST_OUT = path.resolve(__dirname, '..', 'public', 'image-manifest.js');

const SIZES = [320, 640, 1024];
const FORMATS = ['avif', 'webp', 'jpg'];
const MAX_IMAGES = parseInt(process.env.MAX_IMAGES, 10) || 200; // change with env var MAX_IMAGES
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
  console.error('Please set PEXELS_API_KEY environment variable. Get a free key from https://www.pexels.com/api/');
  process.exit(1);
}

if (!fs.existsSync(DATA_FILE)) {
  console.error('Data file not found:', DATA_FILE);
  process.exit(1);
}

const raw = fs.readFileSync(DATA_FILE, 'utf8');
const start = raw.indexOf('export const XOTELO_JORDAN_HOTELS = ');
if (start === -1) {
  console.error('Could not locate exported hotels array in data file');
  process.exit(1);
}
const arrStart = raw.indexOf('[', start);
const arrEnd = raw.lastIndexOf('];');
const arrayText = raw.substring(arrStart, arrEnd + 1);

let hotels;
try {
  hotels = JSON.parse(arrayText);
} catch (err) {
  try {
    // fallback: evaluate as JS
    const fn = new Function('return ' + arrayText);
    hotels = fn();
  } catch (err2) {
    console.error('Failed to parse hotels array:', err2.message);
    process.exit(1);
  }
}

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const manifest = {};
let processed = 0;

async function downloadBuffer(url) {
  try {
    const res = await fetch(url, { timeout: 20000 });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.buffer();
  } catch (err) {
    return null;
  }
}

async function fetchPexelsImages(query) {
  try {
    const searchQuery = `${query} hotel Jordan`;
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=50`;
    const res = await fetch(url, {
      headers: { Authorization: PEXELS_API_KEY }
    });
    if (!res.ok) throw new Error(`Pexels API error: ${res.status}`);
    const data = await res.json();
    return data.photos.map(photo => photo.src.large);
  } catch (err) {
    console.warn('Failed to fetch from Pexels for', query, err.message);
    return [];
  }
}

(async () => {
  for (const hotel of hotels) {
    const hotelId = hotel.id || hotel.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const images = await fetchPexelsImages(hotel.name);
    if (!images.length) continue;
    const hotelDir = path.join(OUT_DIR, hotelId);
    if (!fs.existsSync(hotelDir)) fs.mkdirSync(hotelDir, { recursive: true });

    manifest[hotelId] = manifest[hotelId] || { images: [] };

    for (let i = 0; i < images.length; i++) {
      if (processed >= MAX_IMAGES) break;
      const imageUrl = images[i];
      const baseName = `img-${i}`;
      const entry = { original: imageUrl, variants: {} };

      console.log(`Downloading ${imageUrl}`);
      const buf = await downloadBuffer(imageUrl);
      if (!buf) {
        console.warn('Failed to download', imageUrl);
        continue;
      }

      for (const size of SIZES) {
        for (const fmt of FORMATS) {
          const outName = `${baseName}-${size}.${fmt}`;
          const outPath = path.join(hotelDir, outName);
          try {
            let img = sharp(buf).resize({ width: size, withoutEnlargement: true });
            if (fmt === 'webp') img = img.webp({ quality: 80 });
            else if (fmt === 'avif') img = img.avif({ quality: 60 });
            else img = img.jpeg({ quality: 80 });
            await img.toFile(outPath);
            entry.variants[fmt] = entry.variants[fmt] || [];
            entry.variants[fmt].push(`/static/hotels/${hotelId}/${outName}`);
          } catch (err) {
            console.warn('Failed to process', imageUrl, fmt, size, err.message);
          }
        }
      }

      manifest[hotelId].images.push(entry);
      processed++;
    }

    // Delay to respect API rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (processed >= MAX_IMAGES) break;
  }

  // write manifest to public as a small JS file that assigns window.__IMAGE_MANIFEST__
  const manifestJs = `window.__IMAGE_MANIFEST__ = ${JSON.stringify(manifest, null, 2)};`;
  fs.writeFileSync(MANIFEST_OUT, manifestJs, 'utf8');

  console.log('Done. Manifest written to', MANIFEST_OUT);
})();
