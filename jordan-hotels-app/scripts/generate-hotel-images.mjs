/*
Generates responsive images for hotels (Pexels integration disabled).
This script now runs without fetching external images.
Usage: node scripts/generate-hotel-images.mjs
*/

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.resolve(__dirname, '..', 'src', 'services', 'xoteloJordanHotelsData.js');
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'static', 'hotels');
const MANIFEST_OUT = path.resolve(__dirname, '..', 'public', 'image-manifest.js');

const SIZES = [320, 640, 1024];
const FORMATS = ['avif', 'webp', 'jpg'];
const MAX_IMAGES = parseInt(process.env.MAX_IMAGES, 10) || 200; // change with env var MAX_IMAGES
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || 'disabled';

if (!PEXELS_API_KEY || PEXELS_API_KEY === 'disabled') {
  console.log('Pexels API integration is disabled. Script will run without fetching external images.');
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
    return await res.arrayBuffer().then(buf => Buffer.from(buf));
  } catch (err) {
    return null;
  }
}

async function fetchPexelsImages(query) {
  // Disabled: No longer fetching from Pexels
  console.log(`Skipping image fetch for ${query} - Pexels integration disabled`);
  return [];
}

(async () => {
  for (const hotel of hotels) {
    const hotelId = hotel.id || (hotel.name || 'hotel').replace(/[^a-z0-9]/gi, '_').toLowerCase();
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

  const manifestJs = `window.__IMAGE_MANIFEST__ = ${JSON.stringify(manifest, null, 2)};`;
  fs.writeFileSync(MANIFEST_OUT, manifestJs, 'utf8');

  console.log('Done. Manifest written to', MANIFEST_OUT);
})();
