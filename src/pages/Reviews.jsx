const FEATURES = [
  { title: "Verified stays", meta: "Only confirmed bookings can review" },
  { title: "Photo reviews", meta: "Guests can add photos and tips" },
  { title: "Helpful votes", meta: "Community-driven trust signals" },
];

export default function Reviews() {
  return (
    <div>
      <section className="hero">
        <div className="hero__inner">
          <div className="u-muted">Trust</div>
          <div className="hero__title">Reviews</div>
          <p className="hero__subtitle">Placeholder hub (later: moderation, summaries, filters).</p>
        </div>
      </section>

      <section className="section">
        <div className="grid grid--cards">
          {FEATURES.map((f) => (
            <div key={f.title} className="card">
              <div className="card__body">
                <div className="card__title">{f.title}</div>
                <div className="card__meta">{f.meta}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
