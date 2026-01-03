import React from "react";
import useFetch from "../hooks/useFetch";
import { hotelAPI } from "../services/api";
import { Link } from "react-router-dom";

export default function DealsList() {
  const { data: deals, loading, error } = useFetch(() => hotelAPI.getDeals(), []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Deals & Offers</h1>
      {loading && <p>Loading offers...</p>}
      {error && <p className="text-red-600">{error.message}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(deals || []).map(d => (
          <article key={d.id} className="hotel-card p-6">
            <h3 className="text-xl font-bold">{d.title}</h3>
            <p className="text-sm text-slate-500 mb-4">{d.meta}</p>
            <div className="flex justify-between items-center">
              <span className="font-semibold">{d.price || "Varies"}</span>
              <Link to={`/deals/${d.id}`} className="btn btn--soft">View</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
