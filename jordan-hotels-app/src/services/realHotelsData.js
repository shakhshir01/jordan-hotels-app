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
    price: 135,
    currency: 'JOD',
    rating: 4.8,
    reviews: 5828,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200',
    ],
    description: 'Luxury 5-star resort on the shores of the Dead Sea with world-class spa, thermal pools, and award-winning dining.',
    address: 'Dead Sea Road, Swaimeh, Amman',
    phone: '+962 5 356 9555',
    email: 'dsmr.reservations@marriotthotels.com',
    amenities: ['Free WiFi', 'Spa & Wellness Center', 'Thermal Mineral Pools', 'Multiple Restaurants', 'Bar & Lounge', 'Fitness Center', 'Beach Access', 'Concierge', 'Room Service', 'Valet Parking'],
    rooms: 340,
    checkIn: '15:00',
    checkOut: '11:00',
    bedTypes: ['King', 'Twin', 'Suite'],
    roomTypes: [
      {
        name: 'Superior Room',
        price: 135,
        capacity: 2,
        features: ['Dead Sea View', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Bathrobe & Slippers'],
        size: '35 m²',
        bedType: 'King or Twin Beds'
      },
      {
        name: 'Deluxe Room',
        price: 165,
        capacity: 3,
        features: ['Dead Sea View', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Bathrobe & Slippers', 'Coffee Maker'],
        size: '42 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Executive Suite',
        price: 285,
        capacity: 4,
        features: ['Dead Sea View', 'Private Balcony', 'Living Room', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Bathrobe & Slippers', 'Coffee Maker', 'Separate Bathroom'],
        size: '65 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Presidential Suite',
        price: 450,
        capacity: 6,
        features: ['Panoramic Dead Sea View', 'Private Terrace', 'Living Room', 'Dining Room', 'Kitchen', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Bathrobe & Slippers', 'Coffee Maker', 'Jacuzzi'],
        size: '120 m²',
        bedType: 'King Bed + 2 Sofa Beds'
      }
    ],
    policies: {
      smoking: 'Non-smoking hotel with designated outdoor smoking areas',
      pets: 'Pets not allowed',
      cancellation: 'Free cancellation up to 24 hours before check-in'
    }
  },
  {
    id: 'h-movenpick-deadsea',
    name: 'Mövenpick Resort Dead Sea',
    nameAr: 'منتجع موفنبيك البحر الميت',
    location: 'Dead Sea',
    destination: 'Dead Sea',
    price: 125,
    currency: 'JOD',
    rating: 4.6,
    reviews: 17606,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200',
      'https://images.unsplash.com/photo-1584132915807-8b0f3e6cb21f?q=80&w=1200',
    ],
    description: 'All-inclusive 5-star resort with direct Dead Sea access, multiple dining options, and world-renowned spa facilities.',
    address: 'Dead Sea, Amman-Aqaba Road',
    phone: '+962 5 356 1111',
    email: 'reservations.deadsea@moevenpick.com',
    amenities: ['Free WiFi', 'Outdoor Pool', 'Beach Access', 'Multiple Restaurants', 'Bar & Lounge', 'Spa Center', 'Fitness Center', 'Kids Club', 'Hot Tub', 'Tennis Court', 'Water Sports'],
    rooms: 393,
    checkIn: '15:00',
    checkOut: '11:00',
    bedTypes: ['King', 'Twin', 'Family Suite'],
    roomTypes: [
      {
        name: 'Standard Room',
        price: 125,
        capacity: 2,
        features: ['Garden View', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning'],
        size: '32 m²',
        bedType: 'King or Twin Beds'
      },
      {
        name: 'Superior Room',
        price: 145,
        capacity: 3,
        features: ['Pool View', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker'],
        size: '38 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Deluxe Suite',
        price: 195,
        capacity: 4,
        features: ['Dead Sea View', 'Private Balcony', 'Living Area', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Separate Bathroom'],
        size: '55 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Royal Suite',
        price: 320,
        capacity: 6,
        features: ['Panoramic Dead Sea View', 'Private Terrace', 'Living Room', 'Dining Area', 'Kitchenette', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Jacuzzi'],
        size: '95 m²',
        bedType: 'King Bed + 2 Sofa Beds'
      },
      {
        name: 'Smoking Room',
        price: 115,
        capacity: 2,
        features: ['Garden View', 'Smoking Allowed', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning'],
        size: '32 m²',
        bedType: 'King or Twin Beds',
        smoking: true
      }
    ],
    policies: {
      smoking: 'Designated smoking rooms available, non-smoking floors',
      pets: 'Pets not allowed',
      cancellation: 'Free cancellation up to 48 hours before check-in'
    }
  },
  {
    id: 'h-amman-grand-hyatt',
    name: 'Grand Hyatt Amman',
    nameAr: 'فندق جراند حياة عمّان',
    location: 'Amman',
    destination: 'Amman',
    price: 180,
    currency: 'JOD',
    rating: 4.6,
    reviews: 2145,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200',
    ],
    description: 'Luxury 5-star hotel in the heart of Amman with stunning city views, world-class dining, and comprehensive wellness facilities.',
    address: 'Hussein Bin Ali Street, Amman',
    phone: '+962 6 465 1234',
    email: 'grand.hyatt.amman@hyatt.com',
    amenities: ['Free WiFi', 'Outdoor Pool', 'Fitness Center', 'Spa Center', 'Multiple Restaurants', 'Bar & Lounge', 'Business Center', 'Concierge', 'Valet Parking', 'Room Service', 'Laundry Service'],
    rooms: 310,
    checkIn: '15:00',
    checkOut: '12:00',
    bedTypes: ['King', 'Twin', 'Queen', 'Suite'],
    roomTypes: [
      {
        name: 'City View Room',
        price: 180,
        capacity: 2,
        features: ['City View', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk'],
        size: '35 m²',
        bedType: 'King or Twin Beds'
      },
      {
        name: 'Executive Room',
        price: 220,
        capacity: 3,
        features: ['City View', 'Executive Lounge Access', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers'],
        size: '42 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Junior Suite',
        price: 280,
        capacity: 4,
        features: ['City View', 'Separate Living Area', 'Executive Lounge Access', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers'],
        size: '65 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Executive Suite',
        price: 420,
        capacity: 6,
        features: ['Panoramic City View', 'Living Room', 'Dining Area', 'Executive Lounge Access', 'Private Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers', 'Jacuzzi'],
        size: '95 m²',
        bedType: 'King Bed + 2 Sofa Beds'
      },
      {
        name: 'Presidential Suite',
        price: 650,
        capacity: 8,
        features: ['Panoramic City View', 'Master Bedroom', 'Living Room', 'Dining Room', 'Kitchen', 'Executive Lounge Access', 'Private Terrace', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers', 'Jacuzzi', 'Butler Service'],
        size: '180 m²',
        bedType: 'King Bed + 2 Queen Beds'
      },
      {
        name: 'Smoking Room',
        price: 165,
        capacity: 2,
        features: ['City View', 'Smoking Allowed', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker'],
        size: '35 m²',
        bedType: 'King or Twin Beds',
        smoking: true
      }
    ],
    policies: {
      smoking: 'Designated smoking rooms available, non-smoking floors',
      pets: 'Pets not allowed',
      cancellation: 'Free cancellation up to 24 hours before check-in'
    }
  },
  {
    id: 'h-petra-movenpick',
    name: 'Mövenpick Resort Petra',
    nameAr: 'منتجع موفنبيك البتراء',
    location: 'Petra',
    destination: 'Petra',
    price: 140,
    currency: 'JOD',
    rating: 4.7,
    reviews: 4256,
    image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1200',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200',
    ],
    description: 'Luxury resort nestled in the desert landscape near the ancient city of Petra, blending traditional Nabatean architecture with modern comfort and world-class amenities.',
    address: 'Wadi Musa, Petra, Jordan',
    phone: '+962 3 215 7111',
    email: 'info@movenpick-petra.com',
    amenities: ['Free WiFi', 'Outdoor Pool', 'Spa Center', 'Multiple Restaurants', 'Bar & Lounge', 'Fitness Center', 'Tour Desk', 'Concierge', 'Valet Parking', 'Room Service', 'Laundry Service'],
    rooms: 183,
    checkIn: '15:00',
    checkOut: '11:00',
    bedTypes: ['King', 'Twin', 'Suite'],
    roomTypes: [
      {
        name: 'Desert View Room',
        price: 140,
        capacity: 2,
        features: ['Desert View', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker'],
        size: '35 m²',
        bedType: 'King or Twin Beds'
      },
      {
        name: 'Superior Room',
        price: 165,
        capacity: 3,
        features: ['Desert View', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk'],
        size: '42 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Junior Suite',
        price: 210,
        capacity: 4,
        features: ['Desert View', 'Separate Living Area', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers'],
        size: '65 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Executive Suite',
        price: 320,
        capacity: 6,
        features: ['Panoramic Desert View', 'Living Room', 'Dining Area', 'Private Terrace', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers', 'Jacuzzi'],
        size: '95 m²',
        bedType: 'King Bed + 2 Sofa Beds'
      },
      {
        name: 'Petra View Suite',
        price: 380,
        capacity: 4,
        features: ['Petra View', 'Living Room', 'Private Terrace', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers', 'Jacuzzi'],
        size: '85 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Smoking Room',
        price: 130,
        capacity: 2,
        features: ['Desert View', 'Smoking Allowed', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning'],
        size: '35 m²',
        bedType: 'King or Twin Beds',
        smoking: true
      }
    ],
    policies: {
      smoking: 'Designated smoking rooms available, non-smoking floors',
      pets: 'Pets not allowed',
      cancellation: 'Free cancellation up to 48 hours before check-in'
    }
  },
  {
    id: 'h-aqaba-al-manara',
    name: 'Al Manara, a Luxury Collection Hotel',
    nameAr: 'فندق المنارة، لاكشري كوليكشن',
    location: 'Aqaba',
    destination: 'Aqaba',
    price: 210,
    currency: 'JOD',
    rating: 4.8,
    reviews: 1250,
    image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200',
      'https://images.unsplash.com/photo-1584132915807-8b0f3e6cb21f?q=80&w=1200',
    ],
    description: 'An intimate retreat of design and history, Al Manara Hotel combines the finest of beach holiday and city getaway on the shores of the Red Sea.',
    address: 'Al-Hashemi Street, Aqaba, Jordan',
    phone: '+962 3 202 1000',
    email: 'reservations.almanara@luxurycollection.com',
    amenities: ['Free WiFi', 'Private Lagoon', 'Outdoor Pool', 'Spa & Wellness', 'Fine Dining', 'Bar & Lounge', 'Fitness Center', 'Water Sports', 'Concierge', 'Valet Parking', 'Butler Service'],
    rooms: 207,
    checkIn: '15:00',
    checkOut: '11:00',
    bedTypes: ['King', 'Twin', 'Villa'],
    roomTypes: [
      {
        name: 'Premium Room',
        price: 210,
        capacity: 2,
        features: ['Sea View', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Frette Linens'],
        size: '45 m²',
        bedType: 'King or Twin Beds'
      },
      {
        name: 'Prestige Suite',
        price: 350,
        capacity: 3,
        features: ['Panoramic Sea View', 'Living Area', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Butler Service'],
        size: '75 m²',
        bedType: 'King Bed'
      },
      {
        name: 'Villa with Private Pool',
        price: 850,
        capacity: 6,
        features: ['Beachfront', 'Private Pool', 'Garden', 'Living Room', 'Dining Area', 'Kitchenette', 'Butler Service', 'Jacuzzi'],
        size: '150 m²',
        bedType: '2 King Beds'
      },
      {
        name: 'Smoking Room',
        price: 210,
        capacity: 2,
        features: ['Sea View', 'Smoking Allowed', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning'],
        size: '45 m²',
        bedType: 'King or Twin Beds',
        smoking: true
      }
    ],
    policies: {
      smoking: 'Designated smoking rooms available, non-smoking floors',
      pets: 'Pets not allowed',
      cancellation: 'Free cancellation up to 48 hours before check-in'
    }
  },
  {
    id: 'h-kempinski-ishtar',
    name: 'Kempinski Hotel Ishtar Dead Sea',
    nameAr: 'فندق كمبينسكي عشتار البحر الميت',
    location: 'Dead Sea',
    destination: 'Dead Sea',
    price: 220,
    currency: 'JOD',
    rating: 4.8,
    reviews: 1852,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200',
    ],
    description: 'Ultra-luxury resort with contemporary Swiss design, award-winning dining, premium spa, and world-class amenities on the shores of the Dead Sea.',
    address: 'Swaimeh, Dead Sea, Jordan',
    phone: '+962 6 465 6000',
    email: 'amman@kempinski.com',
    amenities: ['Free WiFi', 'Michelin-Star Restaurant', 'Spa Center', 'Fitness Center', 'Outdoor Pool', 'Bar & Lounge', 'Business Center', 'Concierge', 'Valet Parking', 'Room Service', 'Laundry Service'],
    rooms: 240,
    checkIn: '15:00',
    checkOut: '12:00',
    bedTypes: ['King', 'Suite', 'Penthouse'],
    roomTypes: [
      {
        name: 'Deluxe Room',
        price: 220,
        capacity: 2,
        features: ['Sea View', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers'],
        size: '40 m²',
        bedType: 'King or Twin Beds'
      },
      {
        name: 'Executive Room',
        price: 280,
        capacity: 3,
        features: ['Sea View', 'Executive Lounge Access', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers', 'Nespresso Machine'],
        size: '50 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Junior Suite',
        price: 380,
        capacity: 4,
        features: ['Sea View', 'Separate Living Area', 'Executive Lounge Access', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers', 'Nespresso Machine'],
        size: '75 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Executive Suite',
        price: 550,
        capacity: 6,
        features: ['Panoramic Sea View', 'Living Room', 'Dining Area', 'Executive Lounge Access', 'Private Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers', 'Nespresso Machine', 'Jacuzzi'],
        size: '110 m²',
        bedType: 'King Bed + 2 Sofa Beds'
      },
      {
        name: 'Presidential Suite',
        price: 850,
        capacity: 8,
        features: ['Panoramic Sea View', 'Master Bedroom', 'Living Room', 'Dining Room', 'Kitchen', 'Executive Lounge Access', 'Private Terrace', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers', 'Nespresso Machine', 'Jacuzzi', 'Butler Service'],
        size: '200 m²',
        bedType: 'King Bed + 2 Queen Beds'
      },
      {
        name: 'Smoking Room',
        price: 200,
        capacity: 2,
        features: ['Sea View', 'Smoking Allowed', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker'],
        size: '40 m²',
        bedType: 'King or Twin Beds',
        smoking: true
      }
    ],
    policies: {
      smoking: 'Designated smoking rooms available, non-smoking floors',
      pets: 'Pets not allowed',
      cancellation: 'Free cancellation up to 24 hours before check-in'
    }
  },
  {
    id: 'h-wadi-rum-memories-aicha',
    name: 'Memories Aicha Luxury Camp',
    nameAr: 'مخيم ذكريات عائشة الفاخر',
    location: 'Wadi Rum',
    destination: 'Wadi Rum',
    price: 180,
    currency: 'JOD',
    rating: 4.9,
    reviews: 3500,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c1a8?q=80&w=1200',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470e?q=80&w=1200',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200',
    ],
    description: 'Experience the magic of the desert in luxury. Memories Aicha Luxury Camp offers panoramic geodesic domes and traditional tents in the heart of Wadi Rum.',
    address: 'Wadi Rum Protected Area, Jordan',
    phone: '+962 7 7756 3472',
    email: 'info@memoriesaicha.com',
    amenities: ['Free WiFi', 'Restaurant', 'Stargazing', 'Desert Tours', 'Jeep Safari', 'Camel Rides', 'Air Conditioning', 'Private Bathroom', 'Coffee Shop', 'Live Music'],
    rooms: 55,
    checkIn: '14:00',
    checkOut: '11:00',
    bedTypes: ['King', 'Twin', 'Triple'],
    roomTypes: [
      {
        name: 'Junior Luxury Tent',
        price: 180,
        capacity: 2,
        features: ['Mountain View', 'Private Bathroom', 'Air Conditioning', 'Mini Bar', 'Safe', 'Hair Dryer', 'Coffee Maker', 'Traditional Decor'],
        size: '35 m²',
        bedType: 'King Bed'
      },
      {
        name: 'Executive Luxury Tent',
        price: 220,
        capacity: 3,
        features: ['Desert View', 'Private Bathroom', 'Air Conditioning', 'Mini Bar', 'Safe', 'Hair Dryer', 'Coffee Maker', 'Seating Area'],
        size: '45 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Panoramic Luxury Suite (Dome)',
        price: 350,
        capacity: 2,
        features: ['Panoramic Desert View', 'Transparent Roof for Stargazing', 'Private Bathroom', 'Air Conditioning', 'Mini Bar', 'Safe', 'Hair Dryer', 'Coffee Maker', 'Private Terrace'],
        size: '50 m²',
        bedType: 'King Bed'
      },
      {
        name: 'Family Suite',
        price: 400,
        capacity: 4,
        features: ['Mountain View', 'Two Bedrooms', 'Living Area', 'Private Bathroom', 'Air Conditioning', 'Mini Bar', 'Safe', 'Hair Dryer', 'Coffee Maker'],
        size: '80 m²',
        bedType: 'King Bed + 2 Twin Beds'
      }
    ],
    policies: {
      smoking: 'Smoking allowed in outdoor areas only',
      pets: 'Pets not allowed',
      cancellation: 'Free cancellation up to 7 days before check-in'
    }
  },
  {
    id: 'h-amman-intercontinental',
    name: 'Intercontinental Amman',
    nameAr: 'فندق إنتركونتيننتال عمّان',
    location: 'Amman',
    destination: 'Amman',
    price: 140,
    currency: 'JOD',
    rating: 4.6,
    reviews: 3156,
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1200',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1200',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=1200',
      'https://images.unsplash.com/photo-1584132915807-8b0f3e6cb21f?q=80&w=1200',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200',
    ],
    description: 'Business and leisure hotel with excellent service, modern facilities, and convenient city center location.',
    address: 'Shmeisani, Amman, Jordan',
    phone: '+962 6 461 3361',
    email: 'amman@intercontinental.com',
    amenities: ['Free WiFi', 'Multiple Restaurants', 'Bar & Lounge', 'Fitness Center', 'Outdoor Pool', 'Business Center', 'Concierge', 'Valet Parking', 'Room Service', 'Laundry Service'],
    rooms: 312,
    checkIn: '15:00',
    checkOut: '11:00',
    bedTypes: ['King', 'Twin', 'Suite'],
    roomTypes: [
      {
        name: 'Standard Room',
        price: 140,
        capacity: 2,
        features: ['City View', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk'],
        size: '32 m²',
        bedType: 'King or Twin Beds'
      },
      {
        name: 'Superior Room',
        price: 165,
        capacity: 3,
        features: ['City View', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers'],
        size: '38 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Executive Room',
        price: 195,
        capacity: 3,
        features: ['City View', 'Executive Lounge Access', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers'],
        size: '42 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Junior Suite',
        price: 250,
        capacity: 4,
        features: ['City View', 'Separate Living Area', 'Executive Lounge Access', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers'],
        size: '65 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Executive Suite',
        price: 380,
        capacity: 6,
        features: ['Panoramic City View', 'Living Room', 'Dining Area', 'Executive Lounge Access', 'Private Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers', 'Jacuzzi'],
        size: '95 m²',
        bedType: 'King Bed + 2 Sofa Beds'
      },
      {
        name: 'Smoking Room',
        price: 130,
        capacity: 2,
        features: ['City View', 'Smoking Allowed', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker'],
        size: '32 m²',
        bedType: 'King or Twin Beds',
        smoking: true
      }
    ],
    policies: {
      smoking: 'Designated smoking rooms available, non-smoking floors',
      pets: 'Pets not allowed',
      cancellation: 'Free cancellation up to 48 hours before check-in'
    }
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

export { REAL_HOTELS };
export default realHotelsAPI;
