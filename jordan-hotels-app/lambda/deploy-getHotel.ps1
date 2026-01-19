# PowerShell helper to build and deploy the getHotelById Lambda + API using SAM
param(
  [string]$StackName = 'VISIT-JO-backend',
  [string]$S3Bucket = '',
  [string]$Region = 'us-east-1'
)

if (-not (Get-Command sam -ErrorAction SilentlyContinue)) {
  Write-Error 'AWS SAM CLI not found. Install from https://aws.amazon.com/serverless/sam/'
  exit 2
}

Push-Location lambda
sam build --template-file sam-template.yaml
if ($S3Bucket -eq '') {
  Write-Host "Running guided deploy (will prompt for S3 bucket and parameters)..."
  sam deploy --guided --template-file .aws-sam/build/template.yaml
} else {
  sam deploy --template-file .aws-sam/build/template.yaml --stack-name $StackName --s3-bucket $S3Bucket --capabilities CAPABILITY_IAM --region $Region
}
Pop-Location

Write-Host 'SAM deploy finished. Check CloudFormation outputs or the SAM CLI output for the API URL.'
