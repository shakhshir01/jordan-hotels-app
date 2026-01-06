# AWS Amplify Deployment Guide for VisitJo

**Date**: January 4, 2026  
**Status**: ✅ Ready for Amplify Deployment  

---

## 🚀 Amplify Setup (After GitHub)

### What is Amplify?
AWS Amplify is a complete solution for building and deploying modern web apps. It:
- ✅ Automatically deploys on every GitHub push
- ✅ Handles SSL/HTTPS automatically
- ✅ Provides a global CDN (CloudFront)
- ✅ Manages environment variables securely
- ✅ Provides preview URLs for PRs
- ✅ Includes built-in CI/CD
- ✅ Easier than our current GitHub Actions setup

---

## 📋 Pre-Deployment Checklist

### Files Ready for Amplify ✅
```
✅ amplify.yml                    ← Build configuration for Amplify
✅ .env.example                   ← Template (safely in git)
✅ .env.local                     ← Local env (in .gitignore)
✅ .gitignore                     ← Proper security rules
✅ package.json                   ← Dependencies defined
✅ vite.config.js                 ← Build configuration
✅ src/                           ← React source code
✅ public/                        ← Static assets
```

### Unnecessary Files to Avoid ⚠️
```
❌ .github/workflows/deploy.yml   ← Not needed for Amplify
❌ lambda/sam-template.yaml       ← Handled separately
❌ test-api-connectivity.js       ← Not needed
❌ *COMPLETE.md, *SUMMARY.md      ← Documentation only
❌ dist/                          ← Build output (generated)
❌ node_modules/                  ← Auto-installed
```

**Note**: These files can stay in git, but Amplify will ignore them.

---

## 🔧 Step 1: Connect GitHub to Amplify

### In AWS Console:

1. **Go to AWS Amplify**
   - URL: https://console.aws.amazon.com/amplify/
   - Region: us-east-1

2. **Click "Create app"**
   - Select: "Deploy an app"
   - Choose: "GitHub"

3. **Authorize GitHub**
   - Click "GitHub" button
   - Login to GitHub
   - Authorize AWS Amplify to access repositories
   - Select your "visitjo" repository

4. **Choose Branch**
   - Select: "main" branch
   - Leave "Monorepo" unchecked (unless needed)

5. **Configure Build Settings**
   - Base directory: `jordan-hotels-app`
   - Build command: (should auto-detect from amplify.yml)
   - Output directory: `dist`

6. **Environment Variables** (IMPORTANT! ⚠️)
   - Add these 4 variables:
   ```
   VITE_COGNITO_USER_POOL_ID=us-east-1_T5vYoBi0N
   VITE_COGNITO_CLIENT_ID=1v5kg2qprjtsnvia0hikm1blvd
   VITE_COGNITO_DOMAIN=us-east-1t5vyobi0n.auth.us-east-1.amazoncognito.com
   VITE_API_GATEWAY_URL=https://ny5ohksmc3.execute-api.us-east-1.amazonaws.com/prod
   ```

7. **Review & Deploy**
   - Click "Save and Deploy"
   - Wait 3-5 minutes for deployment

---

## 📊 Amplify vs GitHub Actions vs Manual S3

| Feature | Amplify | GitHub Actions | Manual S3 |
|---------|---------|---|---|
| Auto-deploy on push | ✅ | ✅ | ❌ |
| PR previews | ✅ | ❌ | ❌ |
| CDN included | ✅ | ✅ (CloudFront) | ✅ (CloudFront) |
| Environment vars | ✅ (Secure UI) | ✅ (GitHub Secrets) | ⚠️ (Manual) |
| Setup time | 5 min | 10 min | 15 min |
| Monitoring | ✅ | ⚠️ | ⚠️ |
| Custom domain | ✅ | ✅ | ✅ |
| Cost | Low (free tier) | Low (GitHub included) | Low (S3 + CF) |

**Recommendation**: Use Amplify for simplicity!

---

## ✅ Build Configuration Explained

### amplify.yml
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci              # Clean install dependencies
    build:
      commands:
        - npm run build       # Build React app → dist/
  artifacts:
    baseDirectory: dist       # Where built files are
    files:
      - '**/*'               # All files in dist/
  cache:
    paths:
      - node_modules/**/*    # Cache dependencies
