import React from "react";
import { useParams, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { hotelAPI } from "../services/api";

export default function DestinationDetails() {
  const { id } = useParams();
  const { data: dest, loading, error } = useFetch(() => hotelAPI.getDestinationById(id), [id]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {loading && <p>Loading destination...</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      {!loading && !error && !dest && (
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-2">Destination not found</h1>
          <p className="text-slate-500 mb-4">Try exploring all destinations from the main page.</p>
          <Link
            to="/destinations"
            className="px-5 py-2 rounded-full bg-jordan-blue text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
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
                <div key={h.id} className="hotel-card overflow-hidden">
                  {h.image && (
                    <img
                      src={h.image}
                      alt={h.name}
                      className="w-full h-40 object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="p-4 flex flex-col gap-1">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{h.name}</h3>
                    {h.location && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{h.location}</p>
                    )}
                    {h.price && (
                      <p className="text-sm text-slate-600 dark:text-slate-300">{h.price} JOD / night</p>
                    )}
                    <div className="mt-3">
                      <Link
                        to={`/hotels/${h.id}`}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-jordan-blue dark:hover:bg-jordan-blue transition-colors duration-200 inline-block"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
