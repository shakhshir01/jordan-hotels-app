# How to Wire Lambda Functions to API Gateway Methods

This guide shows you how to connect your Lambda functions to the API Gateway resources you created.

## ✅ What You Have

- ✅ 14 API Gateway Resources created (`/hotels`, `/deals`, `/user`, `/blog`, etc.)
- ✅ 11 Lambda Functions deployed (getHotels, getHotelById, search, etc.)
- ✅ 2 NEW Lambda Functions just created (user, blog)
- ❌ 0 Methods wired to resources yet

## 🔗 Method 1: Automated Script (Recommended)

### Prerequisites
- AWS CLI installed and configured
- PowerShell (Windows)

### Run the Script
```powershell
cd jordan-hotels-app/lambda
.\wire-lambdas.ps1 -ApiId "ny5ohksmc3" -Region "us-east-1"
```

Replace `ny5ohksmc3` with your actual API ID from the AWS Console.

## 🔗 Method 2: Manual AWS Console (Step-by-Step)

### For Each Endpoint (Example: `/hotels` GET):

1. **Open API Gateway Console**
   - Go to: https://console.aws.amazon.com/apigateway/
   - Select your API: `HotelsApi`
   - Click on `Resources` tab

2. **Select Resource**
   - Click on `/hotels` in the resource tree

3. **Create Method**
   - Click `Create method` dropdown
   - Select `GET`
   - Choose `AWS Lambda` as integration type
   - Function: `getHotels`
   - Check "Use Lambda Proxy integration"
   - Click `Create`

4. **Repeat for ALL endpoints** (see list below)

### All 16 Endpoints to Wire:

```
Hotels:
  GET   /hotels              → getHotels
  GET   /hotels/{id}         → getHotelById
  POST  /hotels/{id}/book    → bookings

Search:
  GET   /search              → search

Destinations:
  GET   /destinations        → destinations
  GET   /destinations/{id}   → destinations

Deals:
  GET   /deals               → deals
  GET   /deals/{id}          → deals

Experiences:
  GET   /experiences         → experiences
  GET   /experiences/{id}    → experiences

Payments:
  POST  /payments/create-checkout-session → createCheckoutSession

Uploads:
  POST  /uploads/signed-url  → getSignedUrl

User (NEW):
  GET   /user/profile        → user
  GET   /user/bookings       → user

Blog (NEW):
  GET   /blog                → blog
  GET   /blog/{slug}         → blog
```

## ✅ Grant Permissions

After wiring all methods, you need to grant API Gateway permission to invoke Lambda functions:

```bash
# For each Lambda function, run:
aws lambda add-permission \
  --function-name getHotels \
  --statement-id allow-apigateway \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:123456789012:ny5ohksmc3/*/*"
```

Or use the PowerShell helper script:

```powershell
$apiId = "ny5ohksmc3"
$region = "us-east-1"
$accountId = aws sts get-caller-identity --query Account --output text

$lambdas = @("getHotels", "getHotelById", "bookings", "search", "destinations", "deals", "experiences", "createCheckoutSession", "getSignedUrl", "user", "blog")

foreach ($lambda in $lambdas) {
    aws lambda add-permission `
      --function-name $lambda `
      --statement-id allow-apigateway `
      --action lambda:InvokeFunction `
      --principal apigateway.amazonaws.com `
      --source-arn "arn:aws:execute-api:${region}:${accountId}:${apiId}/*/*"
}
```

## 🚀 Deploy API

Once all methods are wired:

```bash
aws apigateway create-deployment \
  --rest-api-id ny5ohksmc3 \
  --stage-name prod \
  --region us-east-1
```

## 🧪 Test

After deployment, test a simple endpoint:

```bash
# Test GET /hotels
curl https://plnlaspdy5.execute-api.us-east-1.amazonaws.com/prod/hotels

# Test GET /blog
curl https://plnlaspdy5.execute-api.us-east-1.amazonaws.com/prod/blog
```

## 📝 Notes

- **Proxy Integration**: Using "Lambda Proxy" means the Lambda function receives the full request and must return a proper response format
- **CORS**: May need to enable CORS on resources if testing from different domains
- **Authorization**: Currently set to NONE; can be changed to AWS_IAM or Cognito later
- **Error Handling**: All Lambdas have fallback mock data for errors

## 🆘 Troubleshooting

**Error: "Invalid integration request mapping expression"**
- Make sure you selected "Use Lambda Proxy integration" checkbox

**Error: "User is not authorized to perform: apigateway:PutIntegration"**
- Check your AWS IAM permissions

**Error: "Lambda function not found"**
- Verify the Lambda function exists in your region
- Check the function name matches exactly

## 📊 Status Tracking

After completing this:
- ✅ 16 methods created in API Gateway
- ✅ 11 Lambdas integrated
- ✅ 2 new Lambdas (user, blog) integrated
- ✅ Permissions granted
- ✅ API deployed
- ✅ Ready to test from React frontend!

Next: Update your React frontend with the new API endpoints and test LIVE mode.
