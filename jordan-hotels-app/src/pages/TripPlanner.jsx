import React, { useState } from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
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
            {t('pages.tripPlanner.hero.kicker')}
          </p>
          <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight mb-3">
            {t('pages.tripPlanner.hero.title')}
          </h1>
          <p className="text-base md:text-lg opacity-95 leading-relaxed max-w-3xl mx-auto">
            {t('pages.tripPlanner.hero.subtitle')}
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t('pages.tripPlanner.itinerary')}
          </p>
          <button
            type="button"
            onClick={handleAddDay}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-jordan-blue text-white text-xs font-semibold shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> {t('pages.tripPlanner.addDay')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {days.map((day, index) => (
            <div key={day.id} className="glass-card rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {t('pages.tripPlanner.dayNumber', { number: index + 1 })}
                  </label>
                  <input
                    type="text"
                    value={day.title}
                    onChange={(e) => handleUpdate(day.id, { title: e.target.value })}
                    className="mt-1 w-full bg-transparent text-sm font-semibold text-slate-900 dark:text-slate-50 border-b border-slate-200 dark:border-slate-700 pb-1 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(day.id)}
                  className="p-1 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  aria-label={t('pages.tripPlanner.deleteDay')}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-emerald-500" />
                <input
                  type="text"
                  placeholder={t('pages.tripPlanner.destinationPlaceholder')}
                  value={day.destination}
                  onChange={(e) => handleUpdate(day.id, { destination: e.target.value })}
                  className="flex-1 bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <textarea
                  rows={4}
                  placeholder={t('pages.tripPlanner.notesPlaceholder')}
                  value={day.notes}
                  onChange={(e) => handleUpdate(day.id, { notes: e.target.value })}
                  className="w-full mt-2 text-xs text-slate-800 dark:text-slate-100 bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 resize-vertical outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
