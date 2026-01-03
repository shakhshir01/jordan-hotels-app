import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import realHotelsAPI from "../services/realHotelsData";
import { Loader2 } from "lucide-react";

const DESTINATION_INFO = {
  'Dead Sea': { desc: 'Experience the lowest point on Earth with mineral-rich waters', emoji: '💧' },
  'Amman': { desc: 'Capital city with Roman history, vibrant markets, and modern culture', emoji: '🏛️' },
  'Petra': { desc: 'UNESCO World Heritage site - the legendary rose-red city carved in stone', emoji: '🪨' },
  'Aqaba': { desc: 'Red Sea beach resort with diving, water sports and stunning coral reefs', emoji: '🏖️' },
  'Wadi Rum': { desc: 'Desert landscape of Mars-like terrain, Bedouin camps and adventure', emoji: '🏜️' },
};

export default function Destinations() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

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
      name: dest,
      count: hotels.filter(h => h.destination === dest).length,
      ...DESTINATION_INFO[dest]
    }));

  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-500 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">Discover</div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6 tracking-tight">Destinations in Jordan</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95 leading-relaxed">
            Explore iconic places and hidden gems across Jordan
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
                    <div className="text-sm font-medium mt-2 bg-black/20 px-3 py-1 rounded-full inline-block">{d.count} Hotels</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">{d.name}</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">{d.desc}</p>
                  <button 
                    onClick={() => navigate(`/search?destination=${d.name}`)}
                    className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition font-semibold">
                    Explore Hotels
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
