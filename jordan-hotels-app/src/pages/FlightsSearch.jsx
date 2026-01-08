import React, { useState } from "react";
import { hotelAPI } from "../services/api";

export default function FlightsSearch() {
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const res = await hotelAPI.searchFlights({ origin, destination: dest, date });
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
      <h1 className="text-2xl font-bold mb-6">Search Flights</h1>
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <input className="input-premium" placeholder="Origin" value={origin} onChange={e => setOrigin(e.target.value)} />
        <input className="input-premium" placeholder="Destination" value={dest} onChange={e => setDest(e.target.value)} />
        <input className="input-premium" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Searching..." : "Search"}</button>
      </form>

      <div>
        {results.length === 0 ? <p className="text-slate-500">No flights found.</p> : (
          <div className="space-y-4">
            {results.map(f => (
              <div key={f.id} className="glass-card p-4 flex justify-between items-center">
                <div>
                  <div className="font-bold">{f.airline} • {f.flightNumber}</div>
                  <div className="text-sm text-slate-500">{f.departure} → {f.arrival}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{f.price} JOD</div>
                  <div className="text-sm text-slate-500">per passenger</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
