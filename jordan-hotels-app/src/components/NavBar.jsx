import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = useMemo(() => {
    if (!user) return "";
    if (userProfile?.displayName) return userProfile.displayName;

    const email = user.email || "";
    const isUUID = email.match(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
    return isUUID ? t("nav.account") : email.split("@")[0];
  }, [t, user, userProfile?.displayName]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 dark:bg-slate-900/80 dark:border-slate-700/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Brand */}
          <Link
            to="/"
            className="text-2xl font-black font-display tracking-tighter bg-gradient-to-r from-jordan-blue to-jordan-teal bg-clip-text text-transparent hover:scale-105 transition-transform duration-300"
          >
            VISITJO
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/destinations"
              className="text-sm font-medium text-slate-600 hover:text-jordan-blue dark:text-slate-300 dark:hover:text-blue-400 transition-colors duration-200 relative group"
            >
              {t("nav.destinations")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-jordan-blue group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              to="/trends"
              className="text-sm font-medium text-slate-600 hover:text-jordan-blue dark:text-slate-300 dark:hover:text-blue-400 transition-colors duration-200 relative group"
            >
              {t("nav.trends")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-jordan-blue group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              to="/insights"
              className="text-sm font-medium text-slate-600 hover:text-jordan-blue dark:text-slate-300 dark:hover:text-blue-400 transition-colors duration-200 relative group"
            >
              {t("nav.insights")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-jordan-blue group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              to="/experiences"
              className="text-sm font-medium text-slate-600 hover:text-jordan-blue dark:text-slate-300 dark:hover:text-blue-400 transition-colors duration-200 relative group"
            >
              {t("nav.experiences")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-jordan-blue group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              to="/deals"
              className="text-sm font-medium text-slate-600 hover:text-jordan-blue dark:text-slate-300 dark:hover:text-blue-400 transition-colors duration-200 relative group"
            >
              {t("nav.deals")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-jordan-blue group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              to="/blog"
              className="text-sm font-medium text-slate-600 hover:text-jordan-blue dark:text-slate-300 dark:hover:text-blue-400 transition-colors duration-200 relative group"
            >
              {t("nav.blog")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-jordan-blue group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              to="/reviews"
              className="text-sm font-medium text-slate-600 hover:text-jordan-blue dark:text-slate-300 dark:hover:text-blue-400 transition-colors duration-200 relative group"
            >
              {t("nav.reviews")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-jordan-blue group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              to="/support"
              className="text-sm font-medium text-slate-600 hover:text-jordan-blue dark:text-slate-300 dark:hover:text-blue-400 transition-colors duration-200 relative group"
            >
              {t("nav.support")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-jordan-blue group-hover:w-full transition-all duration-300" />
            </Link>

            {/* New Nav Items */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
            
            <Link
              to="/gallery"
              className="text-sm font-medium text-slate-600 hover:text-jordan-blue dark:text-slate-300 dark:hover:text-blue-400 transition-colors duration-200 relative group"
            >
              {t("nav.gallery")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-jordan-blue group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              to="/special-offers"
              className="text-sm font-medium text-slate-600 hover:text-jordan-blue dark:text-slate-300 dark:hover:text-blue-400 transition-colors duration-200 relative group"
            >
              {t("nav.offers")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-jordan-blue group-hover:w-full transition-all duration-300" />
            </Link>
            <Link
              to="/concierge"
              className="text-sm font-medium text-slate-600 hover:text-jordan-blue dark:text-slate-300 dark:hover:text-blue-400 transition-colors duration-200 relative group"
            >
              {t("nav.concierge")}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-jordan-blue group-hover:w-full transition-all duration-300" />
            </Link>
          </div>

          {/* Actions (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 max-w-[14rem] truncate">
                  {displayName}
                </span>
                <Link
                  to="/profile"
                  className="text-sm font-medium text-slate-700 hover:text-jordan-blue dark:text-slate-300 transition-colors duration-200"
                >
                  {t("nav.profile")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-jordan-blue dark:text-slate-300 transition-colors duration-200"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 bg-gradient-to-r from-jordan-blue to-jordan-teal text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  {t("nav.signup")}
                </Link>
              </>
            )}
            <ThemeToggle />
            <LanguageSwitcher />
          </div>

          {/* Actions (mobile) */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
            >
              {mobileOpen ? t("nav.close") : t("nav.menu")}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileOpen && (
          <div
            id="mobile-nav"
            className="md:hidden mt-3 rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-xl dark:border-slate-700/50 dark:bg-slate-900/70 overflow-y-auto max-h-[70vh]"
          >
            <div className="p-4 flex flex-col gap-2">
              <Link to="/destinations" onClick={closeMobile} className="py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("nav.destinations")}
              </Link>
              <Link to="/trends" onClick={closeMobile} className="py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("nav.trends")}
              </Link>
              <Link to="/insights" onClick={closeMobile} className="py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("nav.insights")}
              </Link>
              <Link to="/experiences" onClick={closeMobile} className="py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("nav.experiences")}
              </Link>
              <Link to="/deals" onClick={closeMobile} className="py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("nav.deals")}
              </Link>
              <Link to="/blog" onClick={closeMobile} className="py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("nav.blog")}
              </Link>
              <Link to="/reviews" onClick={closeMobile} className="py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("nav.reviews")}
              </Link>
              <Link to="/support" onClick={closeMobile} className="py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("nav.support")}
              </Link>

              <div className="my-2 h-px w-full bg-slate-200/70 dark:bg-slate-700/60" />

              <Link to="/gallery" onClick={closeMobile} className="py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("nav.gallery")}
              </Link>
              <Link to="/special-offers" onClick={closeMobile} className="py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("nav.offers")}
              </Link>
              <Link to="/concierge" onClick={closeMobile} className="py-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {t("nav.concierge")}
              </Link>

              <div className="my-2 h-px w-full bg-slate-200/70 dark:bg-slate-700/60" />

              {user ? (
                <>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300 truncate">
                    {displayName}
                  </div>
                  <Link
                    to="/profile"
                    onClick={closeMobile}
                    className="py-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    {t("nav.profile")}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl shadow-md transition-colors"
                  >
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="w-full text-center px-4 py-2 bg-white text-slate-800 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobile}
                    className="w-full text-center px-4 py-2 bg-gradient-to-r from-jordan-blue to-jordan-teal text-white text-sm font-semibold rounded-xl shadow-md"
                  >
                    {t("nav.signup")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;