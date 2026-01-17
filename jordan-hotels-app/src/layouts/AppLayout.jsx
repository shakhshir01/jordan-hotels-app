import { useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar.jsx";
import Footer from "../components/Footer.jsx";
import ChatBot from "../components/ChatBot.jsx";
import AccessibilitySettings from "../components/AccessibilitySettings.jsx";
import { SkipToMainLink } from "../services/accessibility.jsx";
import { getLastAuthError, enableMocks, getUseMocks } from "../services/api.js";

export default function AppLayout() {
  const [authError] = useState(() => getLastAuthError());
  const [dismissed, setDismissed] = useState(false);
  const [useMocks, setUseMocks] = useState(getUseMocks());
  const [accessibilitySettingsOpen, setAccessibilitySettingsOpen] = useState(false);

  const showBanner = authError && !dismissed && !useMocks;

  return (
    <div className="min-h-screen">
      <SkipToMainLink />
      <NavBar onAccessibilityClick={() => setAccessibilitySettingsOpen(true)} />

      {/* Auth error banner - Mobile Optimized */}
      {showBanner && (
        <div className="w-full bg-amber-100 border-b border-amber-200 text-amber-900 px-3 sm:px-6 py-3 sm:py-4 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-100">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm flex-1 min-w-0">
              <strong>⚠️ API Issue:</strong> {authError}
            </div>
            <div className="flex flex-shrink-0">
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="px-3 sm:px-4 py-2 bg-white text-amber-700 text-xs sm:text-sm font-medium rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors dark:bg-slate-900 dark:text-amber-200 dark:border-amber-900/50 dark:hover:bg-slate-800 touch-manipulation min-h-[40px] flex items-center justify-center"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <main id="main-content" className="page-shell py-4 sm:py-6 lg:py-8">
        <Outlet />
      </main>

      <Footer />
      <ChatBot />
      <AccessibilitySettings
        isOpen={accessibilitySettingsOpen}
        onClose={() => setAccessibilitySettingsOpen(false)}
      />
    </div>
  );
}
