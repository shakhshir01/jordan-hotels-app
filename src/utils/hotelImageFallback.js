export const GENERIC_HOTEL_FALLBACK_IMAGES = [
  // (#49–#62) Generic hotel images you approved as usable anywhere
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1200",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1200",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1200",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1200",
  "https://images.unsplash.com/photo-1584132915807-8b0f3e6cb21f?q=80&w=1200",
  "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1200",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1200",
  "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1200",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1200",
  "https://images.unsplash.com/photo-1478860409698-8707f313ee8b?q=80&w=1200",
];

const hashString = (value) => {
  const str = String(value ?? "");
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const getGenericHotelFallbackImage = (key = "") => {
  if (!GENERIC_HOTEL_FALLBACK_IMAGES.length) return "";
  const idx = hashString(key) % GENERIC_HOTEL_FALLBACK_IMAGES.length;
  return GENERIC_HOTEL_FALLBACK_IMAGES[idx];
};

/**
 * Returns an onError handler that:
 * 1) swaps to a stable generic fallback image (pool #49–#62)
 * 2) optionally swaps to a final fallback (e.g., an inline SVG data URI)
 */
export const createHotelImageOnErrorHandler = (key, finalFallbackSrc = "") => {
  const stableFallback = getGenericHotelFallbackImage(key);

  return (e) => {
    const img = e?.currentTarget;
    if (!img) return;

    const step = img.dataset.hotelFallbackStep || "0";

    if (step === "0" && stableFallback) {
      img.dataset.hotelFallbackStep = "1";
      img.src = stableFallback;
      return;
    }

    if (step === "1" && finalFallbackSrc) {
      img.dataset.hotelFallbackStep = "2";
      img.onerror = null;
      img.src = finalFallbackSrc;
    }
  };
};
