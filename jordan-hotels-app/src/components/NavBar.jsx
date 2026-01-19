import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { MapPin, Camera, Tag, TrendingUp, BarChart3, MessageSquare, Image, HelpCircle, Settings, Heart } from "lucide-react";

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

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-jordan-sand/20 dark:border-slate-700/50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-jordan-blue to-jordan-teal bg-clip-text text-transparent hover:from-jordan-teal hover:to-jordan-blue transition-all duration-300 tracking-wide"
          >
            <span className="capitalize">Visit</span>
            <span className="ml-1">Jo</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-10">
            <Link
              to="/destinations"
              className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-jordan-blue font-medium transition-all duration-300 text-sm hover:scale-105"
            >
              <MapPin size={16} />
              {t("nav.destinations")}
            </Link>
            <Link
              to="/experiences"
              className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-jordan-rose font-medium transition-all duration-300 text-sm hover:scale-105"
            >
              <Camera size={16} />
              {t("nav.experiences")}
            </Link>
            <Link
              to="/deals"
              className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-jordan-gold font-medium transition-all duration-300 text-sm hover:scale-105"
            >
              <Tag size={16} />
              {t("nav.deals")}
            </Link>
            <Link
              to="/trends"
              className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-jordan-blue font-medium transition-all duration-300 text-sm hover:scale-105"
            >
              <TrendingUp size={16} />
              {t("nav.trends", "Trends")}
            </Link>
            <Link
              to="/insights"
              className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-jordan-teal font-medium transition-all duration-300 text-sm hover:scale-105"
            >
              <BarChart3 size={16} />
              {t("nav.insights", "Insights")}
            </Link>
            <Link
              to="/reviews"
              className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-jordan-rose font-medium transition-all duration-300 text-sm hover:scale-105"
            >
              <MessageSquare size={16} />
              {t("nav.reviews", "Reviews")}
            </Link>
            <Link
              to="/blog"
              className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-jordan-gold font-medium transition-all duration-300 text-sm hover:scale-105"
            >
              <Image size={16} />
              {t("nav.blog", "Blog")}
            </Link>
            <Link
              to="/gallery"
              className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-jordan-blue font-medium transition-all duration-300 text-sm hover:scale-105"
            >
              <Image size={16} />
              {t("nav.gallery", "Gallery")}
            </Link>
            <Link
              to="/support"
              className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-jordan-teal font-medium transition-all duration-300 text-sm hover:scale-105"
            >
              <HelpCircle size={16} />
              {t("nav.support", "Support")}
            </Link>
            {user && (
              <Link
                to="/wishlist"
                className="flex items-center gap-2 text-slate-700 dark:text-slate-200 hover:text-jordan-rose font-medium transition-all duration-300 text-sm hover:scale-105"
              >
                <Heart size={16} />
                {t("nav.wishlist", "Wishlist")}
              </Link>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={onAccessibilityClick}
              aria-label={t('accessibility.settings', 'Accessibility Settings')}
              className="p-2 text-slate-700 dark:text-slate-200 hover:text-jordan-blue dark:hover:text-jordan-teal transition-colors duration-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Settings size={20} />
            </button>
            <ThemeToggle />
            <LanguageSwitcher />
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-slate-700 dark:text-slate-200 font-medium">
                  {displayName}
                </span>
                <Link
                  to="/profile"
                  className="text-slate-700 dark:text-slate-200 hover:text-jordan-blue font-medium transition-colors duration-300"
                >
                  {t("nav.profile")}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Log out"
                  className="bg-gradient-to-r from-jordan-blue to-jordan-teal hover:from-jordan-teal hover:to-jordan-blue text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg min-h-[44px]"
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-slate-700 dark:text-slate-200 hover:text-jordan-blue font-medium transition-colors duration-300"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-jordan-rose to-jordan-gold hover:from-jordan-gold hover:to-jordan-rose text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
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
              className="p-3 min-h-[44px] min-w-[44px] rounded-md text-slate-700 dark:text-slate-200 hover:text-jordan-blue hover:bg-jordan-blue/5 transition-colors duration-300"
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
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-16 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 shadow-2xl animate-slide-down"
            >
              <div className="px-4 pt-4 pb-6 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto">
                <Link to="/destinations" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:text-jordan-blue hover:bg-jordan-blue/5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
                  <MapPin size={20} />
                  {t("nav.destinations")}
                </Link>
                <Link to="/experiences" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:text-jordan-rose hover:bg-jordan-rose/5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
                  <Camera size={20} />
                  {t("nav.experiences")}
                </Link>
                <Link to="/deals" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:text-jordan-gold hover:bg-jordan-gold/5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
                  <Tag size={20} />
                  {t("nav.deals")}
                </Link>
                <Link to="/trends" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:text-jordan-blue hover:bg-jordan-blue/5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
                  <TrendingUp size={20} />
                  {t("nav.trends", "Trends")}
                </Link>
                <Link to="/insights" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:text-jordan-teal hover:bg-jordan-teal/5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
                  <BarChart3 size={20} />
                  {t("nav.insights", "Insights")}
                </Link>
                <Link to="/reviews" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:text-jordan-rose hover:bg-jordan-rose/5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
                  <MessageSquare size={20} />
                  {t("nav.reviews", "Reviews")}
                </Link>
                <Link to="/blog" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:text-jordan-gold hover:bg-jordan-gold/5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
                  <Image size={20} />
                  {t("nav.blog", "Blog")}
                </Link>
                <Link to="/gallery" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:text-jordan-blue hover:bg-jordan-blue/5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
                  <Image size={20} />
                  {t("nav.gallery", "Gallery")}
                </Link>
                <Link to="/support" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:text-jordan-teal hover:bg-jordan-teal/5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
                  <HelpCircle size={20} />
                  {t("nav.support", "Support")}
                </Link>
                {user && (
                  <Link to="/wishlist" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:text-jordan-rose hover:bg-jordan-rose/5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
                    <Heart size={20} />
                    {t("nav.wishlist", "Wishlist")}
                  </Link>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-slate-700 my-4" />

              {user ? (
                <div className="space-y-3 px-4 pb-6">
                  <div className="px-4 py-3 text-gray-900 dark:text-white font-semibold bg-gray-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-jordan-blue to-jordan-teal rounded-full flex items-center justify-center text-white font-bold">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{displayName}</span>
                    </div>
                  </div>
                  <Link to="/profile" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 text-slate-700 dark:text-slate-200 hover:text-jordan-blue hover:bg-jordan-blue/5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t("nav.profile")}
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 bg-gradient-to-r from-jordan-blue to-jordan-teal hover:from-jordan-teal hover:to-jordan-blue text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 px-4 pb-6">
                  <Link to="/login" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t("nav.login")}
                  </Link>
                  <Link to="/signup" onClick={closeMobile} className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-jordan-rose to-jordan-gold hover:from-jordan-gold hover:to-jordan-rose text-white rounded-xl font-medium text-center transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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