# GitHub & Deployment Setup Guide

## 🚀 Getting Started

### Prerequisites
- GitHub account
- AWS account with credentials
- Node.js 18+
- Git CLI

---

## 📋 Step 1: GitHub Repository Setup

### Create Repository
```bash
# 1. Go to https://github.com/new
# 2. Repository name: visitjo (or your choice)
# 3. Choose Private (recommended for production)
# 4. Do NOT initialize with README (we have one)
# 5. Click "Create repository"
```

### Initialize Git Locally
```bash
cd VisitJo

# Initialize git
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/visitjo.git

# Set main as default branch
git branch -M main

# Stage all files
git add .

# Commit
git commit -m "Initial commit: VisitJo travel booking platform"

# Push to GitHub
git push -u origin main
```

---

## 🔐 Step 2: GitHub Secrets (Required for CI/CD)

Go to GitHub → Your Repo → Settings → Secrets and variables → Actions

### Add These Secrets:

```
AWS_ACCESS_KEY_ID              = your_aws_access_key
AWS_SECRET_ACCESS_KEY          = your_aws_secret_key
SAM_DEPLOY_BUCKET              = visitjo-sam-deployments
FRONTEND_BUCKET                = visitjo-frontend
CLOUDFRONT_DISTRIBUTION_ID     = your_cloudfront_distribution_id
```

**How to get AWS credentials:**
1. Go to AWS Console → IAM → Users
2. Create new user: `github-deploy`
3. Attach policy: `AdministratorAccess` (or specific policies)
4. Create access key
5. Copy Access Key ID and Secret Key

---

## 📦 Step 3: Environment Variables

### For Developers
```bash
# Copy template
cp jordan-hotels-app/.env.example jordan-hotels-app/.env.local

# Edit with your values
nano jordan-hotels-app/.env.local
```

### Never Commit `.env.local`
✅ `.gitignore` already configured to exclude it

---

## 🏗️ Step 4: Prepare for Production

### Frontend Build
```bash
cd jordan-hotels-app
npm run build
# Creates dist/ folder (ready for deployment)
```

### Backend (Lambda)
Already configured in SAM template. CI/CD will deploy automatically.

---

## 📝 Step 5: Create Deployment Workflow

The `.github/workflows/deploy.yml` is already created and will:

1. **Test & Build** (on all PRs and pushes)
   - Install dependencies
   - Run linting
   - Build frontend
   - Run tests

2. **Deploy Backend** (on main branch pushes only)
   - Build SAM app
   - Deploy to AWS CloudFormation
   - Updates Lambda functions

3. **Deploy Frontend** (on main branch pushes only)
   - Build React app
   - Deploy dist/ to S3
   - Invalidate CloudFront cache

---

## 🚀 Step 6: Deploy to AWS

### Option A: Automatic (Recommended)
```bash
# Just push to main branch
git push origin main

# GitHub Actions will automatically:
# 1. Test code
# 2. Build app
# 3. Deploy to AWS
# 4. Invalidate cache

# Watch progress: GitHub → Actions tab
```

### Option B: Manual Deployment

**Backend (Lambda):**
```bash
cd lambda
sam build
sam deploy --guided
```

**Frontend (S3 + CloudFront):**
```bash
cd jordan-hotels-app
npm run build

# Upload to S3
aws s3 sync dist/ s3://visitjo-frontend/

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

---

## ✅ Deployment Checklist

Before pushing to production:

### Local Testing
- [ ] Run `npm run dev` and test features
- [ ] Test sign up → verify → sign in
- [ ] Test all 16 API endpoints
- [ ] Test in LIVE mode (not demo)
- [ ] Check console for errors
- [ ] Test on mobile devices

### Code Quality
- [ ] Run linter: `npm run lint`
- [ ] No console errors or warnings
- [ ] No hardcoded secrets in code
- [ ] Environment variables in `.env.local` not `.env`

### Commit & Push
```bash
# Check what will be pushed
git status

# Only .gitignore should exclude .env.local
# Everything else should be committed

# Push
git push origin main

# Watch GitHub Actions run
# Go to Actions tab in GitHub
```

### Post-Deployment
- [ ] Check GitHub Actions succeeds (green checkmark)
- [ ] Test production URLs
- [ ] Check CloudWatch logs for errors
- [ ] Verify API Gateway endpoints responding
- [ ] Test Lambda functions via API

---

## 📊 Deployment Architecture

```
GitHub Repo
    ↓
Webhook (on push to main)
    ↓
