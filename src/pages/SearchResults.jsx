import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { hotelAPI } from "../services/api";

export default function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const { data, loading, error, run } = useFetch(() => hotelAPI.searchAll(q), [q]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">Search results for “{q}”</h1>
      {loading && <p className="text-slate-500">Loading...</p>}
      {error && <p className="text-red-600">{error.message}</p>}
      {!loading && data && (
        <>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Hotels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(data.hotels || []).map(h => (
                <article key={h.id} className="hotel-card">
                  <img src={h.image} alt={h.name} className="w-full h-48 object-cover" onError={e => e.currentTarget.src = ""} />
                  <div className="p-4">
                    <h3 className="font-bold">{h.name}</h3>
                    <p className="text-sm text-slate-500">{h.location}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="font-bold">{h.price} JOD</span>
                      <Link to={`/hotels/${h.id}`} className="btn btn--soft">View</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">Experiences</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(data.experiences || []).map(x => (
                <div key={x.id} className="hotel-card p-4">
                  <h3 className="font-bold">{x.title}</h3>
                  <p className="text-sm text-slate-500">{x.meta}</p>
                  <div className="mt-3">
                    <Link to={`/experiences/${x.id}`} className="btn btn--ghost">Details</Link>
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
