export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="glass-card rounded-3xl p-10 space-y-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 mb-2">
              LEGAL OVERVIEW
            </p>
            <h1 className="text-3xl md:text-4xl font-black font-display mb-2 text-slate-900 dark:text-slate-100">
              Terms of use
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This is a simplified, product‑demo version of terms for the
              VisitJo experience. For a live production deployment, you should
              review and replace this copy with text approved by your legal
              advisor.
            </p>
          </header>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              1. What VisitJo is (and is not)
            </h2>
            <p>
              VisitJo is a travel discovery and booking interface focused on
              Jordan. We surface information about hotels, experiences, and
              related services provided by third‑party partners. VisitJo itself
              does not own or operate the properties you see in the app.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              2. Your responsibilities as a guest
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Provide accurate contact and payment information.</li>
              <li>Review cancellation, change, and no‑show policies before booking.</li>
              <li>
                Respect local laws, customs, and property‑specific house rules
                during your stay.
              </li>
              <li>
                Contact the property or support promptly if something is not as
                described.
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              3. Pricing, fees, and changes
            </h2>
            <p>
              Prices and availability can change at any time and may vary based
              on season, demand, or partner policies. We aim to show clear
              totals before you pay, but local taxes, resort fees, or currency
              conversion charges may be handled by the property or your bank.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              4. Cancellations and changes
            </h2>
            <p>
              Each booking is subject to the cancellation and change policy
              shown at checkout. Flexible bookings may allow free changes up to
              a certain date; non‑refundable rates may not allow changes at all.
              Always review these details before confirming.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              5. Platform limitations
            </h2>
            <p>
              While we work hard to keep information accurate and services
              available, the VisitJo app is provided “as is” for demonstration
              purposes. There may be occasional outages, delays, or
              discrepancies in content sourced from partners.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              6. Feedback and contact
            </h2>
            <p>
              If you have questions about these demo terms or want to adapt
              VisitJo for a real production environment, please reach out to
              your technical team and legal counsel. They can provide a
              jurisdiction‑specific set of documents.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