GitHub Actions Workflow
    ├─→ Test & Build
    │       ↓
    │   (All PRs and pushes)
    │
    ├─→ Deploy Backend
    │       ↓
    │   SAM Build & Deploy
    │       ↓
    │   CloudFormation Stack
    │       ↓
    │   Lambda Functions Updated
    │
    └─→ Deploy Frontend
            ↓
        Build React App
            ↓
        Upload dist/ to S3
            ↓
        Invalidate CloudFront
            ↓
        Live at CDN URL
```

---

## 🔍 Monitoring Deployments

### Watch GitHub Actions
1. Go to your repo
2. Click "Actions" tab
3. Click latest workflow run
4. See real-time progress
5. Check logs if failed

### View CloudWatch Logs
```bash
# Watch Lambda logs
aws logs tail /aws/lambda/getHotels --follow

# View API Gateway logs
aws logs tail /aws/apigateway/welcomePageLog --follow
```

### Check AWS Deployment
```bash
# List CloudFormation stacks
aws cloudformation list-stacks

# Get stack details
aws cloudformation describe-stacks --stack-name visitjo-api

# List Lambda functions
aws lambda list-functions

# Get Lambda function info
aws lambda get-function --function-name getHotels
```

---

## 🆘 Troubleshooting

### GitHub Actions Fails
1. Go to Actions → Failed run → Logs
2. Look for error message
3. Check secrets are set correctly
4. Check AWS credentials have permissions

### Lambda Deploy Fails
- Verify SAM syntax in `sam-template.yaml`
- Check Lambda function code for errors
- Ensure all dependencies in `package.json`

### Frontend Deploy Fails
- Check S3 bucket exists
- Verify CloudFront distribution exists
- Check AWS credentials have S3/CloudFront permissions

### API Not Responding
- Check Lambda function logs
- Verify DynamoDB tables exist
- Test with `curl` command
- Check API Gateway for errors

---

## 🔒 Security Best Practices

### ✅ What You're Doing Right
- Environment variables in `.env.local` (not in git)
- Secrets in GitHub Secrets (not in code)
- `.gitignore` excluding sensitive files
- Read-only Cognito client IDs in code (OK to share)

### ⚠️ Never Do These
- ❌ Commit `.env` or `.env.local` files
- ❌ Hardcode AWS secret keys
- ❌ Share access keys publicly
- ❌ Commit private credentials
- ❌ Use credentials in GitHub comments

### 🔐 Recommended Additional Steps
- [ ] Enable branch protection (require reviews)
- [ ] Enable secret scanning (GitHub alerts)
- [ ] Set up AWS CloudTrail logging
- [ ] Enable MFA on AWS account
- [ ] Use AWS IAM roles (not long-lived keys)

---

## 📚 Useful Commands

```bash
# View what will be committed
git status

# Add specific files
git add file.js

# Commit with message
git commit -m "Add feature X"

# Push to GitHub
git push origin main

# See commit history
git log --oneline

# See what changed
git diff

# Revert last commit (before push)
git reset --soft HEAD~1

# Stash changes temporarily
git stash

# View GitHub Actions locally (requires act)
act -l
```

---

## 🎯 Deployment Success Indicators

When deployment succeeds, you should see:

✅ GitHub Actions: All checks pass (green)
✅ AWS CloudFormation: Stack CREATE_COMPLETE or UPDATE_COMPLETE
✅ Lambda: Functions updated with latest code
✅ Frontend: App loads at CloudFront distribution URL
✅ API: Endpoints respond with correct data
✅ Cognito: Users can sign up and sign in
✅ CloudWatch: No error logs

---

## 📞 Common Commands After Deploy

```bash
# Test API
curl https://ny5ohksmc3.execute-api.us-east-1.amazonaws.com/prod/hotels

# View Lambda logs (last 30 minutes)
aws logs tail /aws/lambda/getHotels --since 30m

# Restart Lambda (warm it up)
aws lambda invoke --function-name getHotels response.json

# Check DynamoDB
aws dynamodb scan --table-name Hotels --limit 5
```

---

## 🚀 Next Steps

1. **Create GitHub repo** (follow step 1)
2. **Add GitHub Secrets** (follow step 2)
3. **Test locally** with `npm run dev`
4. **Push to GitHub** with `git push origin main`
5. **Watch Actions** deploy automatically
6. **Verify production** URLs are live

---

**Status**: Ready for GitHub deployment
**Region**: us-east-1
**Workflow**: Automated CI/CD enabled
