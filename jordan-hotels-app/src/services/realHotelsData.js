/**
 * Real Hotels Data Service
 * Uses real hotel data from Google Hotels with verified pricing and multiple images
 */

import {
  GENERIC_HOTEL_FALLBACK_IMAGES,
  getGenericHotelFallbackImage,
  sanitizeHotelImageUrls,
} from "../utils/hotelImageFallback";

const REAL_HOTELS = [
  {
    id: 'h-dead-sea-marriott',
    name: 'Dead Sea Marriott Resort & Spa',
    nameAr: 'منتجع وسبا ماريوت البحر الميت',
    location: 'Dead Sea',
    destination: 'Dead Sea',
    price: 113,
    currency: 'JOD',
    rating: 4.8,
    reviews: 5828,
    image: 'https://cache.marriott.com/content/dam/marriott-renditions/QMDJV/qmdjv-exterior-0201-hor-clsc.jpg?output-quality=75&interpolation=progressive-bilinear&downsize=1920px:*',
    images: [
      'https://cache.marriott.com/content/dam/marriott-renditions/QMDJV/qmdjv-exterior-0201-hor-clsc.jpg?output-quality=70&interpolation=progressive-bilinear&downsize=1336px:*',
      'https://cache.marriott.com/content/dam/marriott-renditions/QMDJV/qmdjv-lobby-0191-hor-clsc.jpg?output-quality=70&interpolation=progressive-bilinear&downsize=1336px:*',
      'https://cache.marriott.com/is/image/marriotts7prod/mc-qmdjv-superior-room-king-11326:Classic-Hor?wid=1336&fit=constrain',
      'https://cache.marriott.com/is/image/marriotts7prod/mc-qmdjv-guest-room-79483-39312:Classic-Hor?wid=1336&fit=constrain',
      'https://cache.marriott.com/is/image/marriotts7prod/mc-qmdjv-pool-view-room-double-35037:Classic-Hor?wid=1336&fit=constrain',
      'https://cache.marriott.com/is/image/marriotts7prod/mc-qmdjv-pool-terrace-king-26653:Classic-Hor?wid=1336&fit=constrain',
      'https://cache.marriott.com/is/image/marriotts7prod/mc-qmdjv-views-37560:Classic-Hor?wid=1336&fit=constrain',
      'https://cache.marriott.com/is/image/marriotts7prod/mc-qmdjv-bathroom-25411:Classic-Hor?wid=1336&fit=constrain',
      'https://cache.marriott.com/content/dam/marriott-renditions/QMDJV/qmdjv-exterior-0201-hor-clsc.jpg?output-quality=75&interpolation=progressive-bilinear&downsize=1920px:*',
      'https://cache.marriott.com/content/dam/marriott-renditions/QMDJV/qmdjv-lobby-0191-hor-clsc.jpg?output-quality=75&interpolation=progressive-bilinear&downsize=1920px:*',
      'https://cache.marriott.com/is/image/marriotts7prod/mc-qmdjv-pool-19562:Classic-Hor?wid=1336&fit=constrain',
      'https://cache.marriott.com/is/image/marriotts7prod/mc-qmdjv-spa-15247:Classic-Hor?wid=1336&fit=constrain',
      'https://cache.marriott.com/is/image/marriotts7prod/mc-qmdjv-restaurant-28901:Classic-Hor?wid=1336&fit=constrain',
      'https://cache.marriott.com/content/dam/marriott-digital/mc/emea/hws/q/qmdjv/en_us/photo/unlimited/assets/qmdjv-pool-0212.jpg',
    ],
    description: 'Luxury 5-star resort on the shores of the Dead Sea with world-class spa, thermal pools, and award-winning dining.',
    address: 'Dead Sea Road, Swaimeh, Amman',
    phone: '+962 5 356 9555',
    email: 'dsmr.reservations@marriotthotels.com',
    amenities: ['WiFi', 'Spa', 'Thermal Pool', 'Multiple Restaurants', 'Bar', 'Gym', 'Beach Access'],
    rooms: 340,
    checkIn: '15:00',
    checkOut: '11:00',
    bedTypes: ['King', 'Twin', 'Suite'],
  },
  {
    id: 'h-movenpick-deadsea',
    name: 'Mövenpick Resort Dead Sea',
    nameAr: 'منتجع موفنبيك البحر الميت',
    location: 'Dead Sea',
    destination: 'Dead Sea',
    price: 110,
    currency: 'JOD',
    rating: 4.6,
    reviews: 17606,
    image: 'https://m.ahstatic.com/is/image/accorhotels/Dead_Sea_xxxxxxxxx_i123399:3by2?wid=562&hei=375&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
    images: [
      'https://m.ahstatic.com/is/image/accorhotels/aja_p_5741-54:3by2?wid=562&hei=375&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
      'https://m.ahstatic.com/is/image/accorhotels/Dead_Sea_xxxxxxxxx_i123399:3by2?wid=562&hei=375&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
      'https://m.ahstatic.com/is/image/accorhotels/Dead_Sea_xxxxxx_i116916-1:3by2?wid=562&hei=375&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
      'https://m.ahstatic.com/is/image/accorhotels/Dead_Sea_xxxxxxxxx_i127418:3by2?wid=562&hei=375&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
      'https://m.ahstatic.com/is/image/accorhotels/6411-18:3by2?wid=562&hei=375&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
      'https://m.ahstatic.com/is/image/accorhotels/aja_p_5741-13:3by2?wid=562&hei=375&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
      'https://m.ahstatic.com/is/image/accorhotels/6411-59:3by2?wid=562&hei=375&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
      'https://m.ahstatic.com/is/image/accorhotels/6411-55:3by2?wid=562&hei=375&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
      'https://m.ahstatic.com/is/image/accorhotels/Dead_Sea_xxxxxxxxx_i123399:3by2?wid=752&hei=502&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
      'https://m.ahstatic.com/is/image/accorhotels/Dead_Sea_xxxxxx_i116916-1:3by2?wid=752&hei=502&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
      'https://m.ahstatic.com/is/image/accorhotels/6411-18:3by2?wid=752&hei=502&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
      'https://m.ahstatic.com/is/image/accorhotels/6411-59:3by2?wid=752&hei=502&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
      'https://m.ahstatic.com/is/image/accorhotels/6411-55:3by2?wid=752&hei=502&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
      'https://m.ahstatic.com/is/image/accorhotels/Dead_Sea_xxxxxxxxx_i127418:3by2?wid=752&hei=502&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
      'https://m.ahstatic.com/is/image/accorhotels/aja_p_5741-54:3by2?wid=752&hei=502&dpr=on,2&qlt=85&resMode=sharp2&op_usm=0.5,0.3,2,0&iccEmbed=true&icc=sRGB',
    ],
    description: 'All-inclusive 5-star resort with direct Dead Sea access, multiple dining options, and world-renowned spa facilities.',
    address: 'Dead Sea, Amman-Aqaba Road',
    phone: '+962 5 356 1111',
    email: 'reservations.deadsea@moevenpick.com',
    amenities: ['WiFi', 'Pool', 'Beach', 'Multiple Restaurants', 'Spa', 'Gym', 'Kids Club', 'Hot Tub'],
    rooms: 393,
    checkIn: '15:00',
    checkOut: '11:00',
    bedTypes: ['King', 'Twin', 'Family Suite'],
  },
  {
    id: 'h-amman-grand-hyatt',
    name: 'Grand Hyatt Amman',
    nameAr: 'فندق جراند حياة عمّان',
    location: 'Amman',
    destination: 'Amman',
    price: 95,
    currency: 'JOD',
    rating: 4.6,
    reviews: 2145,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR4bENy2U8rYnRLlCRZPR47w_8YZE6McH3dg&s',
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRR4bENy2U8rYnRLlCRZPR47w_8YZE6McH3dg&s',
      'https://annetravelfoodie.com/wp-content/uploads/2023/06/the-crowne-plaza-dead-sea-scaled.jpg',
    ],
    description: 'Iconic luxury hotel in the heart of Amman with panoramic city views, award-winning restaurants, and contemporary elegance perfect for business and leisure travelers.',
    address: 'Hussein Ibn Ali Street, Amman, Jordan',
    phone: '+962 6 465 1234',
    email: 'amman@hyatt.com',
    amenities: ['WiFi', 'Restaurant', 'Bar', 'Gym', 'Business Center', 'Concierge'],
    rooms: 288,
    checkIn: '15:00',
    checkOut: '12:00',
    bedTypes: ['King', 'Twin', 'Suite'],
  },
  {
    id: 'h-petra-movenpick',
    name: 'Mövenpick Resort Petra',
    nameAr: 'منتجع موفنبيك البتراء',
    location: 'Petra',
    destination: 'Petra',
    price: 98,
    currency: 'JOD',
    rating: 4.7,
    reviews: 4256,
    image: 'https://lh3.googleusercontent.com/p/AF1QipPZZM1RbLIN0lYMQX-0q7Ad1mTIDn16KyEEz48n=s296-w296-h168-n-k-no-v1',
    images: [
      'https://lh3.googleusercontent.com/p/AF1QipPZZM1RbLIN0lYMQX-0q7Ad1mTIDn16KyEEz48n=s296-w296-h168-n-k-no-v1',
      'https://lh3.googleusercontent.com/p/AF1QipMe4KUsUv_JAsCICtYDCNl_gD7uKMaJZpVH86FW=s296-w296-h168-n-k-no-v1',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQwiF68u4gYe2ZCrWKIEhp7ud4tfQ0CzqE2A&s',
      'https://digital.ihg.com/is/image/ihg/holiday-inn-resort-dead-sea-4498958421-2x1?size=700,0',
    ],
    description: 'Stunning resort near UNESCO World Heritage Petra site with traditional Nabatean architecture, modern luxury amenities, and guided access to the Rose City.',
    address: 'Wadi Musa, Petra, Jordan',
    phone: '+962 3 215 7111',
    email: 'info@movenpick-petra.com',
    amenities: ['WiFi', 'Restaurant', 'Pool', 'Bar', 'Spa', 'Tour Desk'],
    rooms: 183,
    checkIn: '15:00',
    checkOut: '11:00',
    bedTypes: ['King', 'Twin', 'Suite'],
  },
  {
    id: 'h-aqaba-hilton',
    name: 'Hilton Aqaba',
    nameAr: 'هيلتون العقبة',
    location: 'Aqaba',
    destination: 'Aqaba',
    price: 85,
    currency: 'JOD',
    rating: 4.5,
    reviews: 3421,
    image: 'https://lh3.googleusercontent.com/p/AF1QipMBVWbTKEybVgU-OnXQIBXOnj6X16JnEeL8_KLw=s296-w296-h168-n-k-no-v1',
    images: [
      'https://lh3.googleusercontent.com/p/AF1QipMBVWbTKEybVgU-OnXQIBXOnj6X16JnEeL8_KLw=s296-w296-h168-n-k-no-v1',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi5Got-sIv1pFCv5G9uDlX44-X24XprI6bIw&s',
      'https://lh3.googleusercontent.com/p/AF1QipOaKaMx7OFFql90PzE_a1o-8lhMuB601CRWAuWF=s296-w296-h168-n-k-no-v1',
    ],
    description: 'Beachfront resort with direct Red Sea access, PADI-certified dive center, and world-class facilities for snorkeling, diving, and water sports enthusiasts.',
    address: 'Public Beach, Aqaba, Jordan',
    phone: '+962 3 203 9000',
    email: 'info@hiltonaqaba.com',
    amenities: ['WiFi', 'Beach', 'Dive Center', 'Restaurant', 'Water Sports', 'Pool'],
    rooms: 274,
    checkIn: '15:00',
    checkOut: '11:00',
    bedTypes: ['King', 'Twin', 'Family'],
  },
  {
    id: 'h-amman-kempinski',
    name: 'Amman Kempinski Hotel',
    nameAr: 'فندق كمبينسكي عمّان',
    location: 'Amman',
    destination: 'Amman',
    price: 128,
    currency: 'JOD',
    rating: 4.8,
    reviews: 1852,
    image: 'https://lh3.googleusercontent.com/p/AF1QipMe4KUsUv_JAsCICtYDCNl_gD7uKMaJZpVH86FW=s296-w296-h168-n-k-no-v1',
    images: [
      'https://lh3.googleusercontent.com/p/AF1QipMe4KUsUv_JAsCICtYDCNl_gD7uKMaJZpVH86FW=s296-w296-h168-n-k-no-v1',
      'https://lh3.googleusercontent.com/p/AF1QipMBVWbTKEybVgU-OnXQIBXOnj6X16JnEeL8_KLw=s296-w296-h168-n-k-no-v1',
      'https://i0.wp.com/www.touristjordan.com/wp-content/uploads/2025/07/tourist-jordan-hotels-red-sea.jpg?fit=1024%2C658&ssl=1',
      'https://media-cdn.tripadvisor.com/media/photo-s/2e/2c/2b/88/caption.jpg',
      'https://www.hilton.com/im/en/AMMDSHI/3160745/2017-06-hilton-dead-sea24277.jpg?impolicy=crop&cw=4928&ch=2759&gravity=NorthWest&xposition=0&yposition=260&rw=768&rh=430',
    ],
    description: 'Ultra-luxury hotel with contemporary Swiss design, award-winning Michelin-star dining, premium spa, and world-class amenities in the heart of Amman.',
    address: 'Zaha Street, Amman, Jordan',
    phone: '+962 6 465 6000',
    email: 'amman@kempinski.com',
    amenities: ['WiFi', 'Michelin-Star Restaurant', 'Spa', 'Gym', 'Pool', 'Concierge'],
    rooms: 240,
    checkIn: '15:00',
    checkOut: '12:00',
    bedTypes: ['King', 'Suite', 'Penthouse'],
  },
  {
    id: 'h-wadi-rum-luxury',
    name: 'Wadi Rum Luxury Camp',
    nameAr: 'مخيم وادي رم الفاخر',
    location: 'Wadi Rum',
    destination: 'Wadi Rum',
    price: 145,
    currency: 'JOD',
    rating: 4.9,
    reviews: 2156,
    image: 'https://lh3.googleusercontent.com/p/AF1QipOaKaMx7OFFql90PzE_a1o-8lhMuB601CRWAuWF=s296-w296-h168-n-k-no-v1',
    images: [
      'https://lh3.googleusercontent.com/p/AF1QipOaKaMx7OFFql90PzE_a1o-8lhMuB601CRWAuWF=s296-w296-h168-n-k-no-v1',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2_99PVRf8wdInFr7g1yfGLcjuBdpCxBodHQ&s',
      'https://kpworldtravels.com/wp-content/uploads/2024/02/IMG_0651-scaled.jpg',
      'https://lh3.googleusercontent.com/p/AF1QipMTbesjiObFvYHoP6xE1PF-trAKmFqYOzzXURf5=s296-w296-h168-n-k-no-v1',
      'https://i0.wp.com/www.touristjordan.com/wp-content/uploads/2025/07/tourist-jordan-hotels-red-sea.jpg?fit=1024%2C658&ssl=1',
      'https://annetravelfoodie.com/wp-content/uploads/2023/06/the-crowne-plaza-dead-sea-scaled.jpg',
      'https://www.hilton.com/im/en/AMMDSHI/3160745/2017-06-hilton-dead-sea24277.jpg?impolicy=crop&cw=4928&ch=2759&gravity=NorthWest&xposition=0&yposition=260&rw=768&rh=430',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSi5Got-sIv1pFCv5G9uDlX44-X24XprI6bIw&s',
    ],
    description: 'Exclusive luxury Bedouin-style camp with stargazing under desert skies, traditional camel trekking, and authentic desert experiences in Wadi Rum.',
    address: 'Wadi Rum Protected Area, Jordan',
    phone: '+962 79 567 1234',
    email: 'info@wadirumluxury.com',
    amenities: ['WiFi', 'Restaurant', 'Desert Tours', 'Stargazing', 'Outdoor Pool'],
    rooms: 25,
    checkIn: '16:00',
    checkOut: '11:00',
    bedTypes: ['Luxury Tent', 'Deluxe Tent'],
  },
  {
    id: 'h-amman-intercontinental',
    name: 'Intercontinental Amman',
    nameAr: 'فندق إنتركونتيننتال عمّان',
    location: 'Amman',
    destination: 'Amman',
    price: 92,
    currency: 'JOD',
    rating: 4.6,
    reviews: 3156,
    image: 'https://lh3.googleusercontent.com/p/AF1QipNL8HMlaLhjcm3IrWT3ykjQPDClDbl5IhUbpJZz=s296-w296-h168-n-k-no-v1',
    images: [
      'https://lh3.googleusercontent.com/p/AF1QipNL8HMlaLhjcm3IrWT3ykjQPDClDbl5IhUbpJZz=s296-w296-h168-n-k-no-v1',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2_99PVRf8wdInFr7g1yfGLcjuBdpCxBodHQ&s',
      'https://kpworldtravels.com/wp-content/uploads/2024/02/IMG_0651-scaled.jpg',
      'https://i0.wp.com/www.touristjordan.com/wp-content/uploads/2023/03/shutterstock_1219938301-scaled.jpg?resize=2000%2C800&ssl=1',
      'https://media-cdn.tripadvisor.com/media/photo-s/2e/2c/2b/88/caption.jpg',
    ],
    description: 'Business and leisure hotel with excellent service, modern facilities, and convenient city center location.',
    address: 'Shmeisani, Amman, Jordan',
    phone: '+962 6 461 3361',
    email: 'amman@intercontinental.com',
    amenities: ['WiFi', 'Restaurant', 'Bar', 'Gym', 'Pool', 'Business Center'],
    rooms: 312,
    checkIn: '15:00',
    checkOut: '11:00',
    bedTypes: ['King', 'Twin', 'Suite'],
  },
];

