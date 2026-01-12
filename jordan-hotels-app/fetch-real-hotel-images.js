 import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

// Robust path handling
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.join(__dirname, 'src', 'services', 'xoteloJordanHotelsData.js');

// Read the Xotelo data safely
const fileData = fs.readFileSync(dataFilePath, 'utf8');
const startIndex = fileData.indexOf('export const XOTELO_JORDAN_HOTELS = [');
const hotelsJson = fileData.substring(startIndex + 'export const XOTELO_JORDAN_HOTELS = '.length).replace(/;\s*export default.*$/s, '').replace(/;$/, '');

let hotels;
try {
  hotels = JSON.parse(hotelsJson);
} catch (e) {
  const evalCode = fileData.substring(startIndex);
  const tempFunc = new Function('return ' + evalCode.replace('export const XOTELO_JORDAN_HOTELS = ', ''));
  hotels = tempFunc();
}

// Function to reset hotel images
function resetHotelImages(hotels) {
  hotels.forEach(hotel => {
    hotel.image = '';
    hotel.images = [];
  });
  saveProgress(hotels);
  console.log('Images reset for all hotels.');
}

console.log(`Loaded ${hotels.length} hotels. Starting real image fetch process...`);

// Reset images before fetching new ones
// resetHotelImages(hotels);

// Function to validate image URL
function validateImageUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

// Function to validate an array of image URLs (with concurrency limit)
async function validateImageUrls(urls) {
  const validUrls = [];
  const concurrencyLimit = 5; // Process 5 URLs at a time instead of 1

  for (let i = 0; i < urls.length; i += concurrencyLimit) {
    const batch = urls.slice(i, i + concurrencyLimit);
    const promises = batch.map(async (url) => {
      try {
        const isValid = await validateImageUrl(url);
        if (isValid) {
          return url;
        } else {
          console.log(`❌ Invalid URL: ${url}`);
          return null;
        }
      } catch (error) {
        console.log(`❌ Error validating URL ${url}: ${error.message}`);
        return null;
      }
    });

    const results = await Promise.all(promises);
    validUrls.push(...results.filter(url => url !== null));
  }

  return validUrls;
}
function fetchWebpage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
    }, (res) => {
      let htmlData = '';
      res.on('data', (chunk) => htmlData += chunk);
      res.on('end', () => resolve(htmlData));
    }).on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Image Quality & Enhancement Utilities
function isHighQualityImage(url) {
  if (!url) return false;
  const lower = url.toLowerCase();
  
  // Filter out common junk
  const junkTerms = [
    'avatar', 'icon', 'logo', 'map', 'sprite', 'blank', 'spacer', 'user_image', 'pixel',
    'floorplan', 'floor_plan', 'layout', 'brochure', 'menu', 'qrcode', 'barcode',
    'banner', 'promo', 'offer', 'advert', 'tripadvisor_logo', 'ta_logo', 'overlay',
    'review', 'rating', 'stars', 'thumb', 'thumbnail', 'tiny', 'small', 'widget'
  ];
  if (junkTerms.some(term => lower.includes(term))) return false;
  
  // Filter out known low-res patterns
  if (lower.includes('w=50') || lower.includes('w=100')) return false;
  
  // Filter out dimensions in filenames that look small (e.g. 100x100, 320x240)
  // Matches patterns like: image_100x100.jpg, photo-320x240.png
  if (lower.match(/[-_](?:50|60|80|100|120|140|150|160|180|200|240|300|320)x(?:50|60|80|100|120|140|150|160|180|200|240|300|320)\./)) return false;
  
  return true;
}

