import useFetch from "../hooks/useFetch.js";
import { hotelAPI } from "../services/api.js";
import { Loader2 } from "lucide-react";

const DEALS_DATA = [
  { title: "Weekend escape", meta: "City stays • Limited time" },
  { title: "Family bundles", meta: "Kids-friendly • Breakfast" },
  { title: "Desert + Petra combo", meta: "Curated itinerary • Best value" },
  { title: "Last-minute", meta: "Tonight & tomorrow" },
];

export default function Deals() {
  const { data: deals, loading } = useFetch(() => hotelAPI.getDeals(), []);

  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">
            Save More
          </div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6">
            Deals & Offers
          </h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95">
            Exclusive offers and promo codes.
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
            {(deals || DEALS_DATA).map((d, idx) => {
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
                    <button className="btn-primary w-full">See offers</button>
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
