import React from "react";
import useFetch from "../hooks/useFetch";
import { hotelAPI } from "../services/api";

export default function ExperiencesListing() {
  const { data: items, loading, error } = useFetch(() => hotelAPI.getExperiences(), []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Experiences</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error.message}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(items || []).map((x) => (
          <div key={x.id} className="hotel-card p-4">
            <h3 className="font-bold">{x.title}</h3>
            <p className="text-sm text-slate-500">{x.meta}</p>
            <div className="mt-4">
              <a href={`/experiences/${x.id}`} className="btn btn--soft">View</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
