# Deployment script to update the existing stack without creating duplicates
# Usage: .\deploy-update.ps1

$StackName = "visitjo-backend-cors"
$Region = "us-east-1"

Write-Host "🚀 Starting deployment for stack: $StackName"

# 1. Deploy using SAM (updates existing stack)
Write-Host "📦 Deploying CloudFormation stack..."
sam deploy --stack-name $StackName --resolve-s3 --capabilities CAPABILITY_IAM --region $Region

# 2. Get the API Gateway ID from the stack outputs
$ApiId = aws cloudformation describe-stacks --stack-name $StackName --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayId'].OutputValue" --output text --region $Region

# 3. Get AWS Account ID
$AccountId = aws sts get-caller-identity --query Account --output text

if ($ApiId -and ($ApiId -ne "None")) {
    Write-Host "✅ Found API ID: $ApiId"

    # 4. Wire up the Lambdas to the API Gateway
    Write-Host "🔗 Wiring Lambdas to API Gateway..."
    node lambda/wire-lambdas.js $ApiId $Region $AccountId
} else {
    Write-Error "❌ Could not find ApiGatewayId in stack outputs. Make sure your SAM template outputs the API ID as 'ApiGatewayId'."
}

Write-Host "✨ Deployment complete!"