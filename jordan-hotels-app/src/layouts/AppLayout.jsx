import { useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar.jsx";
import Footer from "../components/Footer.jsx";
import { getLastAuthError, enableMocks, getUseMocks } from "../services/api.js";

export default function AppLayout() {
  const [authError] = useState(() => getLastAuthError());
  const [dismissed, setDismissed] = useState(false);
  const [useMocks, setUseMocks] = useState(getUseMocks());

  const showBanner = authError && !dismissed && !useMocks;

  return (
    <div className="min-h-screen">
      <NavBar />

      {/* Auth error banner */}
      {showBanner && (
        <div className="w-full bg-amber-100 border-b border-amber-200 text-amber-900 px-6 py-4 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-100">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm flex-1 min-w-0">
              <strong>⚠️ API Issue:</strong> {authError}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setUseMocks(true);
                  enableMocks(true);
                }}
                className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
              >
                Use demo data
              </button>
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="px-3 py-2 bg-white text-amber-700 text-sm font-medium rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors dark:bg-slate-900 dark:text-amber-200 dark:border-amber-900/50 dark:hover:bg-slate-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="page-shell py-6 sm:py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
