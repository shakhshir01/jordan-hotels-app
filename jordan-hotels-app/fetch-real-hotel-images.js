import fs from 'fs';
import https from 'https';

// Read the Xotelo data
const fileData = fs.readFileSync('./src/services/xoteloJordanHotelsData.js', 'utf8');
const startIndex = fileData.indexOf('export const XOTELO_JORDAN_HOTELS = [');
const endIndex = fileData.lastIndexOf('];') + 2;
const hotelsJson = fileData.substring(startIndex + 'export const XOTELO_JORDAN_HOTELS = '.length, endIndex - 2);

let hotels;
try {
  hotels = JSON.parse(hotelsJson);
} catch (e) {
  const evalCode = fileData.substring(startIndex, endIndex);
  const tempFunc = new Function('return ' + evalCode.replace('export const XOTELO_JORDAN_HOTELS = ', ''));
  hotels = tempFunc();
}

console.log(`Processing ${hotels.length} hotels for real images...`);

// Function to fetch webpage content
function fetchWebpage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      let htmlData = '';
      res.on('data', (chunk) => htmlData += chunk);
      res.on('end', () => resolve(htmlData));
    }).on('error', reject);
  });
}

// Function to extract image URLs from TripAdvisor HTML
function extractImagesFromTripAdvisor(html, hotelName) {
  const images = [];

  // Look for image URLs in the HTML
  // TripAdvisor uses various patterns for images
  const patterns = [
    /"url":"([^"]*\.jpg[^"]*)"/g,
    /"photoUrl":"([^"]*\.jpg[^"]*)"/g,
    /"originalUrl":"([^"]*\.jpg[^"]*)"/g,
    /https:\/\/media\.cdn\.tripadvisor\.com\/media\/photo-[^"]*\.jpg/g,
    /https:\/\/dynamic-media\.cdn\.tripadvisor\.com\/media\/photo-[^"]*\.jpg/g,
    /https:\/\/images\.tripadvisor\.com\/media\/photo-[^"]*\.jpg/g
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1] || match[0];
      // Clean up the URL
      url = url.replace(/\\u0026/g, '&').replace(/\\u002F/g, '/');
      // Convert to higher quality if possible
      url = url.replace(/w=\d+/, 'w=1200').replace(/h=\d+/, 'h=800');
      if (!images.includes(url) && url.includes('.jpg')) {
        images.push(url);
      }
    }
  });

  // Also try to find images in script tags
  const scriptMatches = html.match(/<script[^>]*>[\s\S]*?<\/script>/g);
  if (scriptMatches) {
    scriptMatches.forEach(script => {
      const imgMatches = script.match(/"[^"]*\.jpg[^"]*"/g);
      if (imgMatches) {
        imgMatches.forEach(match => {
          let url = match.slice(1, -1);
          url = url.replace(/\\u0026/g, '&').replace(/\\u002F/g, '/');
          url = url.replace(/w=\d+/, 'w=1200').replace(/h=\d+/, 'h=800');
          if (!images.includes(url) && url.includes('.jpg') && url.includes('tripadvisor.com')) {
            images.push(url);
          }
        });
      }
    });
  }

  // Remove duplicates and limit to 15 images
  const uniqueImages = [...new Set(images)].slice(0, 15);

  console.log(`Found ${uniqueImages.length} images for ${hotelName}`);
  return uniqueImages;
}

// Process hotels in batches
async function processHotelsBatch(startIndex, batchSize) {
  const endIndex = Math.min(startIndex + batchSize, hotels.length);
  console.log(`Processing hotels ${startIndex + 1} to ${endIndex}...`);

  for (let i = startIndex; i < endIndex; i++) {
    const hotel = hotels[i];

    if (hotel.tripadvisorUrl) {
      try {
        console.log(`Fetching images for: ${hotel.name}`);
        const html = await fetchWebpage(hotel.tripadvisorUrl);

        // Add delay to be respectful to TripAdvisor
        await new Promise(resolve => setTimeout(resolve, 1000));

        const realImages = extractImagesFromTripAdvisor(html, hotel.name);

        if (realImages.length > 0) {
          // Update the hotel with real images
          hotel.image = realImages[0]; // Main image
          hotel.images = realImages; // Gallery images
          console.log(`✅ Updated ${hotel.name} with ${realImages.length} real images`);
        } else {
          console.log(`❌ No images found for ${hotel.name}`);
        }

      } catch (error) {
        console.log(`❌ Error fetching ${hotel.name}: ${error.message}`);
      }
    } else {
      console.log(`⚠️ No TripAdvisor URL for ${hotel.name}`);
    }

    // Progress indicator
    if ((i - startIndex + 1) % 10 === 0) {
      console.log(`Progress: ${i - startIndex + 1}/${endIndex - startIndex} hotels processed`);
    }
  }

  return endIndex;
}

// Main processing function
async function updateAllHotelsWithRealImages() {
  const batchSize = 5; // Start with just 5 hotels for testing
  let currentIndex = 0;

  // Only process first 10 hotels for testing
  const maxHotels = Math.min(10, hotels.length);

  while (currentIndex < maxHotels) {
    try {
      currentIndex = await processHotelsBatch(currentIndex, batchSize);

      // Save progress after each batch
      const updatedData = fileData.replace(
        /export const XOTELO_JORDAN_HOTELS = \[[\s\S]*?\];/,
        'export const XOTELO_JORDAN_HOTELS = ' + JSON.stringify(hotels, null, 2) + ';'
      );

      fs.writeFileSync('C:\\Users\\khale\\Desktop\\VisitJo\\jordan-hotels-app\\src\\services\\xoteloJordanHotelsData.js', updatedData);
      console.log(`💾 Progress saved after processing ${currentIndex} hotels`);

      // Add delay between batches to avoid being blocked
      if (currentIndex < maxHotels) {
        console.log('Waiting 5 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 5000));
      }

    } catch (error) {
      console.log(`❌ Error in batch processing: ${error.message}`);
      break;
    }
  }

  console.log('🎉 Finished processing test batch!');
}

// Run the update
updateAllHotelsWithRealImages().catch(console.error);