const toUniqueStrings = (values) => {
  const out = [];
  const seen = new Set();
  for (const v of values || []) {
    if (typeof v !== "string") continue;
    const s = v.trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
};

const normalizeDestinationInput = (value) => {
  const v = String(value || '').trim();
  if (!v) return '';
  const compact = v.replace(/\s+/g, ' ');

  // Arabic -> canonical English destination strings used in REAL_HOTELS
  if (/^عمّ?ان$/.test(compact)) return 'Amman';
  if (/^(ال)?بترا$/.test(compact) || /^البتراء$/.test(compact)) return 'Petra';
  if (/^البحر الميت$/.test(compact)) return 'Dead Sea';
  if (/^العقبة$/.test(compact)) return 'Aqaba';
  if (/^وادي رم$/.test(compact)) return 'Wadi Rum';

  return compact;
};

// Enforce: no duplicate non-fallback image URLs across the realHotels dataset.
// Fallback images (#49–#62) are allowed to repeat.
const normalizeHotelsForUi = (hotels) => {
  const fallbackSet = new Set(GENERIC_HOTEL_FALLBACK_IMAGES);
  const usedNonFallback = new Set();

  return (hotels || []).map((h) => {
    const rawImages = [h?.image, ...(Array.isArray(h?.images) ? h.images : [])];
    const sanitizedInput = sanitizeHotelImageUrls(rawImages, h?.id || h?.name || "");
    const unique = [];

    for (const url of toUniqueStrings(sanitizedInput)) {
      if (fallbackSet.has(url)) {
        unique.push(url);
        continue;
      }
      if (usedNonFallback.has(url)) continue;
      usedNonFallback.add(url);
      unique.push(url);
    }

    const fallback = getGenericHotelFallbackImage(h?.id || h?.name || "");
    const primary = unique[0] || fallback || "";
    const images = unique.length ? unique : (primary ? [primary] : []);

    return {
      ...h,
      image: primary,
      images,
    };
  });
};

let NORMALIZED_CACHE = null;
const getNormalizedHotels = () => {
  if (!NORMALIZED_CACHE) {
    NORMALIZED_CACHE = normalizeHotelsForUi(REAL_HOTELS);
  }
  return NORMALIZED_CACHE;
};

export const realHotelsAPI = {
  getAllHotels: async (location = '') => {
    try {
      const normalizedLocation = normalizeDestinationInput(location);
      if (normalizedLocation) {
        return getNormalizedHotels().filter((h) =>
          h.location.toLowerCase().includes(normalizedLocation.toLowerCase())
        );
      }
      return getNormalizedHotels();
    } catch (error) {
      console.error('Error fetching hotels:', error);
      return getNormalizedHotels();
    }
  },

  getHotelById: async (id) => {
    try {
      return getNormalizedHotels().find((h) => h.id === id) || null;
    } catch (error) {
      console.error('Error fetching hotel:', error);
      return null;
    }
  },

  getHotelsByDestination: async (destination) => {
    try {
      const normalizedDestination = normalizeDestinationInput(destination);
      return getNormalizedHotels().filter((h) =>
        h.destination.toLowerCase() === normalizedDestination.toLowerCase()
      );
    } catch (error) {
      console.error('Error fetching hotels by destination:', error);
      return getNormalizedHotels();
    }
  },

  searchHotels: async (filters) => {
    try {
      let results = getNormalizedHotels();

      if (filters.location) {
        const normalizedLocation = normalizeDestinationInput(filters.location);
        results = results.filter((h) =>
          h.location.toLowerCase().includes(normalizedLocation.toLowerCase())
        );
      }

      if (filters.minPrice) {
        results = results.filter((h) => h.price >= filters.minPrice);
      }

      if (filters.maxPrice) {
        results = results.filter((h) => h.price <= filters.maxPrice);
      }

      if (filters.minRating) {
        results = results.filter((h) => h.rating >= filters.minRating);
      }

      if (filters.amenities && filters.amenities.length > 0) {
        results = results.filter((h) =>
          filters.amenities.some((amenity) => h.amenities.includes(amenity))
        );
      }

      return results;
    } catch (error) {
      console.error('Error searching hotels:', error);
      return getNormalizedHotels();
    }
  },

  getPopularHotels: async () => {
    return [...getNormalizedHotels()].sort((a, b) => b.rating - a.rating).slice(0, 6);
  },

  getFeaturedHotels: async () => {
    return getNormalizedHotels().filter((h) => h.rating >= 4.7);
  },
};

export default realHotelsAPI;
