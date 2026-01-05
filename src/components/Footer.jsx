import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-24 border-t border-slate-200 bg-gradient-to-b from-transparent to-slate-50 dark:border-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="text-2xl font-black font-display tracking-tighter bg-gradient-to-r from-jordan-blue to-jordan-teal bg-clip-text text-transparent mb-4">
              VISITJO
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 max-w-xs">
              {t("footer.brandDescription")}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              © {new Date().getFullYear()} {t("footer.copyright")}
            </p>
          </div>

          {/* Explore */}
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
              {t("footer.explore")}
            </div>
            <div className="space-y-3">
              <Link to="/destinations" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                {t("nav.destinations")}
              </Link>
              <Link to="/experiences" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                {t("nav.experiences")}
              </Link>
              <Link to="/deals" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                {t("footer.dealsOffers")}
              </Link>
              <Link to="/blog" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                {t("footer.travelBlog")}
              </Link>
            </div>
          </div>

          {/* Plan */}
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
              {t("footer.plan")}
            </div>
            <div className="space-y-3">
              <Link to="/trip-planner" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                {t("footer.tripPlanner")}
              </Link>
              <Link to="/wishlist" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                {t("nav.wishlist")}
              </Link>
              <Link to="/reviews" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                {t("nav.reviews")}
              </Link>
              <Link to="/support" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                {t("footer.helpSupport")}
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
              {t("footer.company")}
            </div>
            <div className="space-y-3">
              <Link to="/about" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                {t("footer.about")}
              </Link>
              <Link to="/terms" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                {t("footer.terms")}
              </Link>
              <Link to="/privacy" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                {t("footer.privacy")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
