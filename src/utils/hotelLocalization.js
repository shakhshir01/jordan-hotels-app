export const getHotelDisplayName = (hotel, language) => {
  const lang = String(language || '').toLowerCase();
  const isArabic = lang.startsWith('ar');

  if (isArabic) {
    const arabicName = hotel?.nameAr || hotel?.name_ar;
    if (typeof arabicName === 'string' && arabicName.trim()) return arabicName;
  }

  const name = hotel?.name;
  return typeof name === 'string' ? name : '';
};
