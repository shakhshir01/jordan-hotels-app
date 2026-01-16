# CORS and 401 Unauthorized Issues Fix

## Issues Identified
1. **CORS Error**: API Gateway not returning CORS headers for localhost:5175 origin
2. **401 Unauthorized**: Authentication failing for user/profile endpoint
3. **API Gateway Configuration**: CORS not properly configured in deployed API Gateway

## Root Causes
- SAM template has CORS configured but deployed API Gateway may not be updated
- API Gateway authorizer may not be properly configured for Cognito
- Frontend making authenticated requests but API Gateway rejecting them

## Fix Plan

### 1. Update SAM Template CORS Configuration
- Ensure CORS allows localhost:5175 and production domains
- Update AllowOrigin to include specific origins instead of just "*"

### 2. Redeploy SAM Stack
- Package and deploy updated SAM template
- Verify API Gateway CORS configuration

### 3. Fix Authentication Issues
- Ensure Cognito User Pool is properly configured
- Verify JWT token format and claims
- Check API Gateway authorizer configuration

### 4. Frontend Error Handling
- Add better CORS error detection
- Automatically enable mock mode for CORS errors
- Graceful fallback for authentication failures

### 5. Testing
- Test with localhost:5175
- Test with production domain
- Verify authentication flow works

## Implementation Steps

### Step 1: Update SAM Template
```yaml
Cors:
  AllowMethods: "'GET,POST,PUT,DELETE,OPTIONS'"
  AllowHeaders: "'Authorization,Content-Type,X-Api-Key,X-Amz-Date,X-Amz-Security-Token,X-Amz-User-Agent'"
  AllowOrigin: "'http://localhost:5175,https://main.d1ewsonl19kjj7.amplifyapp.com,*'"
  AllowCredentials: false
```

### Step 2: Redeploy Backend
- Package SAM template
- Deploy to AWS
- Update runtime config with new API URL if changed

### Step 3: Update Frontend Error Handling
- Detect CORS errors in axios interceptor
- Automatically enable mock mode for CORS issues
- Better error messages for users

### Step 4: Test Authentication
- Verify Cognito configuration
- Test login flow
- Check JWT token claims

## Files to Update
- `lambda/sam-template.yaml` - CORS configuration
- `src/services/api.js` - Error handling
- `src/context/AuthContext.jsx` - Authentication flow
- `src/context/AccessibilityContext.tsx` - API calls

## Expected Outcome
- No more CORS errors in development
- Proper authentication working
- Graceful fallbacks when API is unavailable
- Better user experience during network issues
