// Deduplicate destination images from all sources
// Usage: node scripts/deduplicate-destination-images.js

const fs = require('fs');

const sources = [
  'src/data/destination-images.json',
  'destination-images.json',
  'jordan-hotels-app/destination-images.json'
];

const allImages = {};

for (const src of sources) {
  try {
    const data = fs.readFileSync(src, 'utf8');
    const obj = JSON.parse(data);
    for (const [key, url] of Object.entries(obj)) {
      if (!allImages[key] || allImages[key] === url) {
        allImages[key] = url;
      }
    }
  } catch (e) {
    // Ignore missing files
  }
}

// Remove duplicate URLs (keep first occurrence)
const urlSet = new Set();
for (const key of Object.keys(allImages)) {
  if (urlSet.has(allImages[key])) {
    delete allImages[key];
  } else {
    urlSet.add(allImages[key]);
  }
}

fs.writeFileSync('deduplicated-destination-images.json', JSON.stringify(allImages, null, 2));
console.log('Done! Deduplicated images saved to deduplicated-destination-images.json');

node ./jordan-hotels-app/scripts/seed-destinations.mjs
