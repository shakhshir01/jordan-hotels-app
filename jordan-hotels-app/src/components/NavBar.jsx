import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { MapPin, Camera, Tag, TrendingUp, BarChart3, MessageSquare, Image, HelpCircle } from "lucide-react";

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
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
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
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-jordan-blue to-jordan-teal hover:from-jordan-teal hover:to-jordan-blue text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
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
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-md text-slate-700 dark:text-slate-200 hover:text-jordan-blue hover:bg-jordan-blue/5 transition-colors duration-300"
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
          <div className="lg:hidden border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/destinations"
                onClick={closeMobile}
                className="block px-3 py-2 text-slate-700 dark:text-slate-200 hover:text-jordan-blue hover:bg-jordan-blue/5 rounded-md font-medium transition-colors duration-300"
              >
                {t("nav.destinations")}
              </Link>
              <Link
                to="/experiences"
                onClick={closeMobile}
                className="block px-3 py-2 text-slate-700 dark:text-slate-200 hover:text-jordan-rose hover:bg-jordan-rose/5 rounded-md font-medium transition-colors duration-300"
              >
                {t("nav.experiences")}
              </Link>
              <Link
                to="/deals"
                onClick={closeMobile}
                className="block px-3 py-2 text-slate-700 dark:text-slate-200 hover:text-jordan-gold hover:bg-jordan-gold/5 rounded-md font-medium transition-colors duration-300"
              >
                {t("nav.deals")}
              </Link>
              <Link
                to="/trends"
                onClick={closeMobile}
                className="block px-3 py-2 text-slate-700 dark:text-slate-200 hover:text-jordan-blue hover:bg-jordan-blue/5 rounded-md font-medium transition-colors duration-300"
              >
                {t("nav.trends", "Trends")}
              </Link>
              <Link
                to="/insights"
                onClick={closeMobile}
                className="block px-3 py-2 text-slate-700 dark:text-slate-200 hover:text-jordan-teal hover:bg-jordan-teal/5 rounded-md font-medium transition-colors duration-300"
              >
                {t("nav.insights", "Insights")}
              </Link>
              <Link
                to="/reviews"
                onClick={closeMobile}
                className="block px-3 py-2 text-slate-700 dark:text-slate-200 hover:text-jordan-rose hover:bg-jordan-rose/5 rounded-md font-medium transition-colors duration-300"
              >
                {t("nav.reviews", "Reviews")}
              </Link>
              <Link
                to="/blog"
                onClick={closeMobile}
                className="block px-3 py-2 text-slate-700 dark:text-slate-200 hover:text-jordan-gold hover:bg-jordan-gold/5 rounded-md font-medium transition-colors duration-300"
              >
                {t("nav.blog", "Blog")}
              </Link>
              <Link
                to="/gallery"
                onClick={closeMobile}
                className="block px-3 py-2 text-slate-700 dark:text-slate-200 hover:text-jordan-blue hover:bg-jordan-blue/5 rounded-md font-medium transition-colors duration-300"
              >
                {t("nav.gallery", "Gallery")}
              </Link>
              <Link
                to="/support"
                onClick={closeMobile}
                className="block px-3 py-2 text-slate-700 dark:text-slate-200 hover:text-jordan-teal hover:bg-jordan-teal/5 rounded-md font-medium transition-colors duration-300"
              >
                {t("nav.support", "Support")}
              </Link>

              <div className="border-t border-gray-200 my-3"></div>

              {user ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-gray-900 dark:text-white font-medium">
                    {displayName}
                  </div>
                  <Link
                    to="/profile"
                    onClick={closeMobile}
                    className="block px-3 py-2 text-slate-700 dark:text-slate-200 hover:text-jordan-blue hover:bg-jordan-blue/5 rounded-md font-medium transition-colors duration-300"
                  >
                    {t("nav.profile")}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 bg-gradient-to-r from-jordan-blue to-jordan-teal hover:from-jordan-teal hover:to-jordan-blue text-white rounded-md font-medium transition-all duration-300"
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="block px-3 py-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md font-medium transition-colors"
                  >
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobile}
                    className="block px-3 py-2 bg-gray-900 hover:bg-black text-white rounded-md font-medium text-center transition-colors"
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