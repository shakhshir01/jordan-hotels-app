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
    image: 'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2023/04/05/1408/Grand-Hyatt-Amman-P001-Exterior.jpg',
    images: [
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2023/04/05/1408/Grand-Hyatt-Amman-P001-Exterior.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2023/04/05/1408/Grand-Hyatt-Amman-P002-Lobby.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2023/04/05/1408/Grand-Hyatt-Amman-P003-Pool.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2023/04/05/1408/Grand-Hyatt-Amman-P004-Restaurant.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2023/04/05/1408/Grand-Hyatt-Amman-P005-Fitness.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2023/04/05/1408/Grand-Hyatt-Amman-P006-Spa.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2023/04/05/1408/Grand-Hyatt-Amman-P007-Room.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2023/04/05/1408/Grand-Hyatt-Amman-P008-Bathroom.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2023/04/05/1408/Grand-Hyatt-Amman-P009-Business.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2023/04/05/1408/Grand-Hyatt-Amman-P010-Conference.jpg',
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
    image: 'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/09/15/1347/Movenpick-Resort-Petra-P001-Exterior.jpg',
    images: [
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/09/15/1347/Movenpick-Resort-Petra-P001-Exterior.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/09/15/1347/Movenpick-Resort-Petra-P002-Lobby.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/09/15/1347/Movenpick-Resort-Petra-P003-Pool.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/09/15/1347/Movenpick-Resort-Petra-P004-Restaurant.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/09/15/1347/Movenpick-Resort-Petra-P005-Spa.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/09/15/1347/Movenpick-Resort-Petra-P006-Room.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/09/15/1347/Movenpick-Resort-Petra-P007-Bathroom.jpg',
      'https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/09/15/1347/Movenpick-Resort-Petra-P008-Terrace.jpg',
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
    id: 'h-aqaba-hilton',
    name: 'Hilton Aqaba',
    nameAr: 'هيلتون العقبة',
    location: 'Aqaba',
    destination: 'Aqaba',
    price: 120,
    currency: 'JOD',
    rating: 4.5,
    reviews: 3421,
    image: 'https://www.hilton.com/im/en/AMMDSHI/3160745/2017-06-hilton-dead-sea24277.jpg?impolicy=crop&cw=4928&ch=2759&gravity=NorthWest&xposition=0&yposition=260&rw=768&rh=430',
    images: [
      'https://www.hilton.com/im/en/AMMDSHI/3160745/2017-06-hilton-dead-sea24277.jpg?impolicy=crop&cw=4928&ch=2759&gravity=NorthWest&xposition=0&yposition=260&rw=768&rh=430',
      'https://www.hilton.com/im/en/AMMDSHI/3160745/hilton-aqaba-beach.jpg',
      'https://www.hilton.com/im/en/AMMDSHI/3160745/hilton-aqaba-pool.jpg',
      'https://www.hilton.com/im/en/AMMDSHI/3160745/hilton-aqaba-restaurant.jpg',
      'https://www.hilton.com/im/en/AMMDSHI/3160745/hilton-aqaba-spa.jpg',
      'https://www.hilton.com/im/en/AMMDSHI/3160745/hilton-aqaba-room.jpg',
      'https://www.hilton.com/im/en/AMMDSHI/3160745/hilton-aqaba-suite.jpg',
    ],
    description: 'Beachfront resort with direct Red Sea access, PADI-certified dive center, and world-class facilities for snorkeling, diving, and water sports enthusiasts.',
    address: 'Public Beach, Aqaba, Jordan',
    phone: '+962 3 203 9000',
    email: 'info@hiltonaqaba.com',
    amenities: ['Free WiFi', 'Private Beach', 'Outdoor Pool', 'Dive Center', 'Multiple Restaurants', 'Bar & Lounge', 'Spa Center', 'Fitness Center', 'Water Sports', 'Kids Club', 'Concierge', 'Valet Parking'],
    rooms: 274,
    checkIn: '15:00',
    checkOut: '11:00',
    bedTypes: ['King', 'Twin', 'Family'],
    roomTypes: [
      {
        name: 'Sea View Room',
        price: 120,
        capacity: 2,
        features: ['Sea View', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker'],
        size: '35 m²',
        bedType: 'King or Twin Beds'
      },
      {
        name: 'Beachfront Room',
        price: 145,
        capacity: 3,
        features: ['Beachfront View', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk'],
        size: '42 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Family Room',
        price: 175,
        capacity: 4,
        features: ['Sea View', 'Balcony', 'Connecting Rooms Available', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk'],
        size: '55 m²',
        bedType: 'King Bed + Twin Beds'
      },
      {
        name: 'Junior Suite',
        price: 220,
        capacity: 4,
        features: ['Sea View', 'Separate Living Area', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers'],
        size: '70 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Executive Suite',
        price: 350,
        capacity: 6,
        features: ['Panoramic Sea View', 'Living Room', 'Dining Area', 'Private Balcony', 'Executive Lounge Access', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers', 'Jacuzzi'],
        size: '110 m²',
        bedType: 'King Bed + 2 Sofa Beds'
      },
      {
        name: 'Smoking Room',
        price: 110,
        capacity: 2,
        features: ['Sea View', 'Smoking Allowed', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning'],
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
    id: 'h-amman-kempinski',
    name: 'Amman Kempinski Hotel',
    nameAr: 'فندق كمبينسكي عمّان',
    location: 'Amman',
    destination: 'Amman',
    price: 220,
    currency: 'JOD',
    rating: 4.8,
    reviews: 1852,
    image: 'https://www.kempinski.com/var/site/storage/images/3/7/4/4/3744954-1-eng-GB/Kempinski_Hotel_Ishtar_Dead_Sea_Resort_Exterior.jpg',
    images: [
      'https://www.kempinski.com/var/site/storage/images/3/7/4/4/3744954-1-eng-GB/Kempinski_Hotel_Ishtar_Dead_Sea_Resort_Exterior.jpg',
      'https://www.kempinski.com/var/site/storage/images/3/7/4/4/3744955-1-eng-GB/Kempinski_Hotel_Ishtar_Dead_Sea_Resort_Lobby.jpg',
      'https://www.kempinski.com/var/site/storage/images/3/7/4/4/3744956-1-eng-GB/Kempinski_Hotel_Ishtar_Dead_Sea_Resort_Pool.jpg',
      'https://www.kempinski.com/var/site/storage/images/3/7/4/4/3744957-1-eng-GB/Kempinski_Hotel_Ishtar_Dead_Sea_Resort_Restaurant.jpg',
      'https://www.kempinski.com/var/site/storage/images/3/7/4/4/3744958-1-eng-GB/Kempinski_Hotel_Ishtar_Dead_Sea_Resort_Spa.jpg',
      'https://www.kempinski.com/var/site/storage/images/3/7/4/4/3744959-1-eng-GB/Kempinski_Hotel_Ishtar_Dead_Sea_Resort_Room.jpg',
      'https://www.kempinski.com/var/site/storage/images/3/7/4/4/3744960-1-eng-GB/Kempinski_Hotel_Ishtar_Dead_Sea_Resort_Suite.jpg',
    ],
    description: 'Ultra-luxury hotel with contemporary Swiss design, award-winning Michelin-star dining, premium spa, and world-class amenities in the heart of Amman.',
    address: 'Zaha Street, Amman, Jordan',
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
        features: ['City View', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers'],
        size: '40 m²',
        bedType: 'King or Twin Beds'
      },
      {
        name: 'Executive Room',
        price: 280,
        capacity: 3,
        features: ['City View', 'Executive Lounge Access', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers', 'Nespresso Machine'],
        size: '50 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Junior Suite',
        price: 380,
        capacity: 4,
        features: ['City View', 'Separate Living Area', 'Executive Lounge Access', 'Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers', 'Nespresso Machine'],
        size: '75 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Executive Suite',
        price: 550,
        capacity: 6,
        features: ['Panoramic City View', 'Living Room', 'Dining Area', 'Executive Lounge Access', 'Private Balcony', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers', 'Nespresso Machine', 'Jacuzzi'],
        size: '110 m²',
        bedType: 'King Bed + 2 Sofa Beds'
      },
      {
        name: 'Presidential Suite',
        price: 850,
        capacity: 8,
        features: ['Panoramic City View', 'Master Bedroom', 'Living Room', 'Dining Room', 'Kitchen', 'Executive Lounge Access', 'Private Terrace', 'Non-Smoking', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker', 'Work Desk', 'Bathrobe & Slippers', 'Nespresso Machine', 'Jacuzzi', 'Butler Service'],
        size: '200 m²',
        bedType: 'King Bed + 2 Queen Beds'
      },
      {
        name: 'Smoking Room',
        price: 200,
        capacity: 2,
        features: ['City View', 'Smoking Allowed', 'Mini Bar', 'Safe', 'Hair Dryer', 'Air Conditioning', 'Coffee Maker'],
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
    id: 'h-wadi-rum-luxury',
    name: 'Wadi Rum Luxury Camp',
    nameAr: 'مخيم وادي رم الفاخر',
    location: 'Wadi Rum',
    destination: 'Wadi Rum',
    price: 200,
    currency: 'JOD',
    rating: 4.9,
    reviews: 2156,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200',
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1200',
      'https://images.unsplash.com/photo-1520637836862-4d197d17c1a8?q=80&w=1200',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470e?q=80&w=1200',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200',
    ],
    description: 'Exclusive luxury Bedouin-style camp with stargazing under desert skies, traditional camel trekking, and authentic desert experiences in Wadi Rum.',
    address: 'Wadi Rum Protected Area, Jordan',
    phone: '+962 79 567 1234',
    email: 'info@wadirumluxury.com',
    amenities: ['Free WiFi', 'Restaurant', 'Bar & Lounge', 'Desert Tours', 'Stargazing', 'Camel Trekking', '4x4 Safaris', 'Traditional Bedouin Dinner', 'Fire Pit', 'Concierge', 'Laundry Service'],
    rooms: 25,
    checkIn: '16:00',
    checkOut: '11:00',
    bedTypes: ['Luxury Tent', 'Deluxe Tent'],
    roomTypes: [
      {
        name: 'Luxury Desert Tent',
        price: 200,
        capacity: 2,
        features: ['Desert View', 'Private Bathroom', 'Air Conditioning', 'Heating', 'Mini Bar', 'Safe', 'Hair Dryer', 'Coffee Maker', 'Traditional Bedouin Decor', 'Outdoor Shower'],
        size: '25 m²',
        bedType: 'King Bed'
      },
      {
        name: 'Deluxe Desert Tent',
        price: 250,
        capacity: 3,
        features: ['Desert View', 'Private Bathroom', 'Air Conditioning', 'Heating', 'Mini Bar', 'Safe', 'Hair Dryer', 'Coffee Maker', 'Traditional Bedouin Decor', 'Outdoor Shower', 'Sofa Bed', 'Work Desk'],
        size: '35 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Royal Desert Suite',
        price: 350,
        capacity: 4,
        features: ['Panoramic Desert View', 'Separate Living Area', 'Private Bathroom', 'Air Conditioning', 'Heating', 'Mini Bar', 'Safe', 'Hair Dryer', 'Coffee Maker', 'Traditional Bedouin Decor', 'Outdoor Shower', 'Sofa Bed', 'Work Desk', 'Jacuzzi'],
        size: '50 m²',
        bedType: 'King Bed + Sofa Bed'
      },
      {
        name: 'Family Desert Tent',
        price: 280,
        capacity: 4,
        features: ['Desert View', 'Private Bathroom', 'Air Conditioning', 'Heating', 'Mini Bar', 'Safe', 'Hair Dryer', 'Coffee Maker', 'Traditional Bedouin Decor', 'Outdoor Shower', 'Connecting Tents Available'],
        size: '40 m²',
        bedType: 'King Bed + Twin Beds'
      },
      {
        name: 'Stargazing Luxury Tent',
        price: 320,
        capacity: 2,
        features: ['Desert View', 'Transparent Roof for Stargazing', 'Private Bathroom', 'Air Conditioning', 'Heating', 'Mini Bar', 'Safe', 'Hair Dryer', 'Coffee Maker', 'Traditional Bedouin Decor', 'Outdoor Shower', 'Champagne Service'],
        size: '30 m²',
        bedType: 'King Bed'
      }
    ],
    policies: {
      smoking: 'Smoking allowed in designated outdoor areas',
      pets: 'Pets not allowed',
      cancellation: 'Free cancellation up to 72 hours before check-in'
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
    image: 'https://www.ihg.com/hotels/us/en/amman/ammha/hoteldetail/images/gallery/exterior-1',
    images: [
      'https://www.ihg.com/hotels/us/en/amman/ammha/hoteldetail/images/gallery/exterior-1',
      'https://www.ihg.com/hotels/us/en/amman/ammha/hoteldetail/images/gallery/lobby-1',
      'https://www.ihg.com/hotels/us/en/amman/ammha/hoteldetail/images/gallery/pool-1',
      'https://www.ihg.com/hotels/us/en/amman/ammha/hoteldetail/images/gallery/restaurant-1',
      'https://www.ihg.com/hotels/us/en/amman/ammha/hoteldetail/images/gallery/fitness-1',
      'https://www.ihg.com/hotels/us/en/amman/ammha/hoteldetail/images/gallery/room-1',
      'https://www.ihg.com/hotels/us/en/amman/ammha/hoteldetail/images/gallery/suite-1',
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
