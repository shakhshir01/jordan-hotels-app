/**
 * Test Utilities and Setup
 * Helper functions for testing React components
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HashRouter } from 'react-router-dom';
import { expect, vi } from 'vitest';

/**
 * Custom render function with providers
 */
export const renderWithProviders = (ui, options = {}) => {
  const Wrapper = ({ children }) => (
    <HashRouter>{children}</HashRouter>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

/**
 * Mock API responses
 */
export const mockApiResponse = (status = 200, data = {}) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => data,
  text: async () => JSON.stringify(data),
});

/**
 * Setup API mocks
 */
export const setupApiMocks = () => {
  globalThis.fetch = vi.fn();
};

/**
 * Mock authentication
 */
export const mockAuthContext = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
  },
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  signUp: vi.fn(),
};

/**
 * Mock hotel data
 */
export const mockHotel = {
  id: 'hotel-1',
  name: 'Test Hotel',
  location: 'Amman',
  price: 150,
  rating: 4.5,
  reviews: 120,
  image: 'https://example.com/hotel.jpg',
  amenities: ['WiFi', 'Pool', 'Gym'],
  description: 'A beautiful test hotel',
};

/**
 * Mock booking data
 */
export const mockBooking = {
  id: 'booking-1',
  hotelId: 'hotel-1',
  userId: 'user-1',
  checkInDate: '2024-12-25',
  checkOutDate: '2024-12-30',
  guests: 2,
  totalPrice: 750,
  status: 'confirmed',
};

/**
 * Common test selectors
 */
export const testSelectors = {
  loadingSpinner: () => screen.getByRole('status'),
  errorMessage: () => screen.getByRole('alert'),
  successMessage: () => screen.getByText(/success/i),
  button: (name) => screen.getByRole('button', { name }),
  input: (label) => screen.getByLabelText(label),
  link: (name) => screen.getByRole('link', { name }),
};

/**
 * Wait for async operations
 */
export const waitFor = async (callback, options = {}) => {
  const { timeout = 1000, interval = 50 } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      callback();
      return;
    } catch (_error) {
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  throw new Error('Timeout waiting for callback');
};

/**
 * User interaction helpers
 */
export const userInteractions = {
  /**
   * Type text into input
   */
  typeInput: async (input, text) => {
    const user = userEvent.setup();
    await user.type(input, text);
  },

  /**
   * Click a button
   */
  clickButton: async (buttonName) => {
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: buttonName });
    await user.click(button);
  },

  /**
   * Select dropdown option
   */
  selectOption: async (selectElement, optionText) => {
    const user = userEvent.setup();
    await user.click(selectElement);
    const option = screen.getByText(optionText);
    await user.click(option);
  },

  /**
   * Fill form
   */
  fillForm: async (fields) => {
    const user = userEvent.setup();
    for (const [label, value] of Object.entries(fields)) {
      const input = screen.getByLabelText(label);
      await user.clear(input);
      await user.type(input, value);
    }
  },

  /**
   * Submit form
   */
  submitForm: async () => {
    const user = userEvent.setup();
    const submitButton = screen.getByRole('button', { type: 'submit' });
    await user.click(submitButton);
  },
};

/**
 * Assertion helpers
 */
export const assertions = {
  /**
   * Assert element is visible
   */
  isVisible: (element) => {
    expect(element).toBeVisible();
  },

  /**
   * Assert element is disabled
   */
  isDisabled: (element) => {
    expect(element).toBeDisabled();
  },

  /**
   * Assert element has text
   */
  hasText: (element, text) => {
    expect(element).toHaveTextContent(text);
  },

  /**
   * Assert element has class
   */
  hasClass: (element, className) => {
    expect(element).toHaveClass(className);
  },

  /**
   * Assert element has attribute
   */
  hasAttribute: (element, attribute, value) => {
    expect(element).toHaveAttribute(attribute, value);
  },
};

export default {
  renderWithProviders,
  mockApiResponse,
  setupApiMocks,
  mockAuthContext,
  mockHotel,
  mockBooking,
  testSelectors,
  waitFor,
  userInteractions,
  assertions,
};
