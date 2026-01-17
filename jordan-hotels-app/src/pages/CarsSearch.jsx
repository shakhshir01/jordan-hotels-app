import React, { useState } from "react";
import { hotelAPI } from "../services/api";

export default function CarsSearch() {
  const [pickup, setPickup] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await hotelAPI.searchCars({ pickup, date });
      setResults(res || []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-black gradient-text mb-6">Car Rentals</h1>
      <div className="card-modern p-6 mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="input-premium" placeholder="Pickup location" value={pickup} onChange={e => setPickup(e.target.value)} />
          <input className="input-premium" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <button className="btn-primary h-[50px]" type="submit" disabled={loading}>{loading ? "Searching..." : "Search"}</button>
        </form>
      </div>

      <div>
        {results.length === 0 ? <p className="text-slate-500">No cars found.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(c => (
              <div key={c.id} className="card-modern p-6 flex items-center gap-4 hover:shadow-premium transition-all duration-300">
                <div className="flex-1">
                  <div className="font-bold text-lg text-slate-900 dark:text-slate-100">{c.make} {c.model}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{c.features?.join(", ")}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-xl text-jordan-blue">{c.price} JOD</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">per day</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
