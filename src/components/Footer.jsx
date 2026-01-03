import { Link } from "react-router-dom";

export default function Footer() {
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
              Premium travel discovery and booking experiences for Jordan—connecting you with the best stays, experiences, and destinations.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              © {new Date().getFullYear()} VisitJo. All rights reserved.
            </p>
          </div>

          {/* Explore */}
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
              Explore
            </div>
            <div className="space-y-3">
              <Link to="/destinations" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                Destinations
              </Link>
              <Link to="/experiences" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                Experiences
              </Link>
              <Link to="/deals" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                Deals & Offers
              </Link>
              <Link to="/blog" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                Travel Blog
              </Link>
            </div>
          </div>

          {/* Plan */}
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
              Plan
            </div>
            <div className="space-y-3">
              <Link to="/trip-planner" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                Trip Planner
              </Link>
              <Link to="/wishlist" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                Wishlist
              </Link>
              <Link to="/reviews" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                Reviews
              </Link>
              <Link to="/support" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                Help & Support
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-4">
              Company
            </div>
            <div className="space-y-3">
              <Link to="/about" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                About Us
              </Link>
              <Link to="/terms" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/privacy" className="block text-sm text-slate-600 hover:text-jordan-blue dark:text-slate-400 dark:hover:text-blue-400 transition-colors duration-200">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
