export default function About() {
  return (
    <div className="min-h-screen">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-2xl mb-16 mx-6">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 py-20 text-center text-white">
          <div className="text-sm font-semibold uppercase tracking-widest opacity-90 mb-4">About</div>
          <h1 className="text-5xl md:text-6xl font-black font-display mb-6">Built for modern travel</h1>
          <p className="text-lg max-w-3xl mx-auto opacity-95">VisitJo is a large-scale platform for Jordan.</p>
        </div>
      </section>
    </div>
  );
}
