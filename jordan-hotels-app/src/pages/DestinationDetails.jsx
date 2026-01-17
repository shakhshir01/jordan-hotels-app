import React from "react";
import { useParams, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { hotelAPI } from "../services/api";
import { useTranslation } from "react-i18next";
import { getHotelDisplayName } from "../utils/hotelLocalization";
import OptimizedImage from "../components/OptimizedImage";
import { ArrowRight } from "lucide-react";

export default function DestinationDetails() {
  const { id } = useParams();
  const { data: dest, loading, error } = useFetch(() => hotelAPI.getDestinationById(id), [id]);
  const { i18n } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {loading && <p>Loading destination...</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      {!loading && !error && !dest && (
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-2">Destination not found</h1>
          <p className="text-slate-500 mb-4">Try exploring all destinations from the main page.</p>
          <Link
            to="/destinations"
            className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to destinations
          </Link>
        </div>
      )}

      {dest && (
        <>
          <header className="mb-8">
            <h1 className="text-4xl font-black">{dest.name}</h1>
            {dest.description && (
              <p className="text-slate-600 mt-2">{dest.description}</p>
            )}
          </header>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Hotels in {dest.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(dest.hotels || []).map((h) => (
                (() => {
                  const hotelName = getHotelDisplayName(h, i18n.language);
                  return (
                <div key={h.id} className="hotel-card overflow-hidden">
                  {h.image && (
                    <div className="relative aspect-[3/2] sm:aspect-[4/3] overflow-hidden">
                      <OptimizedImage
                        src={h.image}
                        alt={hotelName}
                        className="w-full h-full object-cover"
                        sizes="100vw"
                      />
                    </div>
                  )}
                  <div className="p-4 flex flex-col gap-1">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{hotelName}</h3>
                    {h.location && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{h.location}</p>
                    )}
                    {h.price && (
                      <p className="text-sm text-slate-600 dark:text-slate-300">{h.price} JOD / night</p>
                    )}
                    <div className="mt-3">
                      <Link
                        to={`/hotels/${h.id}`}
                        aria-label={`View ${hotelName}`}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors duration-200 inline-flex items-center justify-center min-h-[44px]"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
                  );
                })()
              ))}
            </div>
          </section>

          {/* Related Destinations */}
          <section className="mt-16 mb-8">
            <div className="card-modern p-8">
              <h2 className="text-3xl font-black mb-8 gradient-text text-center">
                Explore Other Jordan Destinations
              </h2>
              <p className="text-center text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
                Jordan has so much more to offer. Discover these incredible destinations for your next adventure.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {['Petra', 'Amman', 'Dead Sea', 'Wadi Rum', 'Aqaba', 'Jerash'].filter(dest => dest !== id).slice(0, 3).map((destination) => (
                  <Link
                    key={destination}
                    to={`/destinations/${encodeURIComponent(destination)}`}
                    className="group card-modern p-6 hover:shadow-premium transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-jordan-blue to-jordan-teal flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-jordan-blue transition-colors">
                          {destination}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {destination === 'Petra' ? 'Ancient rose-red city carved in stone' :
                           destination === 'Amman' ? 'Vibrant capital with Roman history' :
                           destination === 'Dead Sea' ? 'Lowest point on Earth with healing waters' :
                           destination === 'Wadi Rum' ? 'Martian desert landscape and Bedouin culture' :
                           destination === 'Aqaba' ? 'Red Sea diving and beach paradise' :
                           'Ancient Roman city with stunning ruins'}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  to="/destinations"
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  View All Destinations
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
