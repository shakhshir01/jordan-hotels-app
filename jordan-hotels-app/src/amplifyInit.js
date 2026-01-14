import { Amplify } from "aws-amplify";
import { Analytics } from "@aws-amplify/analytics";

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
      if (resp && resp.ok) cfg = await resp.json();
    } catch {
      // ignore fetch errors; cfg stays null
    }

    if (cfg) {
      Amplify.configure(cfg);

      // Configure analytics to allow unauthenticated users
      Analytics.configure({
        AWSPinpoint: {
          ...cfg.Analytics?.AWSPinpoint,
          // Allow guest/unauthenticated users to send analytics
          allowGuestUsers: true
        }
      });
    }
  } catch {
    // Non-fatal: app should still boot even if Amplify isn't fully configured yet.
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