```

**What it does**:
1. Installs dependencies (`npm ci`)
2. Builds the app (`npm run build`)
3. Uploads `dist/` folder to Amplify
4. Serves from Amplify's global CDN

---

## 🔐 Environment Variables in Amplify

### How to Set Them:

**Option A: AWS Console UI (Recommended)**
1. Go to Amplify Console
2. App Settings → Environment variables
3. Add each variable one by one
4. Trigger new deployment

**Option B: From amplify.yml**
```yaml
backend:
  envfile: .env.local   # ❌ Don't do this (security risk!)
```

**Option C: From App Settings JSON**
```json
{
  "VITE_COGNITO_USER_POOL_ID": "us-east-1_T5vYoBi0N",
  "VITE_COGNITO_CLIENT_ID": "1v5kg2qprjtsnvia0hikm1blvd",
  "VITE_COGNITO_DOMAIN": "us-east-1t5vyobi0n.auth.us-east-1.amazoncognito.com",
  "VITE_API_GATEWAY_URL": "https://ny5ohksmc3.execute-api.us-east-1.amazonaws.com/prod"
}
```

**⚠️ NEVER include secrets in amplify.yml!**

---

## 🚀 Deployment Process with Amplify

```
You push code to main branch on GitHub
           ↓
GitHub webhook triggers Amplify
           ↓
Amplify clones repository
           ↓
Amplify runs: npm ci (install dependencies)
           ↓
Amplify runs: npm run build (creates dist/)
           ↓
Amplify uploads dist/ to S3
           ↓
CloudFront invalidates cache
           ↓
Your site is LIVE! 🎉
           
Total Time: 3-5 minutes
```

---

## 📱 Testing Before Going Live

### 1. Local Testing
```bash
cd jordan-hotels-app
npm run build
npm run preview
```
Should look identical to `npm run dev`

### 2. Check Build Output
```bash
ls -la dist/
# Should see:
# - index.html (small)
# - assets/
#   - index-xxxxx.js (minified React)
#   - index-xxxxx.css (minified Tailwind)
```

### 3. Test in Amplify Console
1. Go to Amplify Console
2. Click "Build" tab
3. Wait for deployment to complete
4. Click preview URL
5. Test:
   - [ ] Frontend loads
   - [ ] Can navigate pages
   - [ ] API works (click LIVE button)
   - [ ] DEMO mode works
   - [ ] Dark/light theme works
   - [ ] Can sign up/login

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain to Amplify:

1. In Amplify Console:
   - Go to "Domain management"
   - Click "Add domain"
   - Enter your domain (e.g., visitjo.com)

2. Amplify will show nameservers
   - Copy the 4 nameservers
   - Update your domain registrar's nameservers
   - Wait 24 hours for DNS propagation

3. SSL Certificate:
   - Amplify creates automatically
   - No additional cost
   - Auto-renewal included

---

## ⚠️ Common Issues & Solutions

### Issue: "Build fails - Cannot find module"
**Solution**: 
- Make sure `npm ci` runs (clean install)
- Check that amplify.yml is in correct directory
- Verify package.json is correct

### Issue: "Environment variables not working"
**Solution**:
- Make sure variables are prefixed with `VITE_`
- Add them in Amplify Console, not in amplify.yml
- Redeploy after adding variables
- Check browser DevTools Console for errors

### Issue: "API returns 403 Forbidden"
**Solution**:
- Verify API Gateway URL is correct
- Check Lambda has Amplify URL in CORS
- Verify Cognito credentials are correct
- Test API directly: curl the endpoint

### Issue: "Page shows blank or white screen"
**Solution**:
- Check browser console for JavaScript errors
- Verify dist/ folder has index.html
- Check that all assets loaded (Network tab)
- Try hard refresh (Ctrl+F5)

### Issue: "Cognito login doesn't work"
**Solution**:
- Make sure Cognito User Pool ID is correct
- Verify Client ID is correct
- Check Cognito domain is correct
- Update Cognito callback URLs to include Amplify URL

---

## 🔄 Cognito Configuration for Amplify

### Update Cognito Callback URLs

1. **Go to AWS Cognito Console**
   - Region: us-east-1
   - User Pool: visitjo-pool
   - App clients

2. **Update Callback URLs**
   - Get Amplify URL from console (e.g., https://xxxxx.amplifyapp.com)
   - Add both:
     - `https://xxxxx.amplifyapp.com/`
     - `https://xxxxx.amplifyapp.com/login`

3. **Update Sign out URLs**
   - `https://xxxxx.amplifyapp.com/`

