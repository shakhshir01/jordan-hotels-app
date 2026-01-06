param(
  [string]$StackName = 'visitjo-backend',
  [string]$Region = 'us-east-1'
)

Write-Host "Fetching API URL from CloudFormation stack '$StackName' in region $Region..."
$outputs = aws cloudformation describe-stacks --stack-name $StackName --region $Region --query "Stacks[0].Outputs" --output json | ConvertFrom-Json
$api = $outputs | Where-Object { $_.OutputKey -eq 'ApiUrl' }
if (-not $api) {
  Write-Error "ApiUrl output not found in stack $StackName. Check CloudFormation outputs or provide correct stack name."
  exit 2
}
$url = $api.OutputValue
Set-Content -Path .env.local -Value "VITE_API_GATEWAY_URL=$url"
Write-Host ".env.local created with VITE_API_GATEWAY_URL=$url"
