import { Amplify, Auth } from "aws-amplify";
import { Analytics } from "@aws-amplify/analytics";
import { setAuthToken } from "./services/api";

let didInit = false;

export async function initAmplify() {
  if (didInit) return;
  didInit = true;

  try {
    // Try to load runtime configuration from a public JSON file. Using fetch
    // avoids bundler resolution errors in CI when the file is intentionally
    // not committed to the repository (it's often ignored for security).
    let cfg = null;
    try {
      const resp = await fetch('/amplifyconfiguration.json', { cache: 'no-store' });
      if (resp && resp.ok) {
        cfg = await resp.json();
      }
    } catch (_fetchError) {
      // Error fetching config
    }

    if (cfg) {
      // Override redirect URLs with environment variables for production
      if (cfg.oauth) {
        cfg.oauth.redirectSignIn = import.meta.env.VITE_REDIRECT_SIGN_IN || cfg.oauth.redirectSignIn;
        cfg.oauth.redirectSignOut = import.meta.env.VITE_REDIRECT_SIGN_OUT || cfg.oauth.redirectSignOut;
      }
      if (cfg.Auth && cfg.Auth.oauth) {
        cfg.Auth.oauth.redirectSignIn = import.meta.env.VITE_REDIRECT_SIGN_IN || cfg.Auth.oauth.redirectSignIn;
        cfg.Auth.oauth.redirectSignOut = import.meta.env.VITE_REDIRECT_SIGN_OUT || cfg.Auth.oauth.redirectSignOut;
      }

      Amplify.configure(cfg);

      // Configure analytics to allow unauthenticated users
      Analytics.configure({
        AWSPinpoint: {
          ...cfg.Analytics?.AWSPinpoint,
          // Allow guest/unauthenticated users to send analytics
          allowGuestUsers: true
        }
      });

      // Mark as configured
      if (typeof window !== 'undefined') {
        window.amplifyConfigured = true;
        console.log('Amplify configured successfully');
      }
    } else {
      // If no amplifyconfiguration.json was found, attempt to bootstrap
      // a minimal Amplify config from the runtime `window.__VISITJO_RUNTIME_CONFIG__`.
      // This enables the hosted frontend to initialize Amplify/Auth when
      // the build-time json isn't present.
      try {
        const runtimeCfg = typeof window !== 'undefined' ? window.__VISITJO_RUNTIME_CONFIG__ : null;
        if (runtimeCfg && runtimeCfg.VITE_COGNITO_USER_POOL_ID && runtimeCfg.VITE_COGNITO_CLIENT_ID) {
          const fallback = {
            Auth: {
              region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
              userPoolId: runtimeCfg.VITE_COGNITO_USER_POOL_ID,
              userPoolWebClientId: runtimeCfg.VITE_COGNITO_CLIENT_ID,
            }
          };

          // If a hosted UI domain is provided, wire up the oauth entries.
          if (runtimeCfg.VITE_COGNITO_DOMAIN) {
            fallback.Auth.oauth = {
              domain: runtimeCfg.VITE_COGNITO_DOMAIN,
              scope: ['email','openid','profile'],
              redirectSignIn: import.meta.env.VITE_REDIRECT_SIGN_IN || `${window.location.origin}/auth/callback`,
              redirectSignOut: import.meta.env.VITE_REDIRECT_SIGN_OUT || `${window.location.origin}/`,
              responseType: 'code'
            };
          }

          Amplify.configure(fallback);
          Analytics.configure({
            AWSPinpoint: {
              // minimal noop; avoid errors when Analytics isn't configured
              appId: runtimeCfg.AWSPINPOINT_APP_ID || undefined,
              region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
              allowGuestUsers: true
            }
          });

          // Mark as configured
          if (typeof window !== 'undefined') {
            window.amplifyConfigured = true;
            console.log('Amplify configured with fallback config');
          }
        } else if (import.meta.env.VITE_COGNITO_USER_POOL_ID && import.meta.env.VITE_COGNITO_CLIENT_ID) {
          // Fallback to VITE environment variables directly
          const fallback = {
            Auth: {
              region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
              userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
              userPoolWebClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
            }
          };

          // If a hosted UI domain is provided, wire up the oauth entries.
          if (import.meta.env.VITE_COGNITO_DOMAIN) {
            fallback.Auth.oauth = {
              domain: import.meta.env.VITE_COGNITO_DOMAIN,
              scope: ['email','openid','profile'],
              redirectSignIn: import.meta.env.VITE_REDIRECT_SIGN_IN || `${window.location.origin}/auth/callback`,
              redirectSignOut: import.meta.env.VITE_REDIRECT_SIGN_OUT || `${window.location.origin}/`,
              responseType: 'code'
            };
          }

          Amplify.configure(fallback);
          Analytics.configure({
            AWSPinpoint: {
              region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
              allowGuestUsers: true
            }
          });

          // Mark as configured
          if (typeof window !== 'undefined') {
            window.amplifyConfigured = true;
            console.log('Amplify configured with VITE env vars');
          }
        }
      } catch (_e) {
        console.log('Failed to bootstrap Amplify config:', _e);
        // ignore bootstrap errors
      }

      // If no configuration was set, log it
      if (typeof window !== 'undefined' && !window.amplifyConfigured) {
        console.log('No Amplify configuration found - running without auth');
      }
    }
  } catch (_error) {
    // Error initializing Amplify
  }

  // After configuring Amplify, if there's an existing authenticated session
  // set the API Authorization header immediately so early requests include it.
  if (typeof window !== 'undefined' && window.amplifyConfigured) {
    try {
      const session = await Auth.currentSession();
      if (session) {
        try {
          const idToken = session.getIdToken().getJwtToken();
          setAuthToken(idToken);
        } catch (_e) {
          // ignore token set failures
        }
      }
    } catch (_err) {
      // no session available, that's fine
    }
  }

  // Optional test event (safe to ignore if Analytics isn't configured yet)
  // Temporarily disabled to prevent credential errors in development
  /*
  setTimeout(() => {
    try {
      Analytics.record({ name: "appOpened" });
    } catch {
      // ignore
    }
  }, 2000);
  */
}
