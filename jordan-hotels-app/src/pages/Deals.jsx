import useFetch from "../hooks/useFetch.js";
import { hotelAPI } from "../services/api";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Deals() {
  const { data: deals, loading } = useFetch(() => hotelAPI.getDeals(), []);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">
            {t('pages.deals.hero.kicker')}
          </div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6">
            {t('pages.deals.hero.title')}
          </h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95">
            {t('pages.deals.hero.subtitle')}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(Array.isArray(deals) ? deals : []).map((d, idx) => {
              const gradients = [
                "from-orange-500 to-red-600",
                "from-pink-500 to-rose-600",
                "from-amber-500 to-orange-600",
                "from-red-500 to-pink-600",
              ];
              return (
                <article key={d.id || d.title} className="hotel-card">
                  <div
                    className={`h-40 bg-gradient-to-br ${gradients[idx % 4]} flex items-center justify-center`}
                  >
                    <div className="text-white text-center">
                      <div className="text-2xl font-black">💰</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {d.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {d.meta}
                    </p>
                    <button className="btn-primary w-full">{t('pages.deals.seeOffers')}</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
