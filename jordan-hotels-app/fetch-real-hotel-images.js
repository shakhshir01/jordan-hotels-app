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
resetHotelImages(hotels);

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
  const concurrencyLimit = 20; // Increased from 5 to 20 for faster validation

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
    'review', 'rating', 'stars', 'thumb', 'thumbnail', 'tiny', 'small', 'widget',
    'button', 'link', 'nav', 'header', 'footer', 'sidebar', 'popup', 'modal',
    'watermark', 'copyright', 'placeholder', 'loading', 'spinner', 'gif',
    'interior', 'room', 'bathroom', 'bed', 'toilet', 'kitchen', 'lobby', 'reception',
    'pool', 'spa', 'gym', 'restaurant', 'bar', 'cafe', 'menu', 'food', 'drink'
  ];
  if (junkTerms.some(term => lower.includes(term))) return false;
  
  // Filter out known low-res patterns
  if (lower.includes('w=50') || lower.includes('w=100') || lower.includes('w=150') || lower.includes('w=200') || lower.includes('w=250')) return false;
  
  // Filter out dimensions in filenames that look small (e.g. 100x100, 320x240)
  // Matches patterns like: image_100x100.jpg, photo-320x240.png
  if (lower.match(/[-_](?:50|60|80|100|120|140|150|160|180|200|240|300|320|400|450|500)x(?:50|60|80|100|120|140|150|160|180|200|240|300|320|400|450|500)\./)) return false;
  
  // Prefer high-res indicators
  if (lower.includes('w=800') || lower.includes('w=1000') || lower.includes('w=1200') || lower.includes('w=1600') || lower.includes('h=800') || lower.includes('h=1000') || lower.includes('h=1200')) return true;
  
  return true;
}

function scoreImage(url) {
  if (!url) return -100;
  let score = 0;
  const lower = url.toLowerCase();
  
  // Prefer exterior/front views (highest priority)
  if (lower.includes('exterior')) score += 25;
  if (lower.includes('front')) score += 23;
  if (lower.includes('entrance')) score += 23;
  if (lower.includes('facade')) score += 21;
  if (lower.includes('building')) score += 20;
  if (lower.includes('outside')) score += 19;
  if (lower.includes('outdoor')) score += 17;
  if (lower.includes('aerial')) score += 15;
  if (lower.includes('view')) score += 12;
  if (lower.includes('panorama')) score += 10;
  
  // Good interior but lower priority
  if (lower.includes('lobby')) score += 8;
  if (lower.includes('reception')) score += 6;
  if (lower.includes('hall')) score += 4;
  
  // Amenities (low priority)
  if (lower.includes('pool')) score += 3;
  if (lower.includes('spa')) score += 2;
  if (lower.includes('garden')) score += 2;
  
  // Penalize room/bathroom heavily
  if (lower.includes('room')) score -= 20;
  if (lower.includes('bathroom')) score -= 25;
  if (lower.includes('bed')) score -= 15;
  if (lower.includes('interior')) score -= 10;
  if (lower.includes('inside')) score -= 8;
  
  // Prefer high-res sources
  if (lower.includes('tripadvisor.com')) score += 10; // Increased from 8
  if (lower.includes('w=1200') || lower.includes('h=1200') || lower.includes('w=1600')) score += 5;
  if (lower.includes('w=800') || lower.includes('h=800') || lower.includes('w=1000')) score += 3;
  
  // Prefer reputable sources
  if (lower.includes('booking.com') || lower.includes('bstatic.com')) score += 6; // Increased from 4
  if (lower.includes('agoda.com')) score += 4;
  
  return score;
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
  const query = encodeURIComponent(`${hotelName} ${location} hotel exterior front view building facade`);
  const url = `https://www.bing.com/images/search?q=${query}&first=1&filters=size:large`;

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
          if (imgUrl.match(/\.(jpg|jpeg|png|webp)(\?|$)/i) && !imgUrl.includes('bing.com/th') && !imgUrl.includes('bing.com/images') && isHighQualityImage(imgUrl)) {
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
  const query = encodeURIComponent(`${hotelName} ${location} hotel exterior front view building facade`);
  const url = `https://www.google.com/search?q=${query}&tbm=isch&source=hp&tbs=isz:l`;

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

// Function to search TripAdvisor Images
function searchTripAdvisorImages(hotelName, location) {
  const query = encodeURIComponent(`${hotelName} ${location}`);
  const url = `https://www.tripadvisor.com/Search?q=${query}&geo=1&ssrc=h&searchNearby=false&searchSessionId=&blockRedirect=true`;

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

        // Look for TripAdvisor hotel pages and extract images
        const hotelPageRegex = /href="(\/Hotel_Review-[^"]+)"/g;
        let match;
        const hotelPages = [];
        while ((match = hotelPageRegex.exec(data)) !== null) {
          hotelPages.push(`https://www.tripadvisor.com${match[1]}`);
        }

        // For now, just extract any images from the search page
        const imgRegex = /(https:\/\/[a-zA-Z0-9-]+\.tripadvisor\.com\/media\/photo-[^"'\s\\]+)/g;
        while ((match = imgRegex.exec(data)) !== null) {
          let url = match[1];
          url = url.replace(/\\u002F/g, '/');
          url = enhanceImageUrl(url);
          if (isHighQualityImage(url)) {
            images.push(url);
          }
        }

        resolve([...new Set(images)].slice(0, 30));
      });
    }).on('error', (err) => {
      resolve([]);
    });
    req.setTimeout(10000, () => {
      req.destroy();
      resolve([]);
    });
  });
}

