import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import WishlistButton from "../components/WishlistButton";
import { useTranslation } from "react-i18next";

const EXPERIENCES = [
  {
    id: 'e-petra-night',
    title: 'Petra Night Walk',
    titleAr: 'جولة البتراء ليلاً',
    meta: 'Experience ancient wonders under starlight',
    metaAr: 'اكتشف عجائب التاريخ تحت ضوء النجوم',
    emoji: '🏛️',
    price: '45 JOD',
    description: 'Walk through the illuminated rose-red city of Petra at night with a local guide.',
    descriptionAr: 'تجوّل في مدينة البتراء الوردية المضاءة ليلاً مع دليل محلي.',
    duration: '3 hours',
    durationAr: '٣ ساعات',
    groupSize: 'Max 20 people'
    ,
    groupSizeAr: 'حد أقصى ٢٠ شخصاً'
  },
  {
    id: 'e-wadi-rum-4x4',
    title: 'Wadi Rum Desert Safari',
    titleAr: 'سفاري صحراء وادي رم',
    meta: 'Explore Mars-like terrain with Bedouin guides',
    metaAr: 'استكشف تضاريس تشبه المريخ مع أدلاء بدو',
    emoji: '🏜️',
    price: '60 JOD',
    description: 'Adventure through red sand dunes in a 4x4 vehicle with traditional Bedouin hospitality.',
    descriptionAr: 'مغامرة بين الكثبان الرملية الحمراء بسيارة دفع رباعي مع ضيافة بدوية أصيلة.',
    duration: '4-6 hours',
    durationAr: '٤-٦ ساعات',
    groupSize: 'Max 4 people per vehicle'
    ,
    groupSizeAr: 'حتى ٤ أشخاص لكل سيارة'
  },
  {
    id: 'e-dead-sea-spa',
    title: 'Dead Sea Spa Day',
    titleAr: 'يوم سبا في البحر الميت',
    meta: 'Therapeutic mud and mineral treatments',
    metaAr: 'علاجات الطين والمعادن العلاجية',
    emoji: '🧖',
    price: '85 JOD',
    description: 'Indulge in traditional Dead Sea mud treatments and floating in mineral-rich waters.',
    descriptionAr: 'استمتع بعلاجات طين البحر الميت والطفو في مياه غنية بالمعادن.',
    duration: 'Full day',
    durationAr: 'يوم كامل',
    groupSize: 'Personal or small groups'
    ,
    groupSizeAr: 'فردي أو مجموعات صغيرة'
  },
  {
    id: 'e-amman-food',
    title: 'Amman Food Tour',
    titleAr: 'جولة طعام في عمّان',
    meta: 'Taste local cuisines and street food',
    metaAr: 'تذوق الأطباق المحلية وأكل الشارع',
    emoji: '🍽️',
    price: '35 JOD',
    description: 'Guided culinary tour through traditional markets and famous local restaurants.',
    descriptionAr: 'جولة طعام مع مرشد عبر الأسواق الشعبية وأشهر المطاعم المحلية.',
    duration: '3 hours',
    durationAr: '٣ ساعات',
    groupSize: 'Max 12 people'
    ,
    groupSizeAr: 'حد أقصى ١٢ شخصاً'
  },
  {
    id: 'e-diving-aqaba',
    title: 'Coral Reef Diving',
    titleAr: 'غوص الشعاب المرجانية',
    meta: 'Explore underwater wonders in Aqaba',
    metaAr: 'استكشف عجائب البحر في العقبة',
    emoji: '🤿',
    price: '75 JOD',
    description: 'Dive in pristine Red Sea coral reefs with certified instructors and full equipment.',
    descriptionAr: 'اغص في شعاب البحر الأحمر مع مدربين معتمدين ومعدات كاملة.',
    duration: '4 hours',
    durationAr: '٤ ساعات',
    groupSize: 'Max 8 divers'
    ,
    groupSizeAr: 'حد أقصى ٨ غواصين'
  },
  {
    id: 'e-jeep-tour',
    title: 'Off-Road Jeep Adventure',
    titleAr: 'مغامرة جيب خارج الطريق',
    meta: 'Thrilling adventure through mountain terrain',
    metaAr: 'مغامرة ممتعة عبر تضاريس جبلية',
    emoji: '🚙',
    price: '70 JOD',
    description: 'Exciting jeep tour through challenging terrain and hidden mountain villages.',
    descriptionAr: 'جولة جيب مشوقة عبر طرق وعرة وقرى جبلية مخفية.',
    duration: '5 hours',
    durationAr: '٥ ساعات',
    groupSize: 'Max 4 per jeep'
    ,
    groupSizeAr: 'حتى ٤ أشخاص لكل جيب'
  }
];

export default function Experiences() {
  const [selectedExperience, setSelectedExperience] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');

  const handleBookExperience = (experience) => {
    if (!user) {
      navigate('/login', { state: { returnUrl: '/experiences' } });
      return;
    }
    navigate('/checkout', { state: { experience } });
  };

  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-4 sm:px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">{t('pages.experiences.hero.kicker')}</div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6">{t('pages.experiences.hero.title')}</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95">{t('pages.experiences.hero.subtitle')}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EXPERIENCES.map((x) => (
            <div 
              key={x.id} 
              onClick={() => setSelectedExperience(x)}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-lg hover:shadow-xl transition cursor-pointer overflow-hidden group"
            >
              <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-7xl group-hover:scale-110 transition relative">
                {x.emoji}
                <WishlistButton item={{ ...x, type: 'experience' }} className="absolute top-4 right-4" />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">{isArabic ? x.titleAr : x.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{isArabic ? x.metaAr : x.meta}</p>
                <p className="text-purple-600 font-bold text-lg mb-4">{x.price}</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedExperience(x);
                  }}
                  className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition font-semibold"
                >
                  {t('pages.experiences.learnMore')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedExperience && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{isArabic ? selectedExperience.titleAr : selectedExperience.title}</h2>
                <button onClick={() => setSelectedExperience(null)} className="text-2xl" aria-label={t('messages.close')}>&times;</button>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">{isArabic ? selectedExperience.descriptionAr : selectedExperience.description}</p>
              <div className="space-y-2 mb-6">
                <p><strong>{t('pages.experiences.durationLabel')}:</strong> {isArabic ? selectedExperience.durationAr : selectedExperience.duration}</p>
                <p><strong>{t('pages.experiences.groupSizeLabel')}:</strong> {isArabic ? selectedExperience.groupSizeAr : selectedExperience.groupSize}</p>
                <p className="text-purple-600 font-bold text-xl">{selectedExperience.price}</p>
              </div>
              <button 
                onClick={() => handleBookExperience(selectedExperience)}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-bold"
              >
                {t('booking.bookNow')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
