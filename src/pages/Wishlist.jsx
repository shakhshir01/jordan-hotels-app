export default function Wishlist() {
  return (
    <div>
      <section className="hero">
        <div className="hero__inner">
          <div className="u-muted">Save</div>
          <div className="hero__title">Wishlist</div>
          <p className="hero__subtitle">Placeholder (later: auth-required, sync, price alerts).</p>
        </div>
      </section>

      <section className="section">
        <div className="card">
          <div className="card__body">
            <div className="card__title">No saved items yet</div>
            <p className="p u-mt-2">Add “save” actions on cards and persist per user.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
