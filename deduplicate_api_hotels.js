import fs from 'fs';

const filePath = 'jordan-hotels-app/api_hotels_bjd.json';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    const jsonData = JSON.parse(data);
    const hotels = jsonData.hotels;

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

    jsonData.hotels = uniqueHotels;

    fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return;
      }
      console.log(`Deduplicated hotels. Original count: ${hotels.length}, New count: ${uniqueHotels.length}`);
    });
  } catch (parseErr) {
    console.error('Error parsing JSON:', parseErr);
  }
});