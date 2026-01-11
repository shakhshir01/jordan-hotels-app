import fs from 'fs';
import https from 'https';
import path from 'path';

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

console.log(`Loaded ${hotels.length} hotels. Starting real image fetch process...`);

// Function to fetch webpage content
function fetchWebpage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    }, (res) => {
      let htmlData = '';
      res.on('data', (chunk) => htmlData += chunk);
      res.on('end', () => resolve(htmlData));
    }).on('error', reject);
  });
}

// Function to search Google Images (Fallback)
function searchGoogleImages(hotelName, location) {
  const query = encodeURIComponent(`${hotelName} ${location} hotel exterior`);
  const url = `https://www.google.com/search?q=${query}&tbm=isch&source=hp`;

  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const images = [];
        // Regex to find image URLs in Google search results
        const imgMatches = data.match(/https:\/\/[^\"]*\.(?:jpg|jpeg|png|webp)/g);

        if (imgMatches) {
          const uniqueImages = [...new Set(imgMatches)]
            .filter(url => url.includes('http') && !url.includes('favicon') && !url.includes('gstatic') && !url.includes('icon'))
            .filter(url => url.length > 60) // Filter out thumbnails/icons
            .slice(0, 8);

          images.push(...uniqueImages);
        }
        resolve(images);
      });
    }).on('error', (err) => {
      resolve([]); // Resolve empty on error to continue
    });
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
  console.log(`\n--- Processing Batch: ${startIndex + 1} to ${endIndex} ---`);

  for (let i = startIndex; i < endIndex; i++) {
    const hotel = hotels[i];
    let realImages = [];

    // 1. CLEANUP: Remove any existing Unsplash images
    if (hotel.image && hotel.image.includes('unsplash.com')) hotel.image = '';
    if (hotel.images) {
      hotel.images = hotel.images.filter(url => !url.includes('unsplash.com'));
    }

    // 2. STRATEGY A: TripAdvisor
    if (hotel.tripadvisorUrl) {
      try {
        process.stdout.write(`[${i + 1}/${hotels.length}] ${hotel.name}: Checking TripAdvisor... `);
        const html = await fetchWebpage(hotel.tripadvisorUrl);
        realImages = extractImagesFromTripAdvisor(html, hotel.name);
      } catch (error) {
        process.stdout.write(`Failed (${error.message}). `);
      }
    }

    // 3. STRATEGY B: Google Images (Fallback if no images found)
    if (realImages.length === 0) {
      try {
        process.stdout.write(`Checking Google... `);
        // Add delay before Google request
        await new Promise(resolve => setTimeout(resolve, 1500));
        const googleImages = await searchGoogleImages(hotel.name, hotel.location);
        if (googleImages.length > 0) {
          realImages = googleImages;
        }
      } catch (error) {
        process.stdout.write(`Google failed. `);
      }
    }

    // 4. UPDATE HOTEL DATA
    if (realImages.length > 0) {
      // Keep existing non-unsplash images if any
      const existingImages = (hotel.images || []).filter(url => !url.includes('unsplash.com'));
      
      // Combine and deduplicate
      const allImages = [...new Set([...existingImages, ...realImages])];
      
      hotel.image = allImages[0];
      hotel.images = allImages;
      console.log(`✅ Found ${realImages.length} new images.`);
    } else {
      console.log(`❌ No images found.`);
    }

    // Respectful delay between hotels
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return endIndex;
}

// Helper to save progress
function saveProgress(currentHotels) {
  try {
    const updatedData = fileData.replace(
      /export const XOTELO_JORDAN_HOTELS = \[[\s\S]*?\];/,
      'export const XOTELO_JORDAN_HOTELS = ' + JSON.stringify(currentHotels, null, 2) + ';'
    );
    fs.writeFileSync('./src/services/xoteloJordanHotelsData.js', updatedData);
    console.log('💾 Data file updated successfully.');
  } catch (err) {
    console.error('Error saving file:', err.message);
  }
}

// Main processing function
async function updateAllHotelsWithRealImages() {
  const batchSize = 10; 
  let currentIndex = 0;
  const maxHotels = hotels.length; // Process ALL hotels

  while (currentIndex < maxHotels) {
    try {
      currentIndex = await processHotelsBatch(currentIndex, batchSize);
      saveProgress(hotels);
      
      // Delay between batches
      if (currentIndex < maxHotels) {
        console.log('Waiting 3 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      console.log(`❌ Critical Batch Error: ${error.message}`);
      // Save what we have so far
      saveProgress(hotels);
      // Wait a bit longer then try to continue
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  console.log('🎉 Finished processing ALL hotels!');
}

// Run the update
updateAllHotelsWithRealImages().catch(console.error);