param(
  [string]$StackName = "VISIT-JO-cognito-federation",
  [string]$AWSProfile = "",
  [string]$UserPoolId = "",
  [string]$CallbackURLs = "",
  [string]$LogoutURLs = ""
)

Write-Host "Preparing to deploy Cognito federation stack (Google only)"

if (-not $UserPoolId) {
  $UserPoolId = Read-Host "Enter existing Cognito User Pool Id (e.g. us-east-1_xxx)"
}
if (-not $CallbackURLs) {
  $CallbackURLs = Read-Host "Enter comma separated Callback URLs (e.g. https://app.example.com/auth/callback)"
}
if (-not $LogoutURLs) {
  $LogoutURLs = Read-Host "Enter comma separated Logout URLs (e.g. https://app.example.com/)"
}

$googleClientId = $env:GOOGLE_CLIENT_ID
if (-not $googleClientId) { $googleClientId = Read-Host "Google Client ID" }
$googleClientSecret = $env:GOOGLE_CLIENT_SECRET
if (-not $googleClientSecret) { $googleClientSecret = Read-Host "Google Client Secret (will be stored as parameter)" }

Write-Host "Deploying stack $StackName to AWS..."

$params = "UserPoolId=$UserPoolId CallbackURLs=$CallbackURLs LogoutURLs=$LogoutURLs GoogleClientId=$googleClientId GoogleClientSecret=$googleClientSecret"

if ($AWSProfile) {
  sam deploy --template-file template.yaml --stack-name $StackName --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --parameter-overrides $params --profile $AWSProfile
} else {
  sam deploy --template-file template.yaml --stack-name $StackName --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM --parameter-overrides $params
}

Write-Host "Deployment finished. Note the output values and update visit_runtime_config.js accordingly (VITE_COGNITO_CLIENT_ID / VITE_COGNITO_DOMAIN if you create a domain)."
