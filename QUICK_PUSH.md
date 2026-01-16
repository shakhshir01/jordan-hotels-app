# Quick Reference: Push to GitHub in 5 Minutes

## Copy-Paste Commands

```bash
# 1. Initialize Git (if not already done)
cd c:\Users\khale\Desktop\VisitJo
git init
git config user.name "Your Name"
git config user.email "your@email.com"

# 2. Stage all files
git add .

# 3. Verify .env.local is NOT listed
git status

# 4. Commit
git commit -m "Initial commit: VisitJo travel booking platform for Jordan"

# 5. Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/USERNAME/visitjo.git
git branch -M main

# 6. Push to GitHub
git push -u origin main
```

## After Pushing

1. **Go to GitHub**: https://github.com/USERNAME/visitjo
2. **Settings → Secrets and variables → Actions**
3. **Add these 5 secrets**:
   - `AWS_ACCESS_KEY_ID` - Get from AWS IAM
   - `AWS_SECRET_ACCESS_KEY` - Get from AWS IAM
   - `SAM_DEPLOY_BUCKET` - "visitjo-sam-deployments"
   - `FRONTEND_BUCKET` - "visitjo-frontend"
   - `CLOUDFRONT_DISTRIBUTION_ID` - Get from AWS CloudFront

4. **Watch Actions tab**:
   - Green checkmarks = Success ✅
   - Red X = Check logs for errors

## Security Verification

Before pushing, run these:

```bash
# Should show NO secrets
git diff --cached | grep -i "password\|secret\|key"

# Should show .env.local is ignored
git status | grep env

# Should show files are staging
git status

# Should show 0 audit issues
npm audit
```

## Files Committed to GitHub

```
✅ Frontend code (React, Tailwind, pages)
✅ Backend code (Lambda functions, SAM template)
✅ Documentation (README, guides, API reference)
✅ GitHub Actions workflow
✅ .gitignore and .env.example
❌ .env.local (secrets - NOT committed)
❌ node_modules/ (auto-installed by CI/CD)
❌ dist/ (rebuilt by CI/CD)
```

## Common Git Commands

```bash
# Check status
git status

# View logs
git log --oneline -5

# View differences
git diff HEAD

# Undo unstaged changes
git checkout .

# Undo staged changes
git reset

# Fix last commit
git commit --amend --no-edit

# Push updates
git push origin main

# Pull updates (if multiple developers)
git pull origin main
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `fatal: not a git repository` | Run `git init` first |
| `.env.local` showing in git status | Add to .gitignore, then `git rm --cached .env.local` |
| `Permission denied (publickey)` | Add SSH key to GitHub: https://github.com/settings/keys |
| Workflow won't start | Check GitHub Secrets are configured |
| API returns 403 | Check AWS credentials in GitHub Secrets |
| Frontend won't load | Check FRONTEND_BUCKET exists in S3 |

## What Happens After You Push

1. **GitHub detects push to main**
2. **Workflow starts automatically** (1-2 minutes)
3. **Tests run** - all should pass ✅
4. **Lambda deploys** - 2-3 minutes
5. **Frontend builds & uploads** - 2-3 minutes
6. **CloudFront invalidates cache** - 1-2 minutes
7. **Site goes live** - 5-10 minutes total

## Verify Production Deployment

```bash
# Test API
curl https://ttfcw5hak8.execute-api.us-east-1.amazonaws.com/prod/hotels

# Test Frontend (get URL from Actions output)
# Visit https://[cloudfront-id].cloudfront.net/

# Check logs
# AWS Console → CloudWatch → Log groups
```

## Contact & Help

- **Docs**: See README.md
- **Deployment Guide**: See GITHUB_DEPLOYMENT.md
- **API Reference**: See API_ENDPOINTS.md
- **Auth Setup**: See COGNITO_SETUP.md
- **Status**: See GITHUB_READY.md

---

**You're ready to deploy! 🚀**

Just run the 6 commands above and GitHub Actions handles the rest.