// Function to search Booking.com Images
function searchBookingImages(hotelName, location) {
  const query = encodeURIComponent(`${hotelName} ${location}`);
  const url = `https://www.booking.com/search.html?ss=${query}&checkin=&checkout=&group_adults=1&no_rooms=1&group_children=0`;

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

        // Booking.com images are often in data-src or src attributes
        const imgRegex = /data-src="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/g;
        let match;
        while ((match = imgRegex.exec(data)) !== null) {
          const imgUrl = match[1];
          if (imgUrl.includes('cf.bstatic.com') && isHighQualityImage(imgUrl)) {
            images.push(imgUrl);
          }
        }

        // Also check regular src
        const srcRegex = /src="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/g;
        while ((match = srcRegex.exec(data)) !== null) {
          const imgUrl = match[1];
          if (imgUrl.includes('cf.bstatic.com') && !images.includes(imgUrl) && isHighQualityImage(imgUrl)) {
            images.push(imgUrl);
          }
        }

        resolve([...new Set(images)].slice(0, 30));
      });
    }).on('error', (err) => {
      resolve([]);
    });
    req.setTimeout(10000, () => {
      req.destroy();
      resolve([]);
    });
  });
}

// Function to search Unsplash for hotel images (filtered better)
function searchUnsplashImages(hotelName, location) {
  const query = encodeURIComponent(`${hotelName} ${location} hotel exterior building facade`);
  const url = `https://unsplash.com/s/photos/${query}?orientation=landscape`;

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

        // Unsplash images in srcset or src
        const imgRegex = /srcSet="([^"]+)"/g;
        let match;
        while ((match = imgRegex.exec(data)) !== null) {
          const srcset = match[1];
          // Get the highest resolution URL
          const urls = srcset.split(',').map(s => s.trim().split(' ')[0]);
          const bestUrl = urls[urls.length - 1]; // Last one is usually highest res
          if (bestUrl && bestUrl.includes('images.unsplash.com') && isHighQualityImage(bestUrl)) {
            images.push(bestUrl);
          }
        }

        resolve([...new Set(images)].slice(0, 20));
      });
    }).on('error', (err) => {
      resolve([]);
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
async function processHotelsBatch(startIndex, batchSize, assignedImages) {
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
      hotel.images = hotel.images.filter(url => !assignedImages.has(url)); // Remove images already assigned elsewhere
      hotel.images = [...new Set(hotel.images)];
      hotel.images.sort((a, b) => scoreImage(b) - scoreImage(a));
      hotel.images = hotel.images.slice(0, 50); // Limit to 50 images per hotel
      if (hotel.images.length > 0) {
        hotel.image = hotel.images[0];
      } else {
        hotel.images = [];
        hotel.image = '';
      }
    }

    // SKIP if already processed (has sufficient real images)
    const existingRealImages = (hotel.images || []);
    if (existingRealImages.length >= 50) {
      existingRealImages.forEach(url => assignedImages.add(url));
      continue;
    }

    // 2. STRATEGY: Search multiple sources in parallel for speed
    try {
      process.stdout.write(`[${i + 1}/${hotels.length}] ${hotel.name}: Searching sources... `);
      
      // Search all sources in parallel
      const searchPromises = [
        searchBingImages(hotel.name, hotel.location),
        searchGoogleImages(hotel.name, hotel.location),
        searchTripAdvisorImages(hotel.name, hotel.location),
        searchBookingImages(hotel.name, hotel.location),
        searchUnsplashImages(hotel.name, hotel.location)
      ];

      const results = await Promise.allSettled(searchPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.length > 0) {
          realImages = [...realImages, ...result.value];
        }
      });

      console.log(`Found ${realImages.length} potential images from ${results.filter(r => r.status === 'fulfilled' && r.value.length > 0).length} sources.`);

    } catch (error) {
      console.log(`❌ Search error: ${error.message}`);
    }

    // Remove duplicates from combined results
    realImages = [...new Set(realImages)];
    // Remove images already assigned to other hotels
    realImages = realImages.filter(url => !assignedImages.has(url));

    // 4. VALIDATE IMAGES
    if (realImages.length > 0) {
      console.log(`Validating ${realImages.length} images for ${hotel.name}...`);
      realImages = await validateImageUrls(realImages);
      console.log(`✅ ${realImages.length} valid images after validation.`);
    }

    // 5. UPDATE HOTEL DATA
    if (realImages.length > 0) {
      const existingImages = (hotel.images || []).filter(url => !url.includes('unsplash.com'));
      let allImages = [...existingImages, ...realImages];
      allImages = allImages.filter(url => !assignedImages.has(url)); // Remove images already assigned elsewhere
      allImages = [...new Set(allImages)];
      allImages.sort((a, b) => scoreImage(b) - scoreImage(a));
      allImages = allImages.slice(0, 50); // Limit to 50 images per hotel
      hotel.image = allImages[0];
      hotel.images = allImages;
      allImages.forEach(url => assignedImages.add(url));
      console.log(`✅ Found ${realImages.length} new valid images. Best profile image set.`);
    } else {
      hotel.image = '';
      hotel.images = [];
      console.log(`❌ No valid images found. Profile image cleared.`);
    }

    await new Promise(resolve => setTimeout(resolve, 20)); // Reduced delay
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
  const batchSize = 25; // Increased from 10 to 25 for faster processing
  let currentIndex = 0;
  const maxHotels = hotels.length; // Process ALL hotels

  // Track all assigned images globally to prevent duplicates across hotels
  const assignedImages = new Set();
  while (currentIndex < maxHotels) {
    try {
      currentIndex = await processHotelsBatch(currentIndex, batchSize, assignedImages);
      saveProgress(hotels);
      if (currentIndex < maxHotels) {
        console.log('Waiting 0.2 seconds before next batch...');
        await new Promise(resolve => setTimeout(resolve, 200)); // Reduced from 500ms to 200ms
      }
    } catch (error) {
      console.log(`❌ Critical Batch Error: ${error.message}`);
      saveProgress(hotels);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced error delay
    }
  }
  console.log('🎉 Finished processing ALL hotels!');
}

// Run the update
// Reset all hotel images and image arrays to empty, then save
 resetHotelImages(hotels); // Commented out to avoid resetting existing images
updateAllHotelsWithRealImages().catch(console.error);