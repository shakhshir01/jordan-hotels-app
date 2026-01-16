param(
  [string]$StackName = "sam-app2",
  [string]$Region = "us-east-1",
  [string]$S3BucketForArtifacts = "",
  [string]$ExistingApiId = "",
  [string]$ExistingBucketName = "",
  [string]$ExistingTableName = "",
  [string]$CognitoUserPoolArn = "",
  [string]$AllowedOrigins = "http://localhost:5175"
)

Write-Host "Deploying update template to stack: $StackName (region: $Region)"
Push-Location -Path $PSScriptRoot

sam build
if ($LASTEXITCODE -ne 0) { Write-Error "sam build failed"; exit 1 }

$paramOverrides = "ExistingApiId=$ExistingApiId ExistingBucketName=$ExistingBucketName ExistingTableName=$ExistingTableName CognitoUserPoolArn=$CognitoUserPoolArn AllowedOrigins='$AllowedOrigins'"

sam deploy --stack-name $StackName --region $Region --parameter-overrides $paramOverrides --capabilities CAPABILITY_IAM --no-confirm-changeset --resolve-s3
if ($LASTEXITCODE -ne 0) { Write-Error "sam deploy failed"; exit 1 }

Pop-Location
