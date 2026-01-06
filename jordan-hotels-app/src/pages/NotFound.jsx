import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-card rounded-3xl p-12 text-center max-w-md">
        <h1 className="text-6xl font-black font-display mb-4 text-slate-900 dark:text-slate-100">404</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">Page not found</p>
        <Link to="/" className="btn-primary inline-block">Go home</Link>
      </div>
    </div>
  );
}
