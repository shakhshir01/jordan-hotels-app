import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { hotelAPI } from "../services/api";

const DESTINATION_INFO = {
  'Dead Sea': {
    desc: 'Float effortlessly in the mineral-rich waters of the lowest point on Earth.',
    descAr: 'اختبر أخفض نقطة على سطح الأرض بمياه غنية بالمعادن',
    nameAr: 'البحر الميت',
    emoji: '💧',
  },
  'Amman': {
    desc: 'A mesmerizing blend of ancient Roman history and vibrant modern culture.',
    descAr: 'العاصمة بتاريخ روماني وأسواق نابضة بالحياة وثقافة حديثة',
    nameAr: 'عمّان',
    emoji: '🏛️',
  },
  'Petra': {
    desc: 'Walk through history in the Rose City, a world wonder carved into red stone.',
    descAr: 'موقع تراث عالمي لليونسكو — المدينة الوردية الأسطورية المنحوتة في الصخر',
    nameAr: 'البتراء',
    emoji: '🪨',
  },
  'Aqaba': {
    desc: 'Dive into the crystal-clear waters and vibrant coral reefs of the Red Sea.',
    descAr: 'منتجع شاطئي على البحر الأحمر مع الغوص والرياضات المائية وشعاب مرجانية خلابة',
    nameAr: 'العقبة',
    emoji: '🏖️',
  },
  'Wadi Rum': {
    desc: 'Lose yourself in the Martian landscapes of the Valley of the Moon.',
    descAr: 'مناظر صحراوية تشبه سطح المريخ ومخيمات بدوية وتجارب مغامرة',
    nameAr: 'وادي رم',
    emoji: '🏜️',
  },
};

export default function Destinations() {
  const navigate = useNavigate();
  const [apiDestinations, setApiDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  useEffect(() => {
    const loadHotels = async () => {
      try {
        setError("");
        const destinations = await hotelAPI.getDestinations();
        setApiDestinations(Array.isArray(destinations) ? destinations : []);
      } catch (e) {
        setApiDestinations([]);
        setError(e?.message || "Failed to load destinations");
      } finally {
        setLoading(false);
      }
    };
    loadHotels();
  }, []);

  // Get unique destinations
  const destinations = (Array.isArray(apiDestinations) ? apiDestinations : [])
    .map((d) => {
      const rawName = d?.name || d?.title || d?.destination || '';
      const name = String(rawName).trim() || 'Jordan';
      const countFromApi = typeof d?.count === 'number' ? d.count : null;
      const countFromIds = Array.isArray(d?.hotels) ? d.hotels.length : null;

      return {
        id: d?.id || `dest-${name.toLowerCase().replace(/\s+/g, '-')}`,
        query: name,
        name: isArabic ? (DESTINATION_INFO[name]?.nameAr || name) : name,
        count: typeof countFromApi === 'number' ? countFromApi : typeof countFromIds === 'number' ? countFromIds : 0,
        emoji: DESTINATION_INFO[name]?.emoji,
        desc: isArabic
          ? (DESTINATION_INFO[name]?.descAr || d?.description || DESTINATION_INFO[name]?.desc)
          : (d?.description || DESTINATION_INFO[name]?.desc),
      };
    })
    .filter((d) => d && d.query);

  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-4 sm:px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">{t('pages.destinations.hero.kicker', 'Explore Jordan')}</div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6 tracking-tight">{t('pages.destinations.hero.title', 'Journey Through Time')}</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95 leading-relaxed">
            {t('pages.destinations.hero.subtitle', 'From the bustling streets of Amman to the silent majesty of Wadi Rum, discover destinations that will capture your heart.')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-jordan-blue" size={48} />
          </div>
        )}
        {!loading && error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((d) => (
              <article key={d.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition group">
                <div className="h-48 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition">
                  <div className="text-white text-center">
                    <div className="text-6xl">{d.emoji}</div>
                    <div className="text-sm font-medium mt-2 bg-black/20 px-3 py-1 rounded-full inline-block">{t('pages.destinations.hotelsCount', { count: d.count })}</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{d.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">{d.desc}</p>
                  <button 
                    onClick={() => navigate(`/search?destination=${d.query}`)}
                    className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-semibold">
                    {t('pages.destinations.exploreHotels')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