function enhanceImageUrl(url) {
  if (!url) return url;
  
  // TripAdvisor: Force high resolution
  if (url.includes('tripadvisor.com') && url.includes('/media/photo-')) {
    let enhanced = url;
    // Try to upgrade small/thumbnail paths (photo-s, photo-t, photo-l) to original (photo-o)
    enhanced = enhanced.replace(/\/media\/photo-[stml]\//, '/media/photo-o/');
    
    const base = enhanced.split('?')[0];
    // Add high-res params (w=1200 is standard HD for TA)
    return `${base}?w=1200&h=-1&s=1`;
  }
  
  return url;
}

// Function to search Bing Images (More reliable fallback)
function searchBingImages(hotelName, location) {
  const query = encodeURIComponent(`${hotelName} ${location} hotel exterior`);
  const url = `https://www.bing.com/images/search?q=${query}&first=1`;

  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const images = [];
        // Bing embeds high-res URLs in 'murl' property within 'iusc' attribute
        // Pattern: murl&quot;:&quot;https://...&quot;
        const murlRegex = /murl&quot;:&quot;(https:\/\/.*?)&quot;/g;
        let match;

        while ((match = murlRegex.exec(data)) !== null) {
          const imgUrl = match[1];
          if (imgUrl.match(/\.(jpg|jpeg|png|webp)(\?|$)/i) && !imgUrl.includes('bing.com/th') && isHighQualityImage(imgUrl)) {
            images.push(imgUrl);
          }
        }

        // Fallback: look for direct src attributes if murl fails
        if (images.length === 0) {
          const srcRegex = /src="(https:\/\/[^"]+\.(jpg|jpeg|png))"/g;
          while ((match = srcRegex.exec(data)) !== null) {
            if (!match[1].includes('base64') && isHighQualityImage(match[1])) images.push(match[1]);
          }
        }

        resolve([...new Set(images)].slice(0, 50));
      });
    }).on('error', (err) => {
      resolve([]); // Resolve empty on error to continue
    });
    req.setTimeout(10000, () => {
      req.destroy();
      resolve([]);
    });
  });
}

// Function to search Google Images
function searchGoogleImages(hotelName, location) {
  const query = encodeURIComponent(`${hotelName} ${location} hotel exterior`);
  const url = `https://www.google.com/search?q=${query}&tbm=isch&source=hp`;

  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const images = [];

        // Google Images embeds URLs in various ways
        // Look for data-src or src attributes in img tags
        const imgRegex = /<img[^>]+(?:data-src|src)="([^"]+)"/g;
        let match;

        while ((match = imgRegex.exec(data)) !== null) {
          const imgUrl = match[1];
          // Skip base64, data URLs, and Google-specific URLs
          if (imgUrl.startsWith('http') &&
              !imgUrl.includes('data:') &&
              !imgUrl.includes('googleusercontent.com') &&
              !imgUrl.includes('gstatic.com') &&
              imgUrl.match(/\.(jpg|jpeg|png|webp)(\?|$)/i) &&
              isHighQualityImage(imgUrl)) {
            images.push(imgUrl);
          }
        }

        // Also look for URLs in script tags (Google sometimes embeds them there)
        const scriptMatches = data.match(/\[.*?"ou":"([^"]+)".*?\]/g);
        if (scriptMatches) {
          scriptMatches.forEach(script => {
            try {
              const parsed = JSON.parse(script);
              if (parsed && parsed.ou && isHighQualityImage(parsed.ou)) {
                images.push(parsed.ou);
              }
            } catch (e) {
              // Ignore parsing errors
            }
          });
        }

        resolve([...new Set(images)].slice(0, 50));
      });
    }).on('error', (err) => {
      resolve([]); // Resolve empty on error to continue
    });
    req.setTimeout(10000, () => {
      req.destroy();
      resolve([]);
    });
  });
}

