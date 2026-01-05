export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-2xl mb-16 mx-6 mt-10">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative px-6 py-16 md:py-20 text-center text-white max-w-4xl mx-auto">
          <div className="text-xs md:text-sm font-semibold uppercase tracking-[0.25em] opacity-80 mb-3">
            ABOUT VISITJO
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display mb-4">
            Jordan, curated for modern travelers
          </h1>
          <p className="text-sm md:text-base opacity-95 leading-relaxed max-w-3xl mx-auto">
            VisitJo is your premium layer on top of Jordan travel. We bring
            together verified stays, experiences, and local insight into one
            place, so you spend less time comparing tabs and more time planning
            moments that matter.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-20 space-y-16">
        <section className="grid md:grid-cols-3 gap-8">
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Local-first vision</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              VisitJo is focused purely on Jordan. From Amman rooftops to Wadi
              Rum camps and Dead Sea resorts, we work with partners who know
              the country deeply and care about long-term, sustainable travel.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Curated stays & experiences</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Rather than listing everything, we prioritise quality: strong
              guest feedback, clear policies, and hosts who respond quickly.
              The goal is to feel confident that anything you book through
              VisitJo is a solid choice.
            </p>
          </div>
          <div className="glass-card rounded-2xl p-6 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Built for planning + rebooking</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Itineraries, saved searches, wishlists, and booking insights are
              designed to make it easy to compare options, adjust plans, and
              come back to Jordan again with an even better trip.
            </p>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-10 items-start">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-50">
              What VisitJo focuses on
            </h2>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc list-inside">
              <li>Clear pricing and policies before you confirm anything.</li>
              <li>Properties and partners that consistently look after guests.</li>
              <li>
                Helpful filters and search so you can quickly find what fits
                your budget and style.
              </li>
              <li>
                Strong mobile experience for planning on the go while you are
                already in Jordan.
              </li>
              <li>
                Support when something goes wrong: we treat issues as
                opportunities to improve the platform.
              </li>
            </ul>
          </div>
          <div className="glass-card rounded-2xl p-6 text-sm text-slate-700 dark:text-slate-200 space-y-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-1">
              How we handle reviews
            </h3>
            <p>
              Reviews on VisitJo are used to guide you, not overwhelm you. We
              surface patterns guests consistently mention: cleanliness,
              service, Wi‑Fi reliability, late check‑out flexibility, or how a
              camp handles early Petra starts.
            </p>
            <p>
              Over time, we aim to include richer, Jordan‑specific context:
              sunrise views, access to local guides, and how well a stay fits
              into classic routes like Amman → Petra → Wadi Rum → Aqaba.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
