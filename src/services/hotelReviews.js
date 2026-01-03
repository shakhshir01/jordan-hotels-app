/**
 * Hotel Reviews Service - Mock data for reviews and ratings
 */

export const HOTEL_REVIEWS = {
  'h-dead-sea-marriott': [
    {
      id: 1,
      author: 'Sarah Johnson',
      rating: 5,
      date: '2024-12-20',
      title: 'Unforgettable Dead Sea Experience',
      text: 'The Marriott exceeded all expectations! The spa treatments were incredible, and the views of the Dead Sea were breathtaking. Staff was attentive and friendly.',
      verified: true,
      helpful: 142,
      images: ['marriott-review-1.jpg']
    },
    {
      id: 2,
      author: 'Ahmed Al-Rashid',
      rating: 5,
      date: '2024-12-10',
      title: 'Perfect for a romantic getaway',
      text: 'Amazing location with stunning sunsets. The thermal pools are therapeutic and the restaurants serve excellent international cuisine.',
      verified: true,
      helpful: 89
    },
    {
      id: 3,
      author: 'Emma Wilson',
      rating: 4,
      date: '2024-11-28',
      title: 'Great hotel, minor issues',
      text: 'Very comfortable rooms and excellent service. Only minor complaint was the WiFi was slow in some areas.',
      verified: true,
      helpful: 45
    },
  ],
  'h-movenpick-deadsea': [
    {
      id: 1,
      author: 'Fatima Al-Masri',
      rating: 5,
      date: '2024-12-15',
      title: 'Best all-inclusive experience',
      text: 'Everything was included and the quality was outstanding. The beach access was perfect for floating in the Dead Sea.',
      verified: true,
      helpful: 156
    },
    {
      id: 2,
      author: 'Michael Chen',
      rating: 5,
      date: '2024-12-05',
      title: 'Phenomenal wellness resort',
      text: 'World-class spa and health facilities. The mud treatments from the Dead Sea were the highlight of our trip.',
      verified: true,
      helpful: 128
    },
  ],
  'h-amman-grand-hyatt': [
    {
      id: 1,
      author: 'David Brown',
      rating: 5,
      date: '2024-12-18',
      title: 'Luxurious city escape',
      text: 'Perfect base for exploring Amman. Modern rooms, excellent restaurant, and very helpful concierge.',
      verified: true,
      helpful: 97
    },
    {
      id: 2,
      author: 'Leila Nassif',
      rating: 4,
      date: '2024-12-01',
      title: 'Great location and service',
      text: 'Walking distance to shops and restaurants. Room was spacious and comfortable.',
      verified: true,
      helpful: 63
    },
  ],
  'h-petra-movenpick': [
    {
      id: 1,
      author: 'John Patterson',
      rating: 5,
      date: '2024-12-10',
      title: 'Gateway to Petra',
      text: 'Couldn\'t ask for a better location near Petra. The hotel is beautiful and the staff helped arrange wonderful tours.',
      verified: true,
      helpful: 201
    },
  ],
  'h-aqaba-hilton': [
    {
      id: 1,
      author: 'Sophia Rodriguez',
      rating: 5,
      date: '2024-12-12',
      title: 'Beach paradise',
      text: 'Stunning beachfront property. Perfect for diving and snorkeling. Rooms have amazing sea views.',
      verified: true,
      helpful: 134
    },
  ],
  'h-amman-kempinski': [
    {
      id: 1,
      author: 'Klaus Mueller',
      rating: 5,
      date: '2024-12-14',
      title: 'Five-star excellence',
      text: 'Premium luxury at its finest. The Michelin-star restaurant is world-class. Every detail is perfect.',
      verified: true,
      helpful: 178
    },
  ],
  'h-wadi-rum-luxury': [
    {
      id: 1,
      author: 'Isabella Santos',
      rating: 5,
      date: '2024-12-16',
      title: 'Desert magic',
      text: 'Once in a lifetime experience. Sleeping under the stars in a luxury tent was unforgettable. The camel trek at sunrise was magical.',
      verified: true,
      helpful: 245
    },
  ],
  'h-amman-intercontinental': [
    {
      id: 1,
      author: 'James Wilson',
      rating: 4,
      date: '2024-12-11',
      title: 'Comfortable business hotel',
      text: 'Great for business travelers. Excellent facilities and convenient location. Good restaurant.',
      verified: true,
      helpful: 71
    },
  ],
};

export const getHotelReviews = (hotelId) => {
  return HOTEL_REVIEWS[hotelId] || [];
};

export const getAverageRating = (hotelId) => {
  const reviews = HOTEL_REVIEWS[hotelId];
  if (!reviews || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.length).toFixed(1);
};

export const getRatingBreakdown = (hotelId) => {
  const reviews = HOTEL_REVIEWS[hotelId] || [];
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    breakdown[r.rating]++;
  });
  return breakdown;
};
