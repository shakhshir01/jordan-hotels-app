# VisitJo Cognito Authentication Setup

## ✅ Your Cognito Credentials

```
User Pool ID:     us-east-1_T5vYoBi0N
Client ID:        1v5kg2qprjtsnvia0hikm1blvd
Domain:           us-east-1t5vyobi0n.auth.us-east-1.amazoncognito.com
Region:           us-east-1
```

## 📋 What's Already Configured

- ✅ `.env.local` updated with credentials
- ✅ `authConfig.js` reads from environment variables
- ✅ `AuthContext.jsx` handles sign-up, sign-in, sign-out
- ✅ `Login.jsx` page created with form
- ✅ `SignUp.jsx` page created with form
- ✅ `ForgotPassword.jsx` for password reset
- ✅ Auth tokens automatically sent to API

## 🔧 Current Setup

### Environment Variables (`.env.local`)
```dotenv
VITE_COGNITO_USER_POOL_ID=us-east-1_T5vYoBi0N
VITE_COGNITO_CLIENT_ID=1v5kg2qprjtsnvia0hikm1blvd
VITE_COGNITO_DOMAIN=us-east-1t5vyobi0n.auth.us-east-1.amazoncognito.com
VITE_API_GATEWAY_URL=https://ny5ohksmc3.execute-api.us-east-1.amazonaws.com/prod
VITE_GEMINI_API_KEY=AIzaSyC424S-HHeYt7Fio20xGyaCimKRq-6oh64
```

### How Auth Works

```
1. User fills in login form
                ↓
2. AuthContext.login(email, password)
                ↓
3. Cognito authenticates user
                ↓
4. Returns ID Token + Access Token
                ↓
5. Token stored in browser (localStorage)
                ↓
6. AuthContext.setAuthToken() sends to API
                ↓
7. API receives Bearer token
                ↓
8. API validates with Cognito
```

## 📄 Key Files

### `src/authConfig.js`
Initializes Cognito UserPool with your credentials:
```javascript
const poolData = {
  UserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  ClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
};
```

### `src/context/AuthContext.jsx`
Provides auth functions:
- `login(email, password)` - Sign in user
- `signUp(email, password, name)` - Create account
- `signOut()` - Sign out user
- `forgotPassword(email)` - Reset password flow

### `src/pages/Login.jsx`
Login form that calls `useAuth().login()`

### `src/pages/SignUp.jsx`
Sign up form that calls `useAuth().signUp()`

## ✨ Features Included

- ✅ Sign Up (register new users)
- ✅ Sign In (authenticate users)
- ✅ Sign Out (clear session)
- ✅ Forgot Password (reset via email)
- ✅ Token Management (automatic)
- ✅ Session Persistence (localStorage)
- ✅ Error Handling (validation + auth errors)

## 🧪 Testing

### Test Sign Up
1. Open http://localhost:5173/signup
2. Enter email and password
3. Click "Create Account"
4. Check email for verification code
5. Verify code in Cognito console

### Test Sign In
1. Open http://localhost:5173/login
2. Use credentials from sign up
3. Click "Sign In"
4. Redirects to home page
5. NavBar shows user email

### Test Sign Out
1. Click user menu in NavBar
2. Click "Sign Out"
3. Session cleared
4. Redirects to login

### Test Protected Pages
1. Sign out
2. Try to access /profile
3. Redirects to /login
4. Sign in
5. Can now access /profile

## 🔐 Security Features

- ✅ Passwords never sent unencrypted (Cognito handles)
- ✅ Tokens stored in secure httpOnly cookies (optional)
- ✅ Sessions expire after 60 minutes (configurable)
- ✅ Refresh tokens auto-refresh access tokens
- ✅ MFA ready (enable in Cognito console)
- ✅ Account lockout after failed attempts

## 📋 Cognito Console Checklist

**Do this in AWS Console:**

- [ ] Sign up a test user
- [ ] Verify the user (email confirmation)
- [ ] Test sign in on the app
- [ ] Check user details in Cognito console
- [ ] Configure MFA (optional)
- [ ] Set up email templates (optional)
- [ ] Enable social providers (optional)

