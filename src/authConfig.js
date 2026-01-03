import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || '',
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || '',
};

let UserPool;
try {
  if (poolData.UserPoolId && poolData.ClientId) {
    UserPool = new CognitoUserPool(poolData);
  } else {
    console.warn('Cognito config incomplete - AuthContext will run in demo mode', poolData);
    UserPool = null;
  }
} catch (err) {
  console.error('Failed to initialize Cognito UserPool:', err);
  UserPool = null;
}

export { UserPool };