import { CognitoUserPool } from 'amazon-cognito-identity-js';

const runtimeCfg =
  typeof window !== 'undefined' ? window.__VISITJO_RUNTIME_CONFIG__ : undefined;

const poolData = {
  UserPoolId:
    runtimeCfg?.VITE_COGNITO_USER_POOL_ID ||
    import.meta.env.VITE_COGNITO_USER_POOL_ID ||
    '',
  ClientId:
    runtimeCfg?.VITE_COGNITO_CLIENT_ID ||
    import.meta.env.VITE_COGNITO_CLIENT_ID ||
    '',
};

let UserPool;
try {
  if (poolData.UserPoolId && poolData.ClientId) {
    UserPool = new CognitoUserPool(poolData);
  } else {
    console.warn('Cognito config incomplete');
    UserPool = null;
  }
} catch (err) {
  console.error('Failed to initialize Cognito UserPool:', err);
  UserPool = null;
}

export { UserPool };