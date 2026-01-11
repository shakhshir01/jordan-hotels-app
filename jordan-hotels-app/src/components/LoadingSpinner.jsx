import React from 'react';
import { Loader2 } from 'lucide-react';

export const InlineLoader = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="mt-4 text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  );
};

export const LoadingSpinner = ({ size = 24, className = "" }) => {
  return (
    <Loader2 className={`animate-spin ${className}`} size={size} />
  );
};

export default LoadingSpinner;
