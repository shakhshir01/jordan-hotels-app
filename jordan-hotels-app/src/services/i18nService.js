// Multi-language Support
export const translations = {
  en: {
    header: 'Welcome to Visit-Jo',
    search: 'Search Hotels',
    destinations: 'Destinations',
    bookings: 'My Bookings',
    language: 'Language',
    currency: 'JOD',
    price: 'Price',
    rating: 'Rating',
    reviews: 'Reviews',
    amenities: 'Amenities',
    checkout: 'Checkout',
    book: 'Book Now',
    viewDetails: 'View Details',
    noHotels: 'No hotels found',
    night: 'per night',
    selectDate: 'Select Date',
    guests: 'Guests',
    weather: 'Weather',
    packingTips: 'Packing Tips',
    accessibility: 'Accessibility',
  },
  ar: {
    header: 'مرحبا بك في Visit-Jo',
    search: 'ابحث عن الفنادق',
    destinations: 'الوجهات',
    bookings: 'حجوزاتي',
    language: 'اللغة',
    currency: 'دينار',
    price: 'السعر',
    rating: 'التقييم',
    reviews: 'التقييمات',
    amenities: 'الخدمات',
    checkout: 'الدفع',
    book: 'احجز الآن',
    viewDetails: 'عرض التفاصيل',
    noHotels: 'لم يتم العثور على فنادق',
    night: 'لليلة الواحدة',
    selectDate: 'حدد التاريخ',
    guests: 'النزلاء',
    weather: 'الطقس',
    packingTips: 'نصائح التعبئة',
    accessibility: 'إمكانية الوصول',
  }
};

export const useTranslation = (lang = 'en') => {
  return (key) => translations[lang]?.[key] || key;
};
