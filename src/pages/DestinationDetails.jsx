import React from "react";
import { useParams } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { hotelAPI } from "../services/api";

export default function DestinationDetails() {
  const { id } = useParams();
  const { data: dest, loading, error } = useFetch(() => hotelAPI.getDestinationById(id), [id]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {loading && <p>Loading destination...</p>}
      {error && <p className="text-red-600">{error.message}</p>}
      {dest && (
        <>
          <header className="mb-8">
            <h1 className="text-4xl font-black">{dest.name}</h1>
            <p className="text-slate-600 mt-2">{dest.description}</p>
          </header>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Hotels in {dest.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(dest.hotels || []).map(h => (
                <div key={h.id} className="hotel-card">
                  <img src={h.image} alt={h.name} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold">{h.name}</h3>
                    <p className="text-sm text-slate-500">{h.price} JOD/night</p>
                    <div className="mt-3">
                      <a href={`/hotels/${h.id}`} className="btn btn--soft">View</a>
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