## 🌐 Social Sign-In (Google / Facebook / Apple) — Hosted UI

This app uses **Cognito Hosted UI (OAuth2 Authorization Code + PKCE)** for social sign-in.

### 1) Add callback + logout URLs

In **Cognito User Pool → App integration → App client settings / Hosted UI**:

- **Allowed callback URLs** (add all you need):
  - `http://localhost:5173/oauth/callback`
  - `https://www.visit-jo.com/oauth/callback`
  - `https://visit-jo.com/oauth/callback`
- **Allowed sign-out URLs**:
  - `http://localhost:5173/`
  - `https://www.visit-jo.com/`
  - `https://visit-jo.com/`

Recommended scopes: `openid`, `email`, `profile`.

### 2) Configure identity providers

In **Cognito User Pool → Social and external providers** (wording varies by console):

**Google**
- Create OAuth client in Google Cloud Console.
- Configure the **Authorized redirect URI** to point to Cognito (Hosted UI callback), not your SPA.
- Paste the Google client ID/secret into Cognito.

**Facebook**
- Create an app in Meta for Developers.
- Add the Facebook App ID/secret to Cognito.

**Apple (Sign in with Apple)**
- Create Services ID + Key in Apple Developer.
- Configure Sign in with Apple in Cognito.

### 3) Enable providers on the app client

In the Cognito app client settings:
- Check **Google**, **Facebook**, **Sign in with Apple** as enabled identity providers.

### 4) Provider names used by the app

The SPA redirects to Cognito Hosted UI using these provider identifiers:
- Google: `Google`
- Facebook: `Facebook`
- Apple: `SignInWithApple`

### 5) Required frontend config

The app needs these values at runtime (local `.env` or Amplify env vars):

```dotenv
VITE_COGNITO_CLIENT_ID=...
VITE_COGNITO_DOMAIN=...auth.<region>.amazoncognito.com
```

If you use the repo’s `public/runtime-config.js` approach in production, make sure the same values are present there.

## 🆘 Troubleshooting

### Issue: "User not found" when signing in
**Solution**: User needs to sign up first. Use `/signup` page.

### Issue: "User already exists"
**Solution**: Use different email or reset password with `/forgot-password`.

### Issue: Email not received
**Solution**: Check Cognito console > Message templates > Verification message

### Issue: "Invalid client ID"
**Solution**: Verify `VITE_COGNITO_CLIENT_ID` matches exactly in AWS console

### Issue: CORS error from Cognito domain
**Solution**: Add your domain to Cognito App Client settings:
- Go to AWS Console > Cognito > App Clients
- Edit "My SPA app - ovjuzx"
- Add callback URLs: `http://localhost:5173, https://yourdomain.com`
- Add allowed logout URLs

## 🚀 Production Checklist

Before deploying to production:

- [ ] Update redirect URIs in Cognito (domain.com, not localhost)
- [ ] Enable MFA
- [ ] Set up email sender (SES)
- [ ] Configure password policy
- [ ] Enable threat protection
- [ ] Set up CloudWatch logs
- [ ] Enable AWS WAF (optional)
- [ ] Test password reset flow
- [ ] Test account lockout
- [ ] Update terms & privacy links

## 📚 Related Documentation

- [Cognito Setup Guide](./docs/COGNITO_SETUP.md)
- [API Authentication](./API_ENDPOINTS.md)
- [Environment Variables](./.env.local)

## 💡 Next Steps

1. **Test the flow**: Sign up → verify → sign in → sign out
2. **Enable MFA**: Go to Cognito > Edit user pool > MFA
3. **Configure email**: Use SES for production emails
4. **Deploy frontend**: Use Amplify or S3 + CloudFront
5. **Protect API endpoints**: Add auth checks to Lambda functions

---

**Status**: ✅ READY  
**Last Updated**: January 3, 2026  
**Region**: us-east-1
