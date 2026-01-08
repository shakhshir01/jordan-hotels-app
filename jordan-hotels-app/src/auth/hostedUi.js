const runtimeCfg =
  typeof window !== 'undefined' ? window.__VISITJO_RUNTIME_CONFIG__ : undefined;

const normalizeDomain = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw.replace(/\/$/, '');
  return `https://${raw.replace(/\/$/, '')}`;
};

const base64UrlEncode = (buffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const randomString = (bytes = 32) => {
  const out = new Uint8Array(bytes);
  crypto.getRandomValues(out);
  return base64UrlEncode(out);
};

const sha256 = async (text) => {
  const data = new TextEncoder().encode(text);
  return await crypto.subtle.digest('SHA-256', data);
};

const storageKeys = {
  codeVerifier: 'visitjo.pkce.verifier',
  state: 'visitjo.pkce.state',
  postLoginPath: 'visitjo.auth.postLoginPath',
};

export const getCognitoOAuthConfig = () => {
  const clientId =
    runtimeCfg?.VITE_COGNITO_CLIENT_ID || import.meta.env.VITE_COGNITO_CLIENT_ID || '';
  const domain =
    runtimeCfg?.VITE_COGNITO_DOMAIN || import.meta.env.VITE_COGNITO_DOMAIN || '';

  const redirectUri =
    import.meta.env.VITE_COGNITO_REDIRECT_URI ||
    (typeof window !== 'undefined' ? `${window.location.origin}/oauth/callback` : '');

  const logoutUri =
    import.meta.env.VITE_COGNITO_LOGOUT_URI ||
    (typeof window !== 'undefined' ? `${window.location.origin}/` : '');

  return {
    clientId: String(clientId || '').trim(),
    domainBaseUrl: normalizeDomain(domain),
    redirectUri: String(redirectUri || '').trim(),
    logoutUri: String(logoutUri || '').trim(),
  };
};

export const startHostedUISignIn = async ({ provider, postLoginPath = '/' } = {}) => {
  const { clientId, domainBaseUrl, redirectUri } = getCognitoOAuthConfig();
  if (!clientId || !domainBaseUrl || !redirectUri) {
    throw new Error('Cognito Hosted UI is not configured (missing domain/client/redirect URI).');
  }

  const state = randomString(16);
  const codeVerifier = randomString(48);
  const codeChallenge = base64UrlEncode(await sha256(codeVerifier));

  sessionStorage.setItem(storageKeys.state, state);
  sessionStorage.setItem(storageKeys.codeVerifier, codeVerifier);
  sessionStorage.setItem(storageKeys.postLoginPath, String(postLoginPath || '/'));

  const params = new URLSearchParams();
  params.set('response_type', 'code');
  params.set('client_id', clientId);
  params.set('redirect_uri', redirectUri);
  params.set('scope', 'openid email profile');
  params.set('state', state);
  params.set('code_challenge_method', 'S256');
  params.set('code_challenge', codeChallenge);
  if (provider) params.set('identity_provider', provider);

  window.location.assign(`${domainBaseUrl}/oauth2/authorize?${params.toString()}`);
};

export const exchangeCodeForTokens = async ({ code, state }) => {
  const { clientId, domainBaseUrl, redirectUri } = getCognitoOAuthConfig();
  if (!clientId || !domainBaseUrl || !redirectUri) {
    throw new Error('Cognito Hosted UI is not configured.');
  }

  const expectedState = sessionStorage.getItem(storageKeys.state);
  const verifier = sessionStorage.getItem(storageKeys.codeVerifier);
  if (!expectedState || !verifier) {
    throw new Error('Login session expired. Please try again.');
  }
  if (String(state || '') !== String(expectedState || '')) {
    throw new Error('Invalid login state. Please try again.');
  }
  if (!code) {
    throw new Error('Missing authorization code.');
  }

  const body = new URLSearchParams();
  body.set('grant_type', 'authorization_code');
  body.set('client_id', clientId);
  body.set('code', code);
  body.set('redirect_uri', redirectUri);
  body.set('code_verifier', verifier);

  const resp = await fetch(`${domainBaseUrl}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(text || `Token exchange failed (${resp.status})`);
  }

  const json = await resp.json();
  return {
    idToken: json?.id_token || '',
    accessToken: json?.access_token || '',
    refreshToken: json?.refresh_token || '',
    expiresIn: json?.expires_in,
    tokenType: json?.token_type,
  };
};

export const popPostLoginPath = () => {
  try {
    const path = sessionStorage.getItem(storageKeys.postLoginPath) || '/';
    sessionStorage.removeItem(storageKeys.postLoginPath);
    sessionStorage.removeItem(storageKeys.state);
    sessionStorage.removeItem(storageKeys.codeVerifier);
    return path;
  } catch {
    return '/';
  }
};

export const getHostedUILogoutUrl = () => {
  const { clientId, domainBaseUrl, logoutUri } = getCognitoOAuthConfig();
  if (!clientId || !domainBaseUrl || !logoutUri) return '';
  const params = new URLSearchParams();
  params.set('client_id', clientId);
  params.set('logout_uri', logoutUri);
  return `${domainBaseUrl}/logout?${params.toString()}`;
};
