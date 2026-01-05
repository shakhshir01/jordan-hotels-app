import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import realHotelsAPI from "../services/realHotelsData";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const DESTINATION_INFO = {
  'Dead Sea': {
    desc: 'Experience the lowest point on Earth with mineral-rich waters',
    descAr: 'اختبر أخفض نقطة على سطح الأرض بمياه غنية بالمعادن',
    nameAr: 'البحر الميت',
    emoji: '💧',
  },
  'Amman': {
    desc: 'Capital city with Roman history, vibrant markets, and modern culture',
    descAr: 'العاصمة بتاريخ روماني وأسواق نابضة بالحياة وثقافة حديثة',
    nameAr: 'عمّان',
    emoji: '🏛️',
  },
  'Petra': {
    desc: 'UNESCO World Heritage site - the legendary rose-red city carved in stone',
    descAr: 'موقع تراث عالمي لليونسكو — المدينة الوردية الأسطورية المنحوتة في الصخر',
    nameAr: 'البتراء',
    emoji: '🪨',
  },
  'Aqaba': {
    desc: 'Red Sea beach resort with diving, water sports and stunning coral reefs',
    descAr: 'منتجع شاطئي على البحر الأحمر مع الغوص والرياضات المائية وشعاب مرجانية خلابة',
    nameAr: 'العقبة',
    emoji: '🏖️',
  },
  'Wadi Rum': {
    desc: 'Desert landscape of Mars-like terrain, Bedouin camps and adventure',
    descAr: 'مناظر صحراوية تشبه سطح المريخ ومخيمات بدوية وتجارب مغامرة',
    nameAr: 'وادي رم',
    emoji: '🏜️',
  },
};

export default function Destinations() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  useEffect(() => {
    const loadHotels = async () => {
      const data = await realHotelsAPI.getAllHotels();
      setHotels(data);
      setLoading(false);
    };
    loadHotels();
  }, []);

  // Get unique destinations
  const destinations = Array.from(new Set(hotels.map(h => h.destination)))
    .map(dest => ({
      id: `dest-${dest.toLowerCase()}`,
      query: dest,
      name: isArabic ? (DESTINATION_INFO[dest]?.nameAr || dest) : dest,
      count: hotels.filter(h => h.destination === dest).length,
      emoji: DESTINATION_INFO[dest]?.emoji,
      desc: isArabic ? (DESTINATION_INFO[dest]?.descAr || DESTINATION_INFO[dest]?.desc) : DESTINATION_INFO[dest]?.desc,
    }));

  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">{t('pages.destinations.hero.kicker')}</div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6 tracking-tight">{t('pages.destinations.hero.title')}</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95 leading-relaxed">
            {t('pages.destinations.hero.subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-jordan-blue" size={48} />
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
