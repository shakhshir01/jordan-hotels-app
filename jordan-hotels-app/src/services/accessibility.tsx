/**
 * Accessibility Utilities & Components
 * WCAG 2.1 Level AA compliance
 */

import React from 'react';

/**
 * Keyboard Navigation Hook with Enhanced Features
 */
export const useKeyboardNavigation = (items, onSelect, options = {}) => {
  const {
    loop = true,
    activateOnEnter = true,
    activateOnSpace = true,
    autoFocus = false
  } = options;

  const [focusedIndex, setFocusedIndex] = React.useState(autoFocus ? 0 : -1);

  const handleKeyDown = React.useCallback((e) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => {
          if (prev <= 0) return loop ? items.length - 1 : 0;
          return prev - 1;
        });
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => {
          if (prev >= items.length - 1) return loop ? 0 : items.length - 1;
          return prev + 1;
        });
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
      case 'Enter':
        if (activateOnEnter) {
          e.preventDefault();
          onSelect(items[focusedIndex]);
        }
        break;
      case ' ':
        if (activateOnSpace) {
          e.preventDefault();
          onSelect(items[focusedIndex]);
        }
        break;
      default:
        break;
    }
  }, [focusedIndex, items, onSelect, loop, activateOnEnter, activateOnSpace]);

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return { focusedIndex, setFocusedIndex };
};

/**
 * Enhanced Focus Trap for Modals with Better Accessibility
 */
export const useFocusTrap = (ref, options = {}) => {
  const { returnFocusOnDeactivate = true, initialFocusRef } = options;

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus initial element
    const initialElement = initialFocusRef?.current || firstElement;
    initialElement?.focus();

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

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

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        // Return focus to trigger element if specified
        if (returnFocusOnDeactivate) {
          const triggerElement = document.querySelector('[data-focus-trigger]');
          (triggerElement as HTMLElement)?.focus();
        }
      }
    };

    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('keydown', handleEscape);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      element.removeEventListener('keydown', handleEscape);
    };
  }, [ref, initialFocusRef, returnFocusOnDeactivate]);
};

/**
 * Screen Reader Announcements
 */
export const useAriaLive = () => {
  const [announcement, setAnnouncement] = React.useState('');
  const [priority, setPriority] = React.useState('polite');

  const announce = React.useCallback((message, urgent = false) => {
    setAnnouncement('');
    setPriority(urgent ? 'assertive' : 'polite');
    // Force reflow to trigger screen reader announcement
    setTimeout(() => setAnnouncement(message), 100);
  }, []);

  return { announcement, announce, priority };
};

/**
 * Accessible Button Component
 */
interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
}

export const AccessibleButton = React.forwardRef<HTMLButtonElement, AccessibleButtonProps>(({
  children,
  onClick,
  disabled,
  ariaLabel,
  ariaPressed,
  ariaExpanded,
  ...props
}, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    aria-pressed={ariaPressed}
    aria-expanded={ariaExpanded}
    {...props}
  >
    {children}
  </button>
));

AccessibleButton.displayName = 'AccessibleButton';

AccessibleButton.displayName = 'AccessibleButton';



/**
 * Check contrast ratio (WCAG AA: 4.5:1 for text)
 */
export const getContrastRatio = (color1, color2) => {
  const getRelativeLuminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16);
    let r = (rgb >> 16) & 0xff;
    let g = (rgb >> 8) & 0xff;
    let b = (rgb >> 0) & 0xff;

    // Normalize to 0-1
    r /= 255;
    g /= 255;
    b /= 255;

    // Linearize for sRGB
    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
};
