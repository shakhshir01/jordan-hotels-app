import React from 'react';

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} border-4 border-slate-200 border-t-blue-900 rounded-full animate-spin`} />
    </div>
  );
};

export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-slate-600 font-semibold">{message}</p>
    </div>
  );
};

export const InlineLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <div className="w-5 h-5 border-3 border-slate-200 border-t-blue-900 rounded-full animate-spin" />
      <p className="text-slate-600">{message}</p>
    </div>
  );
};
