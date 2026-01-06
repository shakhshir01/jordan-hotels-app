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
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">Car Rentals</h1>
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <input className="input-premium" placeholder="Pickup location" value={pickup} onChange={e => setPickup(e.target.value)} />
        <input className="input-premium" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Searching..." : "Search"}</button>
      </form>

      <div>
        {results.length === 0 ? <p className="text-slate-500">No cars found.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map(c => (
              <div key={c.id} className="hotel-card p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-bold">{c.make} {c.model}</div>
                  <div className="text-sm text-slate-500">{c.features?.join(", ")}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{c.price} JOD</div>
                  <div className="text-sm text-slate-500">per day</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
