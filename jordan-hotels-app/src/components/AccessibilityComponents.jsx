/**
 * Accessibility Components
 * WCAG 2.1 Level AA compliance
 */

import React from 'react';

/**
 * Screen Reader Only Text
 */
export const ScreenReaderOnly = ({ children }) => (
  <span className="sr-only absolute w-px h-px p-0 m-(-1px) overflow-hidden border-0">
    {children}
  </span>
);

/**
 * Skip to Main Content Link
 */
export const SkipToMainLink = () => (
  <a
    href="#main-content"
    className="skip-link"
    aria-label="Skip to main content"
  >
    Skip to main content
  </a>
);

/**
 * Accessible Alert Dialog
 */
export const AccessibleAlert = ({ message, type = 'info', role = 'alert' }) => {
  const alertStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  };

  return (
    <div
      role={role}
      className={`p-4 border rounded-lg ${alertStyles[type]}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
};

/**
 * Accessible Button
 */
export const AccessibleButton = ({
  children,
  disabled = false,
  ariaLabel,
  ariaPressed,
  onClick,
  className = '',
  ...props
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    aria-label={ariaLabel}
    {...(ariaPressed !== undefined && { 'aria-pressed': ariaPressed })}
    className={`focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

/**
 * Accessible Form Label
 */
export const AccessibleLabel = ({ htmlFor, required, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700 mb-2">
    {children}
    {required && <span className="text-red-600 ml-1" aria-label="required">*</span>}
  </label>
);