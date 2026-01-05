const FAQ = [
  {
    q: "How do cancellations and changes work?",
    a: "Each booking clearly shows if it is flexible or non‑refundable. Flexible stays usually allow changes up to a certain time before check‑in.",
  },
  {
    q: "Where can I see my bookings?",
    a: "Open your Profile and go to the My Bookings section. From there you can review details and, where supported, request cancellation.",
  },
  {
    q: "Do you support multi‑currency?",
    a: "Prices are shown in Jordanian Dinar (JOD) for now. Your bank or card provider may convert from your home currency.",
  },
  {
    q: "Something is wrong with my stay—what should I do?",
    a: "First, speak to the property directly so they can resolve it quickly. If you still need help, contact VisitJo support with your booking ID.",
  },
];

export default function Support() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 shadow-2xl mb-16 mx-6 mt-10">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 py-16 text-center text-white max-w-3xl mx-auto">
          <div className="text-sm font-semibold uppercase tracking-[0.25em] opacity-90 mb-3">HELP & SUPPORT</div>
          <h1 className="text-4xl md:text-5xl font-black font-display mb-4">We’re here if plans change</h1>
          <p className="text-sm md:text-base opacity-95">
            Start with our quick FAQ, then reach out using chat or email if you
            still need a human to look into a booking.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="glass-card rounded-2xl p-6">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {item.q}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{item.a}</p>
            </div>
          ))}
        </div>

        <aside className="space-y-4">
          <div className="glass-card rounded-2xl p-6 text-sm text-slate-700 dark:text-slate-200">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-2">
              Chat with an assistant
            </h2>
            <p className="mb-2">
              Use the blue chat bubble in the bottom‑right corner to start a
              conversation with the VisitJo travel assistant. Ask about
              bookings, destinations, or how policies work.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              In a production setup, this can be connected to a live‑agent
              system so that complex issues are handed over to a human.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 text-sm text-slate-700 dark:text-slate-200 space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50 mb-1">
              Email support (example)
            </h2>
            <p>
              For issues that are not urgent, send us an email including your
              booking ID, dates, and a short description of the problem.
            </p>
            <a
              href="mailto:support@example-visitjo.com?subject=VisitJo%20Support%20Request"
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-jordan-blue dark:hover:bg-jordan-blue transition-colors"
            >
              Open email draft
            </a>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Replace this address with your real support inbox when you launch
              VisitJo to customers.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
