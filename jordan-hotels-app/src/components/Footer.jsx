import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-black font-display tracking-tighter bg-gradient-to-r from-jordan-blue to-jordan-teal bg-clip-text text-transparent">
              VISITJO
            </Link>
            <p className="mt-4 text-slate-300 text-sm leading-relaxed">
              {t("footer.description", "Discover the wonders of Jordan with personalized travel experiences, authentic local insights, and unforgettable adventures.")}
            </p>
            <p className="mt-4 text-slate-300 text-sm leading-relaxed">
              {t("footer.description", "Your gateway to the Kingdom of Time. We curate the finest stays and experiences to help you discover the authentic soul of Jordan.")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.quickLinks", "Quick Links")}</h3>
            <ul className="space-y-2">
              <li><Link to="/destinations" className="text-slate-300 hover:text-white transition-colors">{t("nav.destinations")}</Link></li>
              <li><Link to="/experiences" className="text-slate-300 hover:text-white transition-colors">{t("nav.experiences")}</Link></li>
              <li><Link to="/deals" className="text-slate-300 hover:text-white transition-colors">{t("nav.deals")}</Link></li>
              <li><Link to="/blog" className="text-slate-300 hover:text-white transition-colors">{t("nav.blog")}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t("footer.support", "Support")}</h3>
            <ul className="space-y-2">
              <li><Link to="/support" className="text-slate-300 hover:text-white transition-colors">{t("nav.support")}</Link></li>
              <li><Link to="/about" className="text-slate-300 hover:text-white transition-colors">{t("nav.about")}</Link></li>
              <li><Link to="/privacy" className="text-slate-300 hover:text-white transition-colors">{t("nav.privacy")}</Link></li>
              <li><Link to="/terms" className="text-slate-300 hover:text-white transition-colors">{t("nav.terms")}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} VisitJo. {t("footer.rights", "All rights reserved.")}
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <span className="sr-only">Facebook</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">
              <span className="sr-only">Instagram</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C8.396 0 7.996.014 6.802.067 5.618.12 4.902.26 4.331.465c-.64.218-1.182.482-1.723.993C1.983 1.986 1.576 2.49 1.293 3.129 1.088 3.7.948 4.416.895 5.6.842 6.794.828 7.194.828 10.815c0 3.621.014 4.021.067 5.215.053 1.184.193 1.9.398 2.471.283.64.69 1.144 1.231 1.655.541.511 1.083.775 1.723.993.599.205 1.315.345 2.499.398C7.996 21.958 8.396 21.972 12.017 21.972c3.621 0 4.021-.014 5.215-.067 1.184-.053 1.9-.193 2.471-.398.64-.218 1.182-.482 1.723-.993.541-.511.948-1.015 1.231-1.655.205-.571.345-1.287.398-2.471.053-1.194.067-1.594.067-5.215 0-3.621-.014-4.021-.067-5.215-.053-1.184-.193-1.9-.398-2.471-.283-.64-.69-1.144-1.231-1.655C20.037 1.986 19.495 1.722 18.855 1.51c-.599-.205-1.315-.345-2.499-.398C16.038.014 15.638 0 12.017 0zm0 1.972c3.539 0 3.955.013 5.351.066 1.301.049 2.005.219 2.478.364.547.168.944.369 1.358.783.414.414.615.811.783 1.358.145.473.315 1.177.364 2.478.053 1.396.066 1.812.066 5.351 0 3.539-.013 3.955-.066 5.351-.049 1.301-.219 2.005-.364 2.478-.168.547-.369.944-.783 1.358-.414.414-.811.615-1.358.783-.473.145-1.177.315-2.478.364-1.396.053-1.812.066-5.351.066-3.539 0-3.955-.013-5.351-.066-1.301-.049-2.005-.219-2.478-.364-.547-.168-.944-.369-1.358-.783-.414-.414-.615-.811-.783-1.358-.145-.473-.315-1.177-.364-2.478-.053-1.396-.066-1.812-.066-5.351 0-3.539.013-3.955.066-5.351.049-1.301.219-2.005.364-2.478.168-.547.369-.944.783-1.358.414-.414.811-.615 1.358-.783.473-.145 1.177-.315 2.478-.364 1.396-.053 1.812-.066 5.351-.066zm0 3.891c-3.636 0-6.581 2.945-6.581 6.581 0 3.636 2.945 6.581 6.581 6.581 3.636 0 6.581-2.945 6.581-6.581 0-3.636-2.945-6.581-6.581-6.581zm0 10.834c-2.34 0-4.243-1.903-4.243-4.243 0-2.34 1.903-4.243 4.243-4.243 2.34 0 4.243 1.903 4.243 4.243 0 2.34-1.903 4.243-4.243 4.243zm8.485-11.236c0 .849-.687 1.536-1.536 1.536-.849 0-1.536-.687-1.536-1.536 0-.849.687-1.536 1.536-1.536.849 0 1.536.687 1.536 1.536z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
