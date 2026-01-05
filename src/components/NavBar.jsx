import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const displayName = user
    ? (userProfile?.displayName || (() => {
        const email = user.email || '';
        const isUUID = email.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        return isUUID ? t('nav.account') : email.split('@')[0];
      })())
    : '';

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 dark:bg-slate-900/80 dark:border-slate-700/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
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
            {user && (
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {displayName}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
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
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;