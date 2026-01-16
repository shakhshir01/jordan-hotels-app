param(
  [string]$StackName = "visitjo-backend",
  [string]$Region = "us-east-1",
  [string]$S3BucketForArtifacts = "",
  [string]$CognitoUserPoolArn = "",
  [string]$AllowedOrigins = "http://localhost:5175"
)

Write-Host "This script builds and deploys the SAM application. You must have AWS CLI and SAM CLI installed and configured."

# Move to template dir
Push-Location -Path $PSScriptRoot

# Build
sam build --use-container
if ($LASTEXITCODE -ne 0) { Write-Error "sam build failed"; exit 1 }

# If no S3 bucket specified, run guided deploy
if (-not $S3BucketForArtifacts) {
  sam deploy --guided --stack-name $StackName --region $Region --parameter-overrides CognitoUserPoolArn=$CognitoUserPoolArn AllowedOrigins=$AllowedOrigins
} else {
  sam package --s3-bucket $S3BucketForArtifacts --output-template-file packaged.yaml --region $Region
  if ($LASTEXITCODE -ne 0) { Write-Error "sam package failed"; exit 1 }
  sam deploy --template-file packaged.yaml --stack-name $StackName --capabilities CAPABILITY_IAM --region $Region --parameter-overrides CognitoUserPoolArn=$CognitoUserPoolArn AllowedOrigins=$AllowedOrigins
}

Pop-Location
