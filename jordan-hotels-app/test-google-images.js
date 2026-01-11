import fs from 'fs';
import https from 'https';

// Read the Xotelo data
const fileData = fs.readFileSync('C:\\Users\\khale\\Desktop\\VisitJo\\jordan-hotels-app\\src\\services\\xoteloJordanHotelsData.js', 'utf8');
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

// Function to search Google Images and get real hotel images
function searchGoogleImages(hotelName, location) {
  const query = encodeURIComponent(`${hotelName} ${location} hotel images`);
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
        // Extract image URLs from Google Images search results
        const images = [];
        const imgMatches = data.match(/https:\/\/[^\"]*\.(?:jpg|jpeg|png|webp)/g);

        if (imgMatches) {
          // Filter for high-quality images and remove duplicates
          const uniqueImages = [...new Set(imgMatches)]
            .filter(url => url.includes('http') && !url.includes('favicon') && !url.includes('icon'))
            .filter(url => url.length > 50) // Filter out very short URLs
            .slice(0, 15); // Limit to 15 images

          images.push(...uniqueImages);
        }

        resolve(images);
      });
    }).on('error', reject);
  });
}

// Process a few hotels for testing
async function testImageFetching() {
  console.log('Testing image fetching for first 3 hotels...');

  for (let i = 0; i < 3; i++) {
    const hotel = hotels[i];
    console.log(`\nFetching images for: ${hotel.name} in ${hotel.location}`);

    try {
      const images = await searchGoogleImages(hotel.name, hotel.location);

      if (images.length > 0) {
        console.log(`✅ Found ${images.length} images for ${hotel.name}`);
        console.log('Sample images:');
        images.slice(0, 3).forEach((url, idx) => {
          console.log(`  ${idx + 1}: ${url.substring(0, 80)}...`);
        });

        // Update hotel with real images
        hotel.image = images[0];
        hotel.images = images;
      } else {
        console.log(`❌ No images found for ${hotel.name}`);
      }

    } catch (error) {
      console.log(`❌ Error fetching ${hotel.name}: ${error.message}`);
    }

    // Delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Save the updated data
  const updatedData = fileData.replace(
    /export const XOTELO_JORDAN_HOTELS = \[[\s\S]*?\];/,
    'export const XOTELO_JORDAN_HOTELS = ' + JSON.stringify(hotels, null, 2) + ';'
  );

  fs.writeFileSync('C:\\Users\\khale\\Desktop\\VisitJo\\jordan-hotels-app\\src\\services\\xoteloJordanHotelsData.js', updatedData);
  console.log('\n💾 Test data saved!');
}

testImageFetching().catch(console.error);