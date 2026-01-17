/**
 * Accessibility Utilities & Components
 * WCAG 2.1 Level AA compliance
 */

import React from 'react';

/**
 * Keyboard Navigation Hook
 */
export const useKeyboardNavigation = (items, onSelect) => {
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const handleKeyDown = React.useCallback((e) => {
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
  }, [focusedIndex, items, onSelect]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { focusedIndex, setFocusedIndex };
};

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
