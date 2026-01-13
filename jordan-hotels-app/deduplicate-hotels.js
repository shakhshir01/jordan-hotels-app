import fs from 'fs';
import { XOTELO_JORDAN_HOTELS } from './src/services/xoteloJordanHotelsData.js';

const hotels = XOTELO_JORDAN_HOTELS;

// Remove duplicates based on 'name' (normalized: trimmed, lowercase, extra spaces removed)
const seenNames = new Set();
const uniqueHotels = hotels.filter(hotel => {
  const normalizedName = hotel.name.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '');
  if (seenNames.has(normalizedName)) {
    return false;
  }
  seenNames.add(normalizedName);
  return true;
});

const content = `export const XOTELO_JORDAN_HOTELS = ${JSON.stringify(uniqueHotels, null, 2)};

export default XOTELO_JORDAN_HOTELS;
`;

fs.writeFile('./src/services/xoteloJordanHotelsData.js', content, 'utf8', (err) => {
  if (err) {
    console.error('Error writing file:', err);
    return;
  }
  console.log(`Deduplicated hotels. Original count: ${hotels.length}, New count: ${uniqueHotels.length}`);
});