// Function to extract image URLs from TripAdvisor HTML
function extractImagesFromTripAdvisor(html, hotelName) {
  const images = [];

  // Aggressive regex to find any TripAdvisor media URL
  // Matches: https://...tripadvisor.com/media/photo-...
  const regex = /(https:\/\/[a-zA-Z0-9-]+\.tripadvisor\.com\/media\/photo-[^"'\s\\]+)/g;

  let match;
  while ((match = regex.exec(html)) !== null) {
    let url = match[1];
    // Clean up URL: remove escape chars and force high resolution
    url = url.replace(/\\u002F/g, '/');
    
    // Enhance and Validate
    url = enhanceImageUrl(url);
    if (!images.includes(url) && (url.includes('.jpg') || url.includes('.png')) && isHighQualityImage(url)) {
      images.push(url);
    }
  }

  // Also try to find images in script tags
  const scriptMatches = html.match(/<script[^>]*>[\s\S]*?<\/script>/g);
  if (scriptMatches) {
    scriptMatches.forEach(script => {
      const imgMatches = script.match(/"[^"]*\.jpg[^"]*"/g);
      if (imgMatches) {
        imgMatches.forEach(match => {
          let url = match.slice(1, -1);
          url = url.replace(/\\u0026/g, '&').replace(/\\u002F/g, '/');
          
          url = enhanceImageUrl(url);
          if (!images.includes(url) && url.includes('.jpg') && url.includes('tripadvisor.com') && isHighQualityImage(url)) {
            images.push(url);
          }
        });
      }
    });
  }

  // Remove duplicates and limit to 50 images
  const uniqueImages = [...new Set(images)].slice(0, 50);

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

    // 1.5 ENHANCE: Upgrade existing real images
    if (hotel.images && hotel.images.length > 0) {
      hotel.images = hotel.images.map(enhanceImageUrl).filter(isHighQualityImage);
      hotel.images = [...new Set(hotel.images)];
      if (hotel.images.length > 0) {
        hotel.image = hotel.images[0];
      } else {
        hotel.images = [];
        hotel.image = '';
      }
    }

    // SKIP if already processed (has sufficient real images)
    const existingRealImages = (hotel.images || []);
    if (existingRealImages.length >= 40) {
      continue;
    }

    // 2. STRATEGY: Bing + Google Images (Combined sources)
    try {
      process.stdout.write(`[${i + 1}/${hotels.length}] ${hotel.name}: Checking Bing... `);
      // Add delay before request
      await new Promise(resolve => setTimeout(resolve, 100)); // Reduced from 300ms
      const bingImages = await searchBingImages(hotel.name, hotel.location);
      if (bingImages.length > 0) {
        realImages = [...realImages, ...bingImages];
      }
    } catch (error) {
      process.stdout.write(`Bing failed. `);
    }

    // 3. STRATEGY: Google Images (Additional source)
    try {
      process.stdout.write(`Google... `);
      // Add delay before request
      await new Promise(resolve => setTimeout(resolve, 100));
      const googleImages = await searchGoogleImages(hotel.name, hotel.location);
      if (googleImages.length > 0) {
        realImages = [...realImages, ...googleImages];
      }
    } catch (error) {
      process.stdout.write(`Google failed. `);
    }

    // Remove duplicates from combined results
    realImages = [...new Set(realImages)];

    // 4. VALIDATE IMAGES
    if (realImages.length > 0) {
      console.log(`Validating ${realImages.length} images for ${hotel.name}...`);
      realImages = await validateImageUrls(realImages);
      console.log(`✅ ${realImages.length} valid images after validation.`);
    }

    // 5. UPDATE HOTEL DATA
    if (realImages.length > 0) {
      // Keep existing non-unsplash images if any
      const existingImages = (hotel.images || []).filter(url => !url.includes('unsplash.com'));

      // Combine and deduplicate
      const allImages = [...new Set([...existingImages, ...realImages])];

      hotel.image = allImages[0];
      hotel.images = allImages;
      console.log(`✅ Found ${realImages.length} new valid images.`);
    } else {
      console.log(`❌ No valid images found.`);
    }

    // Respectful delay between hotels
    await new Promise(resolve => setTimeout(resolve, 50)); // Reduced from 100ms
  }

  return endIndex;
}

// Helper to save progress
function saveProgress(currentHotels) {
  try {
    // Completely rewrite the file to avoid regex issues with nested arrays
    const content = `export const XOTELO_JORDAN_HOTELS = ${JSON.stringify(currentHotels, null, 2)};\n\nexport default XOTELO_JORDAN_HOTELS;`;
    
    fs.writeFileSync(dataFilePath, content);
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
        console.log('Waiting 0.5 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 500)); // Reduced from 1000ms
      }
    } catch (error) {
      console.log(`❌ Critical Batch Error: ${error.message}`);
      // Save what we have so far
      saveProgress(hotels);
      // Wait a bit longer then try to continue
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log('🎉 Finished processing ALL hotels!');
}

// Run the update
updateAllHotelsWithRealImages().catch(console.error);