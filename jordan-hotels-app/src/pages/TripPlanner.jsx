import React, { useState } from "react";
import { MapPin, Plus, Trash2, Clock, Hotel, Camera, Plane, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const STORAGE_KEY = "visitjo.tripPlan";

const defaultDays = [
  {
    id: "d1",
    title: "Day 1 – Amman arrival",
    titleAr: "اليوم 1 — الوصول إلى عمّان",
    destination: "Amman",
    notes: "Land in Amman, check into hotel, explore Rainbow Street and grab dinner downtown.",
    notesAr: "الوصول إلى عمّان، تسجيل الدخول في الفندق، جولة في شارع الرينبو وتناول العشاء في وسط البلد.",
  },
  {
    id: "d2",
    title: "Day 2 – Petra",
    titleAr: "اليوم 2 — البتراء",
    destination: "Petra",
    notes: "Early drive to Petra, hike the Siq and Treasury, optional Petra by Night.",
    notesAr: "الانطلاق مبكرًا إلى البتراء، السير في السيق حتى الخزنة، وخيار البتراء ليلاً.",
  },
  {
    id: "d3",
    title: "Day 3 – Wadi Rum desert",
    titleAr: "اليوم 3 — صحراء وادي رم",
    destination: "Wadi Rum",
    notes: "4x4 desert tour, sunset on the dunes, overnight in Bedouin camp.",
    notesAr: "جولة صحراوية بسيارة 4×4، غروب على الكثبان، ومبيت في مخيم بدوي.",
  },
];

export default function TripPlanner() {
  const { t, i18n } = useTranslation();
  const isArabic = String(i18n.language || '').toLowerCase().startsWith('ar');
  const [days, setDays] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {
      // ignore (storage unavailable / invalid JSON)
    }

    return defaultDays.map((d) => ({
      id: d.id,
      title: isArabic ? d.titleAr : d.title,
      destination: d.destination,
      notes: isArabic ? d.notesAr : d.notes,
    }));
  });

  const persist = (next) => {
    setDays(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore (storage unavailable)
    }
  };

  const handleAddDay = () => {
    const next = [
      ...days,
      {
        id: `d-${Date.now()}`,
        title: `New day ${days.length + 1}`,
        destination: "",
        notes: "",
      },
    ];
    persist(next);
  };

  const handleUpdate = (id, patch) => {
    const next = days.map((d) => (d.id === id ? { ...d, ...patch } : d));
    persist(next);
  };

  const handleDelete = (id) => {
    if (days.length === 1) return;
    const next = days.filter((d) => d.id !== id);
    persist(next);
  };

  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-4 sm:px-6 py-20 md:py-24 text-center text-white max-w-4xl mx-auto">
          <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] opacity-90 mb-3">
            {t('pages.tripPlanner.hero.kicker', 'Your Journey, Your Way')}
          </p>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight mb-3">
            {t('pages.tripPlanner.hero.title', 'Craft Your Perfect Itinerary')}
          </h1>
          <p className="text-base md:text-lg opacity-95 leading-relaxed max-w-3xl mx-auto">
            {t('pages.tripPlanner.hero.subtitle', 'Map out your dream adventure day by day. From arrival to departure, ensure every moment counts.')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-4">
            {t('pages.tripPlanner.itinerary', 'Your Custom Itinerary')}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('pages.tripPlanner.subtitle', 'Build your perfect Jordan adventure. Add, edit, and customize each day to match your travel style and interests.')}
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-jordan-blue to-jordan-teal text-white text-sm font-bold rounded-full shadow-lg">
              {days.length} {t('pages.tripPlanner.days', 'Days')}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {t('pages.tripPlanner.autoSaved', 'Auto-saved to browser')}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddDay}
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-2xl hover-lift font-semibold"
          >
            <Plus size={18} />
            {t('pages.tripPlanner.addDay', 'Add Day')}
          </button>
        </div>

        {/* Enhanced Days Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {days.map((day, index) => (
            <div key={day.id} className="group card-modern p-6 lg:p-8 hover:shadow-premium transition-all duration-500 hover:-translate-y-1 animate-fade-in-up">
              {/* Day Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-jordan-gold to-jordan-rose rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                      {index + 1}
                    </div>
                    <div className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      {t('pages.tripPlanner.day', 'Day')} {index + 1}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={day.title}
                    onChange={(e) => handleUpdate(day.id, { title: e.target.value })}
                    className="w-full bg-transparent text-xl font-black text-slate-900 dark:text-slate-100 border-b-2 border-transparent hover:border-jordan-blue focus:border-jordan-blue outline-none transition-colors duration-300"
                    placeholder={t('pages.tripPlanner.titlePlaceholder', 'Day title...')}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(day.id)}
                  aria-label={t('pages.tripPlanner.deleteDay', 'Delete day')}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
                  disabled={days.length === 1}
                >
                  <Trash2 size={20} />
                </button>
              </div>

              {/* Destination Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-jordan-rose" />
                  {t('pages.tripPlanner.destination', 'Destination')}
                </label>
                <input
                  type="text"
                  placeholder={t('pages.tripPlanner.destinationPlaceholder', 'Where are you going?')}
                  value={day.destination}
                  onChange={(e) => handleUpdate(day.id, { destination: e.target.value })}
                  className="w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-jordan-blue/30 focus:border-jordan-blue transition-all duration-300"
                />
              </div>

              {/* Notes Textarea */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Clock size={16} className="text-jordan-teal" />
                  {t('pages.tripPlanner.notes', 'Activities & Notes')}
                </label>
                <textarea
                  rows={6}
                  placeholder={t('pages.tripPlanner.notesPlaceholder', 'What will you do this day? Add activities, restaurants, sights to see...')}
                  value={day.notes}
                  onChange={(e) => handleUpdate(day.id, { notes: e.target.value })}
                  className="w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-jordan-blue/30 focus:border-jordan-blue transition-all duration-300 resize-none"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {/* Add hotel search */}}
                  className="flex-1 bg-gradient-to-r from-jordan-blue to-jordan-teal text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover-lift"
                >
                  <Hotel size={16} />
                  {t('pages.tripPlanner.findHotels', 'Find Hotels')}
                </button>
                <button
                  type="button"
                  onClick={() => {/* Add experience search */}}
                  className="flex-1 bg-gradient-to-r from-jordan-emerald to-jordan-teal text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 hover-lift"
                >
                  <Camera size={16} />
                  {t('pages.tripPlanner.findExperiences', 'Find Experiences')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trip Summary Section */}
        <div className="mt-16">
          <div className="card-modern p-8 lg:p-12 bg-gradient-to-r from-jordan-blue/5 to-jordan-teal/5 dark:from-jordan-blue/10 dark:to-jordan-teal/10">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 mb-4">
                {t('pages.tripPlanner.summary.title', 'Your Trip at a Glance')}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                {t('pages.tripPlanner.summary.subtitle', 'Here\'s what your Jordan adventure looks like. Ready to make it happen?')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-4xl font-black text-jordan-blue mb-2">{days.length}</div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">{t('pages.tripPlanner.summary.days', 'Days')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-jordan-rose mb-2">
                  {days.filter(d => d.destination.trim()).length}
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">{t('pages.tripPlanner.summary.destinations', 'Destinations')}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-jordan-gold mb-2">
                  {days.filter(d => d.notes.trim()).length}
                </div>
                <div className="text-slate-600 dark:text-slate-400 font-medium">{t('pages.tripPlanner.summary.planned', 'Days Planned')}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary px-8 py-4 text-lg font-bold rounded-2xl hover-lift">
                {t('pages.tripPlanner.summary.bookNow', 'Book Your Trip')}
              </button>
              <button className="btn-secondary px-8 py-4 text-lg font-bold rounded-2xl hover-lift">
                {t('pages.tripPlanner.summary.share', 'Share Itinerary')}
              </button>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card-modern p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-jordan-gold to-jordan-rose rounded-xl flex items-center justify-center mx-auto mb-4">
              <Plane size={24} className="text-white" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t('pages.tripPlanner.tips.flights', 'Book Flights')}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('pages.tripPlanner.tips.flightsDesc', 'Find the best deals on flights to Amman.')}
            </p>
          </div>

          <div className="card-modern p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-jordan-blue to-jordan-teal rounded-xl flex items-center justify-center mx-auto mb-4">
              <Hotel size={24} className="text-white" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t('pages.tripPlanner.tips.hotels', 'Reserve Hotels')}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('pages.tripPlanner.tips.hotelsDesc', 'Book accommodations for each destination.')}
            </p>
          </div>

          <div className="card-modern p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-jordan-emerald to-jordan-teal rounded-xl flex items-center justify-center mx-auto mb-4">
              <Camera size={24} className="text-white" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t('pages.tripPlanner.tips.experiences', 'Plan Experiences')}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('pages.tripPlanner.tips.experiencesDesc', 'Add tours and activities to your days.')}
            </p>
          </div>

          <div className="card-modern p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-jordan-rose to-jordan-gold rounded-xl flex items-center justify-center mx-auto mb-4">
              <Sparkles size={24} className="text-white" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-2">
              {t('pages.tripPlanner.tips.enjoy', 'Enjoy Jordan')}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t('pages.tripPlanner.tips.enjoyDesc', 'Experience the magic of the Middle East.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
