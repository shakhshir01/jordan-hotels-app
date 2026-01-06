/**
 * Environment Configuration Service
 * Manages environment variables and configuration across different environments
 */

import React from 'react';

/**
 * Environment Config Manager
 */
export class ConfigManager {
  constructor() {
    this.env = this.detectEnvironment();
    this.config = this.loadConfig();
    this.validated = false;
  }

  /**
   * Detect current environment
   */
  detectEnvironment() {
    const nodeEnv = import.meta.env.MODE;
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

    if (nodeEnv === 'production' || hostname.includes('visitjo.com')) {
      return 'production';
    }

    if (nodeEnv === 'staging' || hostname.includes('staging')) {
      return 'staging';
    }

    return 'development';
  }

  /**
   * Load configuration based on environment
   */
  loadConfig() {
    const baseConfig = {
      appName: 'VisitJo',
      appVersion: '1.0.0',
      logLevel: 'info',
    };

    const envConfigs = {
      development: {
        api: 'http://localhost:3000/api',
        wsUrl: 'ws://localhost:3000',
        stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_....',
        logLevel: 'debug',
        enableDevTools: true,
        corsEnabled: true,
      },
      staging: {
        api: 'https://staging-api.visitjo.com',
        wsUrl: 'wss://staging-api.visitjo.com',
        stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
        logLevel: 'info',
        enableDevTools: false,
        corsEnabled: false,
      },
      production: {
        api: 'https://api.visitjo.com',
        wsUrl: 'wss://api.visitjo.com',
        stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
        logLevel: 'warn',
        enableDevTools: false,
        corsEnabled: false,
      },
    };

    return {
      ...baseConfig,
      ...envConfigs[this.env],
    };
  }

  /**
   * Get configuration value
   */
  get(key, defaultValue = undefined) {
    const keys = key.split('.');
    let value = this.config;

    for (const k of keys) {
      if (value === null || value === undefined) {
        return defaultValue;
      }
      value = value[k];
    }

    return value !== undefined ? value : defaultValue;
  }

  /**
   * Set configuration value
   */
  set(key, value) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    let obj = this.config;

    for (const k of keys) {
      if (!obj[k]) {
        obj[k] = {};
      }
      obj = obj[k];
    }

    obj[lastKey] = value;
  }

  /**
   * Validate configuration
   */
  validate() {
    const required = [
      'appName',
      'api',
      'wsUrl',
      'stripePublicKey',
      'logLevel',
    ];

    const missing = required.filter((key) => !this.get(key));

    if (missing.length > 0) {
      throw new Error(
        `Missing required configuration: ${missing.join(', ')}`
      );
    }

    this.validated = true;
    console.log('Configuration validated successfully');
  }

  /**
   * Get all configuration
   */
  getAll() {
    return { ...this.config };
  }

  /**
   * Check if in production
   */
  isProduction() {
    return this.env === 'production';
  }

  /**
   * Check if in staging
   */
  isStaging() {
    return this.env === 'staging';
  }

  /**
   * Check if in development
   */
  isDevelopment() {
    return this.env === 'development';
  }

  /**
   * Get current environment
   */
  getEnvironment() {
    return this.env;
  }
}

/**
 * Feature Flags
 */
export class FeatureFlags {
  constructor() {
    this.flags = {
      // Payment features
      stripePayments: true,
      squarePayments: false,
      paypalPayments: false,

      // Booking features
      instantBooking: true,
      requestToBook: false,
      guestCheckout: true,

      // Search features
      advancedSearch: true,
      mapSearch: false,
      aiRecommendations: false,

      // Community features
      reviews: true,
      userPhotos: true,
      hostingMode: false,

      // Experimental features
      realTimeAvailability: true,
      pricePrediction: false,
      chatSupport: false,

      // Admin features
      analyticsEnabled: true,
      adminPanel: true,

      // Performance
      serviceWorker: true,
      imageLazyLoading: true,
      codeOptimization: true,
    };
  }

  /**
   * Check if feature is enabled
   */
  isEnabled(featureName) {
    return this.flags[featureName] ?? false;
  }

  /**
   * Enable feature
   */
  enable(featureName) {
    this.flags[featureName] = true;
  }

  /**
   * Disable feature
   */
  disable(featureName) {
    this.flags[featureName] = false;
  }

  /**
   * Toggle feature
   */
  toggle(featureName) {
    this.flags[featureName] = !this.flags[featureName];
  }

  /**
   * Get all flags
   */
  getAll() {
    return { ...this.flags };
  }
}

/**
 * Global configuration instance
 */
export const config = new ConfigManager();
export const featureFlags = new FeatureFlags();

/**
 * React Hook for configuration
 */
export const useConfig = (key, defaultValue) => {
  return config.get(key, defaultValue);
};

/**
 * React Hook for feature flags
 */
export const useFeatureFlag = (featureName) => {
  const [enabled, setEnabled] = React.useState(() =>
    featureFlags.isEnabled(featureName)
  );

  React.useEffect(() => {
    const checkFlag = () => {
      setEnabled(featureFlags.isEnabled(featureName));
    };

    // Check periodically for flag changes
    const interval = setInterval(checkFlag, 5000);
    return () => clearInterval(interval);
  }, [featureName]);

  return enabled;
};

/**
 * Get API configuration
 */
export const getAPIConfig = () => ({
  baseURL: config.get('api'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get WebSocket configuration
 */
export const getWSConfig = () => ({
  url: config.get('wsUrl'),
  reconnect: true,
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
});

/**
 * Stripe configuration
 */
export const getStripeConfig = () => ({
  publicKey: config.get('stripePublicKey'),
  locale: 'en',
  appearance: {
    theme: 'flat',
    variables: {
      colorPrimary: '#1a5f7a',
      colorBackground: '#ffffff',
    },
  },
});

export default {
  ConfigManager,
  FeatureFlags,
  config,
  featureFlags,
  useConfig,
  useFeatureFlag,
  getAPIConfig,
  getWSConfig,
  getStripeConfig,
};
