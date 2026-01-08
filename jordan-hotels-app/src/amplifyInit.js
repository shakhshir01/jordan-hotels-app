import { Amplify } from "aws-amplify";
import { record } from "aws-amplify/analytics";
import awsExports from "./aws-exports";

let didInit = false;

export function initAmplify() {
  if (didInit) return;
  didInit = true;

  try {
    Amplify.configure(awsExports);
  } catch {
    // Non-fatal: app should still boot even if Amplify isn't fully configured yet.
  }

  // Optional test event (safe to ignore if Analytics isn't configured yet)
  try {
    record({ name: "appOpened" });
  } catch {
    // ignore
  }
}
