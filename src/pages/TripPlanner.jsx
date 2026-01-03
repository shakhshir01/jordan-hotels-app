export default function TripPlanner() {
  return (
    <div>
      <section className="hero">
        <div className="hero__inner">
          <div className="u-muted">Plan</div>
          <div className="hero__title">Trip Planner</div>
          <p className="hero__subtitle">Placeholder (later: itinerary builder, map view, share/export).</p>
        </div>
      </section>

      <section className="section">
        <div className="grid grid--cards">
          {["Day 1: Arrival", "Day 2: Petra", "Day 3: Wadi Rum"].map((t) => (
            <div key={t} className="card">
              <div className="card__body">
                <div className="card__title">{t}</div>
                <div className="card__meta">Itinerary block placeholder</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
