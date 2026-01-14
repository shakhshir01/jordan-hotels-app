# Verification Commands - VisitJo Project

Use these commands to verify each part of the project is working correctly.

---

## ✅ Frontend Verification

### 1. Check Frontend is Running
```powershell
# Should show output similar to:
# VITE v7.3.0  ready in 266 ms
# ➜  Local:   http://localhost:5175/
```
Open browser: **http://localhost:5175**

Expected: Homepage loads with hotel list

### 2. Verify Frontend Build
```powershell
cd c:\Users\khale\Desktop\VisitJo\jordan-hotels-app
npm run build
```
Expected: Build succeeds, creates `dist/` folder

### 3. Check Dependencies
```powershell
npm list react react-router-dom axios
```
Expected: Shows installed versions (React 19+, React Router 7+, Axios latest)

---

## ✅ Backend Verification

### 1. Test API Gateway Connectivity
```powershell
cd c:\Users\khale\Desktop\VisitJo\jordan-hotels-app
node test-api-connectivity.js
```
Expected: ✅ Hotels list retrieved: 200 3 items

### 2. Test Each Lambda Locally
```powershell
cd c:\Users\khale\Desktop\VisitJo\jordan-hotels-app\lambda

# Test hotels list
node getHotels/test.js
# Expected: statusCode 200, hotels array

# Test hotel by ID
node getHotelById/test.js
# Expected: statusCode 200, single hotel object

# Test bookings
node bookings/test.js
# Expected: statusCode 200 for GET, 201 for POST

# Test checkout
node createCheckoutSession/test.js
# Expected: statusCode 200, sessionId returned

# Test upload URL
node getSignedUrl/test.js
# Expected: statusCode 200, presigned URL returned
```

### 3. Verify SAM Template
```powershell
cd c:\Users\khale\Desktop\VisitJo\jordan-hotels-app\lambda
sam validate --template-file sam-template.yaml
```
Expected: Template is valid

### 4. Check SAM Build
```powershell
cd c:\Users\khale\Desktop\VisitJo\jordan-hotels-app\lambda
sam build --template-file sam-template.yaml
```
Expected: Builds successfully, creates `.aws-sam/` folder

---

## ✅ Configuration Verification

### 1. Check Environment Variables
```powershell
cd c:\Users\khale\Desktop\VisitJo\jordan-hotels-app
cat .env.local
```
Expected Output:
```
VITE_COGNITO_USER_POOL_ID=us-east-1_wEYeRj64s
VITE_COGNITO_CLIENT_ID=7khcvg0ge70sotb9rp1muns504
VITE_API_GATEWAY_URL=https://lk8nfjc7m1.execute-api.us-east-1.amazonaws.com/prod
```

### 2. Verify API Gateway is Accessible
```powershell
# Windows PowerShell
$apiUrl = "https://lk8nfjc7m1.execute-api.us-east-1.amazonaws.com/prod"
Invoke-WebRequest -Uri "$apiUrl/hotels" -Method Get | ConvertFrom-Json
```
Expected: Returns array of 3 hotels

---

## ✅ Code Quality Verification

### 1. Run Tests
```powershell
cd c:\Users\khale\Desktop\VisitJo\jordan-hotels-app
npm run test
```
Expected: All tests pass

### 2. Build Check
```powershell
npm run build
# Check for no errors
```
Expected: Build succeeds with no errors

### 3. Lint Check
```powershell
npm run lint
```
Expected: No critical errors (warnings are ok)

---

## ✅ File Structure Verification

### 1. Check Frontend Files
```powershell
cd c:\Users\khale\Desktop\VisitJo\jordan-hotels-app
ls src/pages/          # Should show 11 JSX files
ls src/context/        # Should show AuthContext.jsx
ls src/services/       # Should show api.js
ls lambda/             # Should show 5 handler folders
```

### 2. Check Documentation
```powershell
cd c:\Users\khale\Desktop\VisitJo
ls *.md
# Should show: STATUS.md, QUICK_START.md, DEPLOYMENT_GUIDE.md, PROJECT_SUMMARY.md
```

### 3. Check Environment Template
```powershell
cd c:\Users\khale\Desktop\VisitJo\jordan-hotels-app
cat .env.example
```
Expected: Shows all required environment variables

