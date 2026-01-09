import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import { authenticator } from 'otplib';
import fs from 'fs';

// Load runtime config to get pool/client
const cfgPath = `${process.cwd()}/public/runtime-config.js`;
let cfgRaw = '';
try {
  cfgRaw = fs.readFileSync(cfgPath, 'utf8');
} catch (e) {
  console.error('Failed to read runtime-config.js:', e.message);
  process.exit(1);
}
const match = cfgRaw.match(/VITE_COGNITO_USER_POOL_ID:\s*"([^"]+)"[\s\S]*VITE_COGNITO_CLIENT_ID:\s*"([^"]+)"/m);
if (!match) {
  console.error('Could not parse runtime-config.js for pool/client id');
  process.exit(1);
}
const USER_POOL_ID = match[1];
const CLIENT_ID = match[2];
console.log('Using', USER_POOL_ID, CLIENT_ID);

const poolData = { UserPoolId: USER_POOL_ID, ClientId: CLIENT_ID };
const userPool = new CognitoUserPool(poolData);

// Test account (change if you want)
const username = `mfa-test-${Date.now()}@example.com`;
const password = 'Passw0rd!23';

async function pause(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function run() {
  console.log('Test user:', username);
  // Attempt to sign up
  const { execSync } = await import('child_process');
  try {
    console.log('Creating user via AWS CLI admin-create-user (suppressed message)');
    execSync(`aws cognito-idp admin-create-user --user-pool-id ${USER_POOL_ID} --username ${username} --user-attributes Name=email,Value=${username} Name=name,Value=\"MFA Test\" --message-action SUPPRESS`);
    console.log('Admin-create-user succeeded');
  } catch (e) {
    console.warn('admin-create-user may have failed (user may already exist):', e.message);
  }

  try {
    execSync(`aws cognito-idp admin-set-user-password --user-pool-id ${USER_POOL_ID} --username ${username} --password ${password} --permanent`);
    console.log('Set permanent password via AWS CLI');
  } catch (e) {
    console.warn('Setting permanent password failed (may be unnecessary):', e.message);
  }

  // Authenticate user (SRP)
  const authDetails = new AuthenticationDetails({ Username: username, Password: password });
  const cognitoUser = new CognitoUser({ Username: username, Pool: userPool });

  await new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authDetails, {
      onSuccess: (session) => {
        console.log('Authenticated, access token length:', session.getAccessToken().getJwtToken().length);
        resolve();
      },
      onFailure: (err) => {
        console.error('Auth failed:', err.message || err);
        reject(err);
      },
      mfaRequired: (challengeName, challengeParams) => {
        console.log('mfaRequired challenge:', challengeName, challengeParams);
        reject(new Error('Unexpected SMS MFA required during initial auth'));
      },
      mfaSetup: (challengeName, challengeParams) => {
        console.log('mfaSetup challenge received:', challengeName, challengeParams);
        resolve();
      },
      totpRequired: (challengeName, challengeParams) => {
        console.log('totpRequired challenge received:', challengeName, challengeParams);
        resolve();
      }
    });
  });

  // Associate software token
  const secret = await new Promise((resolve, reject) => {
    cognitoUser.associateSoftwareToken({
      associateSecretCode: (s) => resolve(s),
      onFailure: (err) => reject(err),
    });
  });
  console.log('Received TOTP secret:', secret);

  // Generate a TOTP code
  const code = authenticator.generate(secret);
  console.log('Generated TOTP code:', code);

  // Verify the TOTP code
  await new Promise((resolve, reject) => {
    cognitoUser.verifySoftwareToken(code, 'TestDevice', {
      onSuccess: (res) => { console.log('verifySoftwareToken success', res); resolve(res); },
      onFailure: (err) => { console.error('verifySoftwareToken failed', err); reject(err); },
    });
  });

  console.log('Verifying complete — enabling software token MFA for user (admin)');
  let lastUsedCode = code;
  try {
    execSync(`aws cognito-idp admin-set-user-mfa-preference --user-pool-id ${USER_POOL_ID} --username ${username} --software-token-mfa-settings Enabled=true,PreferredMfa=true`);
    console.log('Admin set user MFA preference to SOFTWARE_TOKEN_MFA');
  } catch (e) {
    console.warn('Failed to set user MFA preference via CLI:', e.message);
  }

  // Wait briefly then authenticate again to exercise the TOTP challenge
  await pause(1500);
  const cognitoUser2 = new CognitoUser({ Username: username, Pool: userPool });
  await new Promise((resolve, reject) => {
    cognitoUser2.authenticateUser(new AuthenticationDetails({ Username: username, Password: password }), {
      onSuccess: (session) => { console.log('Second auth succeeded without challenge — unexpected'); resolve(); },
      onFailure: (err) => { console.error('Second auth failed:', err.message || err); reject(err); },
      totpRequired: async (challengeName, challengeParams) => {
        console.log('Second auth: totpRequired, sending code...');
        // ensure we don't reuse the same code we used for verification
        let c = authenticator.generate(secret);
        while (c === lastUsedCode) {
          await pause(1000);
          c = authenticator.generate(secret);
        }
        cognitoUser2.sendMFACode(c, {
          onSuccess: (sess) => { console.log('Second auth success after TOTP'); resolve(sess); },
          onFailure: (err) => { console.error('sendMFACode failed:', err); reject(err); },
        }, 'SOFTWARE_TOKEN_MFA');
      },
      mfaRequired: (challengeName, challengeParams) => {
        console.log('Second auth: mfaRequired (SMS) unexpected'); reject(new Error('Unexpected SMS MFA in second auth'));
      }
    });
  });

  console.log('TOTP end-to-end test complete');
}

run().catch((e) => { console.error('Test failed', e); process.exit(1); });
