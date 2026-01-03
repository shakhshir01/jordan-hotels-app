/**
 * Accessibility Utilities & Components
 * WCAG 2.1 Level AA compliance
 */

/**
 * Keyboard Navigation Hook
 */
export const useKeyboardNavigation = (items, onSelect) => {
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(items[focusedIndex]);
        break;
      default:
        break;
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, items]);

  return { focusedIndex, setFocusedIndex };
};

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
    className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 bg-blue-900 text-white px-4 py-2"
  >
    Skip to main content
  </a>
);

/**
 * Accessible Focus Trap (for modals)
 */
export const useFocusTrap = (ref) => {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = ref.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    const element = ref.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      if (element) {
        element.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [ref]);
};

/**
 * Announce to Screen Readers
 */
export const useAriaLive = () => {
  const [announcement, setAnnouncement] = React.useState('');

  const announce = React.useCallback((message) => {
    setAnnouncement('');
    // Force reflow to trigger screen reader announcement
    setTimeout(() => setAnnouncement(message), 100);
  }, []);

  return { announcement, announce };
};

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
    aria-pressed={ariaPressed}
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

/**
 * Check contrast ratio (WCAG AA: 4.5:1 for text)
 */
export const getContrastRatio = (color1, color2) => {
  const getLuminance = (color) => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5
      ? (luminance + 0.05) / (0.05 + 0.05)
      : (0.05 + 0.05) / (luminance + 0.05);
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  return Math.max(l1, l2) / Math.min(l1, l2);
};

import React from 'react';

export default {
  useKeyboardNavigation,
  ScreenReaderOnly,
  SkipToMainLink,
  useFocusTrap,
  useAriaLive,
  AccessibleAlert,
  AccessibleButton,
  AccessibleLabel,
  getContrastRatio,
};