---

## 🚀 Deployment Verification Checklist

After each deployment step, run these checks:

### After Step 1 (Frontend Test)
- [ ] Browser opens http://localhost:5175
- [ ] Homepage displays without errors
- [ ] Hotel list visible
- [ ] Can click on a hotel
- [ ] Hotel details page loads

### After Step 2 (Cognito Setup)
- [ ] `.env.local` has Cognito IDs
- [ ] Click "Sign Up" page loads
- [ ] Can submit signup form (check email inbox)
- [ ] Click "Sign In" page loads
- [ ] Can login after email verification

### After Step 3 (SAM Deploy)
- [ ] `sam deploy` completes without errors
- [ ] CloudFormation stack status: CREATE_COMPLETE or UPDATE_COMPLETE
- [ ] New API Gateway URL is shown in outputs
- [ ] Old API Gateway URL still works (backwards compatible)
- [ ] Test: `node test-api-connectivity.js` still works

### After Step 4 (DynamoDB)
- [ ] Tables exist in AWS Console
- [ ] Can view table items
- [ ] Test create booking: navigate through booking form
- [ ] New booking appears in DynamoDB

### After Step 5 (Stripe - Optional)
- [ ] Secret stored in Secrets Manager
- [ ] SAM template has StripeSecretArn parameter
- [ ] Checkout button shows Stripe form
- [ ] Can click "Pay with Stripe"

### After Step 6 (S3 - Optional)
- [ ] S3 bucket created
- [ ] CORS configuration applied
- [ ] Upload URL endpoint works
- [ ] Can upload image from admin panel

---

## 🔍 Troubleshooting Verification

If something isn't working, run these checks:

### Frontend Issues
```powershell
# Check if dev server is running
netstat -ano | findstr :5175

# Check if port is in use
lsof -i :5175  # Mac/Linux only

# Restart dev server
cd jordan-hotels-app
npm run dev
```

### Backend Issues
```powershell
# Check Lambda code syntax
cd lambda/getHotels
node -c index.js  # Syntax check

# Check API Gateway responses
curl -v https://lk8nfjc7m1.execute-api.us-east-1.amazonaws.com/prod/hotels

# Check CloudWatch logs
aws logs tail /aws/lambda/jordan-hotels-getHotels --follow
```

### Environment Issues
```powershell
# Verify .env.local is in gitignore
cat .gitignore | findstr .env.local

# Check if env vars are loaded
node -e "console.log(process.env.VITE_API_GATEWAY_URL)"
```

---

## 📊 Performance Verification

### 1. Frontend Performance
```powershell
# Build size check
cd jordan-hotels-app
npm run build
# Check size of dist/assets/
```
Expected: JS bundle < 500KB, CSS < 50KB

### 2. API Response Time
```powershell
# Test response time
time curl https://lk8nfjc7m1.execute-api.us-east-1.amazonaws.com/prod/hotels
```
Expected: Response < 2 seconds

### 3. Database Query Performance
```powershell
# Check DynamoDB metrics in AWS Console
# Look for query latency
# Expected: < 100ms for simple queries
```

---

## ✨ Final Verification

Run this checklist when you think everything is done:

- [ ] Frontend dev server running on port 5175
- [ ] Homepage loads with 3 hotels
- [ ] Can click hotel → view details
- [ ] Fill booking form → can submit
- [ ] Sign Up page accessible
- [ ] Login page accessible
- [ ] API Gateway returns hotels (200 status)
- [ ] All 5 Lambda test.js files pass locally
- [ ] SAM template validates
- [ ] `.env.local` has all required values
- [ ] No console errors in browser DevTools
- [ ] No build warnings
- [ ] CloudFormation stack status is CREATE_COMPLETE (after deploy)

---

## 📞 Command Reference

```powershell
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run test             # Run tests
npm run lint             # Lint code

# Backend
cd lambda
sam build                # Build Lambda functions
sam deploy --guided      # Deploy to AWS
sam validate             # Validate template
node */test.js           # Test each Lambda

# Utilities
npm list                 # Show installed packages
npm update               # Update dependencies
npm install              # Install dependencies
```

---

**Everything verified? You're ready to go live! 🚀**
