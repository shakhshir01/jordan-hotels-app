# CORS and 401 Unauthorized Fix - Deployment Guide

## Issues Fixed

1. **CORS Error**: API Gateway not allowing requests from `http://localhost:5175`
2. **401 Unauthorized**: Authentication issues with user profile endpoints
3. **Network Errors**: Frontend not handling API failures gracefully

## Changes Made

### 1. Updated SAM Template (`lambda/sam-template.yaml`)
- Added `http://localhost:5175` and production domain to CORS AllowOrigin
- Changed from `AllowOrigin: '*'` to specific origins for better security

### 2. Enhanced Frontend Error Handling (`src/services/api.js`)
- Added CORS error detection in axios interceptor
- Automatically returns 'CORS_ERROR' for network/CORS issues
- Better error logging and handling

### 3. Improved Accessibility Context (`src/context/AccessibilityContext.tsx`)
- Added CORS error detection when loading user preferences
- Graceful fallback to localStorage when API is unavailable
- Better error logging

## Deployment Steps

### Step 1: Package and Deploy SAM Stack

```bash
# Navigate to lambda directory
cd jordan-hotels-app/lambda

# Package the updated template
sam package --template-file sam-template.yaml --output-template-file packaged-new.yaml --s3-bucket visitjo-sam-deploy-1768258668990-9051

# Deploy the updated stack
sam deploy --template-file packaged-new.yaml --stack-name visitjo-backend-2 --capabilities CAPABILITY_NAMED_IAM --no-confirm-changeset
```

### Step 2: Update Runtime Configuration

After deployment, check the new API Gateway URL:

```bash
# Get the new API URL from CloudFormation outputs
aws cloudformation describe-stacks --stack-name visitjo-backend-2 --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' --output text
```

Update `public/runtime-config.js` with the new API URL if it changed:

```javascript
window.__VISITJO_RUNTIME_CONFIG__ = {
  VITE_API_GATEWAY_URL: "https://NEW-API-ID.execute-api.us-east-1.amazonaws.com/prod",
  // ... other config
};
```

### Step 3: Test the Fixes

1. **Start the development server:**
   ```bash
   cd jordan-hotels-app
   npm run dev
   ```

2. **Test CORS fix:**
   - Open browser console at `http://localhost:5175`
   - Check that user profile API calls no longer show CORS errors
   - Verify accessibility preferences load from localStorage

3. **Test authentication:**
   - Try logging in (may still fail due to Cognito config, but should not show CORS errors)
   - Check that profile loading falls back gracefully

## Expected Behavior After Fix

### ✅ What Should Work
- No CORS errors in browser console for localhost:5175
- API calls that fail due to CORS return proper error messages
- Accessibility preferences work with localStorage fallback
- Frontend continues to function even when backend is unavailable

### ⚠️ What May Still Need Attention
- 401 Unauthorized errors may persist if Cognito is not properly configured
- Authentication flow may require additional Cognito setup
- Some API endpoints may still return 401 if authorizer is misconfigured

## Troubleshooting

### If CORS Errors Persist
1. Check that the API Gateway was updated with new CORS settings
2. Verify the API URL in runtime config matches the deployed API
3. Check browser network tab for actual request/response headers

### If 401 Errors Persist
1. Verify Cognito User Pool configuration
2. Check that JWT tokens are being sent correctly
3. Ensure API Gateway authorizer is properly configured

### If Deployment Fails
1. Check AWS credentials and permissions
2. Ensure S3 bucket exists for SAM packaging
3. Verify CloudFormation stack permissions

## Rollback Plan

If issues persist after deployment:

1. **Revert SAM template changes:**
   ```bash
   git checkout HEAD~1 lambda/sam-template.yaml
   ```

2. **Redeploy with original template:**
   ```bash
   cd lambda
   sam deploy --template-file sam-template.yaml --stack-name visitjo-backend-2 --capabilities CAPABILITY_NAMED_IAM
   ```

3. **Frontend changes are backward compatible** - they add error handling without breaking existing functionality

## Next Steps

After confirming the fixes work:

1. **Test in production environment**
2. **Monitor error logs** for any remaining issues
3. **Consider adding API Gateway authorizer** for better authentication
4. **Implement proper Cognito integration** if authentication is needed

## Files Modified

- `lambda/sam-template.yaml` - CORS configuration
- `src/services/api.js` - Error handling
- `src/context/AccessibilityContext.tsx` - CORS error handling
- `TODO_CORS_FIX.md` - Issue documentation
- `CORS_FIX_DEPLOYMENT.md` - This deployment guide

## Contact

If you encounter issues during deployment, check:
1. AWS CloudFormation stack events
2. API Gateway configuration
3. Browser developer tools network tab
4. Application logs in CloudWatch
