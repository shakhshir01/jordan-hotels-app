const parseBoolean = (value, defaultValue) => {
  if (value === undefined || value === null || String(value).trim() === '') return defaultValue;
  const normalized = String(value).toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return defaultValue;
};

const parseNumber = (value, defaultValue) => {
  if (value === undefined || value === null || String(value).trim() === '') return defaultValue;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

const parseTelemetries = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return ['performance', 'errors', 'http'];
  const parts = raw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  const allowed = new Set(['performance', 'errors', 'http']);
  const filtered = parts.filter((p) => allowed.has(p));
  return filtered.length ? filtered : ['performance', 'errors', 'http'];
};

export async function initCloudWatchRum() {
  if (typeof window === 'undefined') return;

  // Default behavior: enable automatically when required fields exist.
  // You can force-disable by setting VITE_RUM_ENABLED=false.
  const rumEnabled = parseBoolean(import.meta.env.VITE_RUM_ENABLED, true);
  if (!rumEnabled) return;

  const applicationId = String(import.meta.env.VITE_RUM_APP_ID || '').trim();
  const region = String(import.meta.env.VITE_RUM_REGION || '').trim();
  if (!applicationId || !region) return;

  const appVersion = String(
    import.meta.env.VITE_RUM_APP_VERSION ||
      import.meta.env.VITE_APP_VERSION ||
      import.meta.env.VITE_GIT_SHA ||
      import.meta.env.MODE ||
      'unknown'
  );

  const config = {
    sessionSampleRate: parseNumber(import.meta.env.VITE_RUM_SESSION_SAMPLE_RATE, 1),
    allowCookies: parseBoolean(import.meta.env.VITE_RUM_ALLOW_COOKIES, true),
    enableXRay: parseBoolean(import.meta.env.VITE_RUM_ENABLE_XRAY, false),
    telemetries: parseTelemetries(import.meta.env.VITE_RUM_TELEMETRIES),
  };

  const endpoint = String(import.meta.env.VITE_RUM_ENDPOINT || '').trim();
  if (endpoint) config.endpoint = endpoint;

  const identityPoolId = String(import.meta.env.VITE_RUM_IDENTITY_POOL_ID || '').trim();
  if (identityPoolId) config.identityPoolId = identityPoolId;

  const guestRoleArn = String(import.meta.env.VITE_RUM_GUEST_ROLE_ARN || '').trim();
  if (guestRoleArn) config.guestRoleArn = guestRoleArn;

  // CloudWatch snippet uses `signing`:
  // - If using Cognito/credentials, keep signing enabled.
  // - If using a public resource policy, unsigned requests are typically desired.
  const hasCredentialsConfig = Boolean(identityPoolId || guestRoleArn);
  config.signing = parseBoolean(import.meta.env.VITE_RUM_SIGNING, hasCredentialsConfig);

  try {
    const rumModule = await import('aws-rum-web');
    const AwsRum = rumModule?.AwsRum;
    if (!AwsRum) return;
    window.__visitjo_rum = new AwsRum(applicationId, appVersion, region, config);
  } catch {
    // Non-fatal; app should still boot even if RUM fails.
  }
}
