export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="glass-card rounded-3xl p-10 space-y-6">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 mb-2">
              PRIVACY OVERVIEW
            </p>
            <h1 className="text-3xl md:text-4xl font-black font-display mb-2 text-slate-900 dark:text-slate-100">
              Privacy & data approach
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This is a concise, product‑demo privacy summary for VisitJo. For a
              live deployment, replace this with a full policy reviewed by your
              legal and compliance teams.
            </p>
          </header>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              1. Information we work with in this demo
            </h2>
            <p>
              In this environment, VisitJo primarily uses sample data and
              Cognito test accounts. Typical fields may include your name,
              email address, basic profile details, and booking metadata used
              to drive the product experience (for example, upcoming stays or
              saved searches).
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              2. How data is used
            </h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To sign you in and keep your session active securely.</li>
              <li>
                To show you relevant content such as bookings, wishlists, and
                itinerary ideas.
              </li>
              <li>
                To help support and product teams understand how the demo is
                used and where to improve.
              </li>
            </ul>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              3. Analytics and logs
            </h2>
            <p>
              In a real deployment, basic analytics and application logs may be
              captured to monitor performance, detect errors, and keep the
              platform secure. Any such tooling should be configured to avoid
              collecting more personal data than is necessary.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              4. Your choices
            </h2>
            <p>
              In a production environment, users should be able to access,
              correct, or delete their account information, and to manage email
              or notification preferences. Those flows can be layered on top of
              the current VisitJo profile and bookings pages.
            </p>
          </section>

          <section className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              5. Using this in production
            </h2>
            <p>
              Before you point real customers to VisitJo, ensure that this
              summary is replaced by a full privacy policy that matches your
              data flows, retention rules, and jurisdictional requirements
              (GDPR, local law, etc.).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