4. **Save changes**

---

## 📊 Monitoring & Debugging

### In Amplify Console:

**Deployments Tab**
- See build logs
- View deployment history
- Rollback if needed

**Logs Tab**
- Real-time logs during build
- Build errors displayed here
- Click to see full error messages

**Metrics Tab**
- Page load times
- Traffic patterns
- Error rates

### CloudWatch Logs
For Lambda errors:
1. Go to CloudWatch
2. Log groups → `/aws/lambda/getHotels`
3. Check latest logs
4. Search for errors

---

## 🎯 Migration Path

### Current Setup (GitHub Actions + S3 + CloudFront)
```
GitHub Push → GitHub Actions → SAM Deploy (Lambda)
                           → S3 (Frontend)
                           → CloudFront Invalidation
```

### With Amplify (Recommended)
```
GitHub Push → Amplify Build → Amplify Hosting
                         → Automatic CDN
                         → Automatic SSL
```

**Benefits of switching to Amplify**:
- ✅ Simpler setup (fewer steps)
- ✅ Built-in monitoring
- ✅ Preview URLs for PRs
- ✅ Easy rollbacks
- ✅ Less configuration needed
- ✅ One dashboard for everything

---

## 🚀 Quick Start: Deploy with Amplify

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for Amplify deployment"
git push origin main
```

### Step 2: Connect to Amplify
1. Go to https://console.aws.amazon.com/amplify/
2. Click "New app" → "Host web app"
3. Choose "GitHub"
4. Select "visitjo" repository and "main" branch
5. Configure build: Base directory = `jordan-hotels-app`

### Step 3: Add Environment Variables
In Amplify Console:
```
VITE_COGNITO_USER_POOL_ID=us-east-1_T5vYoBi0N
VITE_COGNITO_CLIENT_ID=1v5kg2qprjtsnvia0hikm1blvd
VITE_COGNITO_DOMAIN=us-east-1t5vyobi0n.auth.us-east-1.amazoncognito.com
VITE_API_GATEWAY_URL=https://ny5ohksmc3.execute-api.us-east-1.amazonaws.com/prod
```

### Step 4: Deploy
- Click "Save and Deploy"
- Wait 3-5 minutes
- Get URL from Amplify Console
- Test your site!

---

## 📋 Files NOT Needed for Amplify

These can stay but aren't needed by Amplify:

```
❌ .github/workflows/deploy.yml
   └─ Use Amplify instead of GitHub Actions
   
❌ lambda/sam-template.yaml
   └─ Lambda is separate (doesn't deploy through Amplify)
   
❌ test-api-connectivity.js
   └─ Development utility only
   
❌ IMPROVEMENTS.md, QUICK_PUSH.md, etc.
   └─ Documentation (doesn't affect deployment)
   
❌ dist/ (in git)
   └─ Build artifacts (should be .gitignored)
   
❌ .env files (in git)
   └─ Should be in .gitignore (security!)
```

---

## ✅ Security Checklist for Amplify

- [x] Environment variables NOT in amplify.yml ✅
- [x] Secrets NOT in code ✅
- [x] .env files in .gitignore ✅
- [x] Cognito credentials are public-safe ✅
- [x] AWS credentials in Amplify, not in code ✅
- [x] CORS configured on API Gateway ✅
- [x] HTTPS enabled automatically ✅

---

## 🎓 Next Steps

1. **Optional**: Delete GitHub Actions workflow (if using Amplify)
   ```bash
   rm .github/workflows/deploy.yml
   ```

2. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Amplify configuration"
   git push origin main
   ```

3. **Connect to Amplify** (see Quick Start above)

4. **Test the deployment**
   - Wait for build to complete
   - Click preview URL
   - Verify everything works

5. **Monitor in Amplify Console**
   - Check logs
   - Monitor metrics
   - Set up email notifications for failures

---

## 🎉 Conclusion

Your VisitJo project is **ready for Amplify deployment**!

- ✅ Code is optimized for Amplify
- ✅ Build configuration is set up
- ✅ Environment variables are ready
- ✅ Security is verified
- ✅ Unnecessary files identified

**You can deploy with confidence!** 🚀

---

**Status**: ✅ READY FOR AMPLIFY  
**Estimated Setup Time**: 10-15 minutes  
**Estimated Deployment Time**: 5 minutes  
**Total**: ~20 minutes to live!

For any questions, refer to [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
