import useFetch from "../hooks/useFetch.js";
import { hotelAPI } from "../services/api.js";
import { Loader2 } from "lucide-react";

const EMOJI_MAP = {
  "e-petra-night": "🏛️",
  "e-wadi-rum-4x4": "🏜️",
  "e-dead-sea-spa": "🧖",
  "e-amman-food": "🍽️",
};

export default function Experiences() {
  const { data: items, loading } = useFetch(() => hotelAPI.getExperiences(), []);

  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-rose-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">Do More</div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6">Experiences</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95">Activities, tours, and local experiences.</p>
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
            {(items || []).map((x) => (
              <div key={x.id} className="hotel-card">
                <div className="h-40 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-6xl">
                  {EMOJI_MAP[x.id] || "✨"}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{x.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{x.meta}</p>
                  <div className="mt-3">
                    <a href={`/experiences/${x.id}`} className="btn btn--ghost">Details</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
