import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { MapPin, Camera, Tag, TrendingUp, BarChart3, MessageSquare, Image, HelpCircle, Accessibility, Heart } from "lucide-react";

const Navbar = ({ onAccessibilityClick }) => {
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

  const handleLogout = async () => {
    try {
      const res = await logout();
      setMobileOpen(false);
      if (!res?.mfaRequired) {
        navigate("/");
      }
    } catch (e) {
      console.error('Logout error:', e);
      navigate('/');
    }
  };

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  // Mobile swipe gesture for closing menu
  useEffect(() => {
    if (!mobileOpen) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (!startX || !startY) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;

      // If horizontal swipe is greater than vertical and more than 50px to the left
      if (Math.abs(diffX) > Math.abs(diffY) && diffX > 50) {
        setMobileOpen(false);
      }

      startX = 0;
      startY = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [mobileOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Premium Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2 text-2xl font-black transition-all duration-300 hover:scale-105"
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-purple-500 group-hover:to-blue-700 transition-all duration-300">
              Visit-Jo
            </span>
            <div className="hidden sm:block w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse opacity-80 group-hover:opacity-100 transition-opacity"></div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              to="/destinations"
              className="group flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 font-semibold transition-all duration-300 text-sm hover:scale-105"
            >
              <MapPin size={16} className="group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative">
                {t("nav.destinations")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            <Link
              to="/experiences"
              className="group flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 font-semibold transition-all duration-300 text-sm hover:scale-105"
            >
              <Camera size={16} className="group-hover:scale-110 transition-transform duration-300" />
              <span className="relative">
                {t("nav.experiences")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            <Link
              to="/deals"
              className="group flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 font-semibold transition-all duration-300 text-sm hover:scale-105"
            >
              <Tag size={16} className="group-hover:-rotate-12 transition-transform duration-300" />
              <span className="relative">
                {t("nav.deals")}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
              </span>
            </Link>
            {user ? (
              <Link
                to="/wishlist"
                className="group flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-red-600 font-semibold transition-all duration-300 text-sm hover:scale-105"
              >
                <Heart size={16} className="group-hover:fill-red-600 group-hover:scale-110 transition-all duration-300" />
                <span className="relative">
                  {t("nav.wishlist", "Wishlist")}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-pink-600 group-hover:w-full transition-all duration-300"></span>
                </span>
              </Link>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-red-600 font-medium transition-colors duration-300 text-sm"
              >
                <Heart size={16} />
                {t("nav.wishlist", "Wishlist")}
              </button>
            )}
            <Link
              to="/trends"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium transition-colors duration-300 text-sm"
            >
              <TrendingUp size={16} />
              {t("nav.trends", "Trends")}
            </Link>
            <Link
              to="/insights"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium transition-colors duration-300 text-sm"
            >
              <BarChart3 size={16} />
              {t("nav.insights", "Insights")}
            </Link>
            <Link
              to="/reviews"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium transition-colors duration-300 text-sm"
            >
              <MessageSquare size={16} />
              {t("nav.reviews", "Reviews")}
            </Link>
            <Link
              to="/blog"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium transition-colors duration-300 text-sm"
            >
              <Image size={16} />
              {t("nav.blog", "Blog")}
            </Link>
            <Link
              to="/gallery"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium transition-colors duration-300 text-sm"
            >
              <Image size={16} />
              {t("nav.gallery", "Gallery")}
            </Link>
            <Link
              to="/support"
              className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium transition-colors duration-300 text-sm"
            >
              <HelpCircle size={16} />
              {t("nav.support", "Support")}
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={onAccessibilityClick}
              aria-label={t('accessibility.settings', 'Accessibility Settings')}
              className="p-2 text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-colors duration-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Accessibility size={20} />
            </button>
            <ThemeToggle />
            <LanguageSwitcher />
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  {displayName}
                </span>
                <Link
                  to="/profile"
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium transition-colors duration-300"
                >
                  {t("nav.profile")}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 shadow-md min-h-[44px]"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-200 hover:text-blue-600 font-medium transition-colors duration-300"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-300 shadow-md"
                >
                  {t("nav.signup")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="p-3 min-h-[44px] min-w-[44px] rounded-md text-gray-700 dark:text-gray-200 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-300"
            >
              {mobileOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div
            onClick={closeMobile}
            className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label={t('nav.menu', 'Navigation menu')}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-16 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 shadow-2xl animate-slide-down"
              role="navigation"
              aria-label={t('nav.mainNavigation', 'Main navigation')}
            >
              <div className="px-4 pt-4 pb-6 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto" role="menu">
                <Link
                  to="/destinations"
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all duration-300 active:bg-blue-100 dark:active:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  role="menuitem"
                  aria-label={t("nav.destinations")}
                >
                  <MapPin size={20} aria-hidden="true" />
                  {t("nav.destinations")}
                </Link>
                <Link
                  to="/experiences"
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-slate-700 dark:text-slate-200 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl font-medium transition-all duration-300 active:bg-purple-100 dark:active:bg-purple-900/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  role="menuitem"
                  aria-label={t("nav.experiences")}
                >
                  <Camera size={20} aria-hidden="true" />
                  {t("nav.experiences")}
                </Link>
                <Link
                  to="/deals"
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-slate-700 dark:text-slate-200 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl font-medium transition-all duration-300 active:bg-orange-100 dark:active:bg-orange-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  role="menuitem"
                  aria-label={t("nav.deals")}
                >
                  <Tag size={20} aria-hidden="true" />
                  {t("nav.deals")}
                </Link>
                {user ? (
                  <Link
                    to="/wishlist"
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-slate-700 dark:text-slate-200 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-all duration-300 active:bg-red-100 dark:active:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    role="menuitem"
                    aria-label={t("nav.wishlist", "Wishlist")}
                  >
                    <Heart size={20} aria-hidden="true" />
                    {t("nav.wishlist", "Wishlist")}
                  </Link>
                ) : (
                  <button
                    onClick={() => { closeMobile(); navigate('/login'); }}
                    className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-slate-700 dark:text-slate-200 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-all duration-300 active:bg-red-100 dark:active:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full text-left"
                    role="menuitem"
                    aria-label={`${t("nav.wishlist", "Wishlist")} - ${t("nav.loginRequired", "Login required")}`}
                  >
                    <Heart size={20} aria-hidden="true" />
                    {t("nav.wishlist", "Wishlist")}
                  </button>
                )}
                <Link
                  to="/trends"
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all duration-300 active:bg-blue-100 dark:active:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  role="menuitem"
                  aria-label={t("nav.trends", "Trends")}
                >
                  <TrendingUp size={20} aria-hidden="true" />
                  {t("nav.trends", "Trends")}
                </Link>
                <Link
                  to="/insights"
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-slate-700 dark:text-slate-200 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl font-medium transition-all duration-300 active:bg-teal-100 dark:active:bg-teal-900/30 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  role="menuitem"
                  aria-label={t("nav.insights", "Insights")}
                >
                  <BarChart3 size={20} aria-hidden="true" />
                  {t("nav.insights", "Insights")}
                </Link>
                <Link
                  to="/reviews"
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-slate-700 dark:text-slate-200 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-xl font-medium transition-all duration-300 active:bg-pink-100 dark:active:bg-pink-900/30 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                  role="menuitem"
                  aria-label={t("nav.reviews", "Reviews")}
                >
                  <MessageSquare size={20} aria-hidden="true" />
                  {t("nav.reviews", "Reviews")}
                </Link>
                <Link
                  to="/blog"
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-slate-700 dark:text-slate-200 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl font-medium transition-all duration-300 active:bg-orange-100 dark:active:bg-orange-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  role="menuitem"
                  aria-label={t("nav.blog", "Blog")}
                >
                  <Image size={20} aria-hidden="true" />
                  {t("nav.blog", "Blog")}
                </Link>
                <Link
                  to="/gallery"
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all duration-300 active:bg-blue-100 dark:active:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  role="menuitem"
                  aria-label={t("nav.gallery", "Gallery")}
                >
                  <Image size={20} aria-hidden="true" />
                  {t("nav.gallery", "Gallery")}
                </Link>
                <Link
                  to="/support"
                  onClick={closeMobile}
                  className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-slate-700 dark:text-slate-200 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-xl font-medium transition-all duration-300 active:bg-teal-100 dark:active:bg-teal-900/30 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  role="menuitem"
                  aria-label={t("nav.support", "Support")}
                >
                  <HelpCircle size={20} aria-hidden="true" />
                  {t("nav.support", "Support")}
                </Link>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-700 my-4" />

              {user ? (
                <div className="space-y-3 px-4 pb-6" role="region" aria-label={t('nav.accountMenu', 'Account menu')}>
                  <div className="px-4 py-3 text-gray-900 dark:text-white font-semibold bg-gray-50 dark:bg-slate-800 rounded-xl min-h-[48px] flex items-center">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" aria-hidden="true">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate" title={displayName}>{displayName}</span>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all duration-300 active:bg-blue-100 dark:active:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    role="menuitem"
                    aria-label={t("nav.profile")}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t("nav.profile")}
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-slate-700 dark:text-slate-200 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-all duration-300 active:bg-red-100 dark:active:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    role="menuitem"
                    aria-label={t("nav.wishlist", "Wishlist")}
                  >
                    <Heart size={20} className="flex-shrink-0" aria-hidden="true" />
                    {t("nav.wishlist", "Wishlist")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 min-h-[48px] bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-300 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-lg"
                    role="menuitem"
                    aria-label={t("nav.logout")}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 px-4 pb-6" role="region" aria-label={t('nav.accountMenu', 'Account menu')}>
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-4 py-3 min-h-[48px] text-gray-700 dark:text-gray-200 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl font-medium transition-all duration-300 active:bg-blue-100 dark:active:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    role="menuitem"
                    aria-label={t("nav.login")}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-4 py-3 min-h-[48px] bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-300 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg"
                    role="menuitem"
                    aria-label={t("nav.signup")}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
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