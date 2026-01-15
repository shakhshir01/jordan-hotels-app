#!/usr/bin/env node

/**
 * Dynamic Sitemap Generator for VisitJo
 * Generates sitemaps for hotels and destinations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static URLs that are always included
const STATIC_URLS = [
  { loc: 'https://visitjo.com/', priority: '1.0', changefreq: 'weekly' },
  { loc: 'https://visitjo.com/hotels', priority: '0.9', changefreq: 'daily' },
  { loc: 'https://visitjo.com/experiences', priority: '0.9', changefreq: 'daily' },
  { loc: 'https://visitjo.com/deals', priority: '0.9', changefreq: 'daily' },
  { loc: 'https://visitjo.com/destinations', priority: '0.8', changefreq: 'weekly' },
  { loc: 'https://visitjo.com/about', priority: '0.6', changefreq: 'monthly' },
  { loc: 'https://visitjo.com/blog', priority: '0.7', changefreq: 'weekly' },
  { loc: 'https://visitjo.com/support', priority: '0.5', changefreq: 'monthly' },
  { loc: 'https://visitjo.com/privacy', priority: '0.3', changefreq: 'yearly' },
  { loc: 'https://visitjo.com/terms', priority: '0.3', changefreq: 'yearly' },
];

// Destination URLs
const DESTINATION_URLS = [
  { loc: 'https://visitjo.com/destinations/petra', priority: '0.8', changefreq: 'weekly' },
  { loc: 'https://visitjo.com/destinations/wadi-rum', priority: '0.8', changefreq: 'weekly' },
  { loc: 'https://visitjo.com/destinations/dead-sea', priority: '0.8', changefreq: 'weekly' },
  { loc: 'https://visitjo.com/destinations/amman', priority: '0.8', changefreq: 'weekly' },
  { loc: 'https://visitjo.com/destinations/aqaba', priority: '0.7', changefreq: 'weekly' },
  { loc: 'https://visitjo.com/destinations/jerash', priority: '0.7', changefreq: 'weekly' },
  { loc: 'https://visitjo.com/destinations/madaba', priority: '0.7', changefreq: 'weekly' },
];

function generateSitemapXML(urls) {
  const today = new Date().toISOString().split('T')[0];

  const urlElements = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
}

function generateHotelSitemap(hotels) {
  const hotelUrls = hotels.map(hotel => ({
    loc: `https://visitjo.com/hotels/${hotel.id}`,
    priority: '0.6',
    changefreq: 'weekly'
  }));

  return generateSitemapXML(hotelUrls);
}

async function loadHotelsData() {
  try {
    // Try to load from various possible locations
    const possiblePaths = [
      path.join(__dirname, '../api_hotels.json'),
      path.join(__dirname, '../src/data/api_hotels.json'),
      path.join(__dirname, '../public/api_hotels.json')
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8');
        const hotels = JSON.parse(data);
        return Array.isArray(hotels) ? hotels : [];
      }
    }

    console.log('No hotels data file found, generating basic sitemap');
    return [];
  } catch (error) {
    console.error('Error loading hotels data:', error);
    return [];
  }
}

async function generateSitemaps() {
  const publicDir = path.join(__dirname, '../public');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Load hotels data
  const hotels = await loadHotelsData();

  // Generate main sitemap
  const allUrls = [...STATIC_URLS, ...DESTINATION_URLS];

  // Add hotel URLs if available
  if (hotels.length > 0) {
    hotels.slice(0, 100).forEach(hotel => { // Limit to 100 most important hotels
      allUrls.push({
        loc: `https://visitjo.com/hotels/${hotel.id || hotel.hotelId}`,
        priority: '0.6',
        changefreq: 'weekly'
      });
    });
  }

  const mainSitemap = generateSitemapXML(allUrls);
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), mainSitemap);

  // Generate separate hotel sitemap if we have hotels
  if (hotels.length > 0) {
    const hotelSitemap = generateHotelSitemap(hotels);
    fs.writeFileSync(path.join(publicDir, 'sitemap-hotels.xml'), hotelSitemap);
  }

  console.log(`Generated sitemaps with ${allUrls.length} URLs`);
  if (hotels.length > 0) {
    console.log(`Generated hotel sitemap with ${hotels.length} hotels`);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemaps().catch(console.error);
}

export { generateSitemaps, generateSitemapXML };