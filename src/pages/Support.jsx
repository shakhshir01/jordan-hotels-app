const FAQ = [
  { q: "How do cancellations work?", a: "Policies depend on the property. Check before payment." },
  { q: "Can I change dates?", a: "Support changes where allowed." },
  { q: "Multi-currency?", a: "Planned: multi-currency display." },
];

export default function Support() {
  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">Help</div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6">Support</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95">FAQ and assistance.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="space-y-6">
          {FAQ.map((x) => (
            <div key={x.q} className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{x.q}</h3>
              <p className="text-slate-600 dark:text-slate-400">{x.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
