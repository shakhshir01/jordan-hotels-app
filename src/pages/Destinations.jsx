import useFetch from "../hooks/useFetch.js";
import { hotelAPI } from "../services/api.js";
import { Loader2 } from "lucide-react";

export default function Destinations() {
  const { data: destinations, loading, error } = useFetch(() => hotelAPI.getDestinations(), []);

  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">Discover</div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6 tracking-tight">Destinations in Jordan</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95 leading-relaxed">
            Explore iconic places and hidden gems—designed to scale into rich guides, maps, and seasonal collections.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-jordan-blue" size={48} />
          </div>
        )}
        {error && <p className="text-red-600 text-center py-20">{error.message}</p>}
        {!loading && destinations && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {destinations.map((d) => (
              <article key={d.id} className="hotel-card group">
                <div className="h-48 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-3xl font-black">{d.name[0]}</div>
                    <div className="text-sm font-medium mt-1">Destination</div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">{d.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">{d.description}</p>
                  <button className="btn-secondary">View guide</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
