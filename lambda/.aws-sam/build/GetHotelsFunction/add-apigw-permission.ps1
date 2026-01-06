param(
  [Parameter(Mandatory=$true)][string]$ApiId,
  [Parameter(Mandatory=$true)][string]$LambdaName,
  [string]$Region = 'us-east-1'
)

Write-Host "Adding permission for API Gateway (api=$ApiId) to invoke Lambda $LambdaName"

aws lambda add-permission `
  --function-name $LambdaName `
  --statement-id "apigw-invoke-$ApiId" `
  --action lambda:InvokeFunction `
  --principal apigateway.amazonaws.com `
  --source-arn "arn:aws:execute-api:$Region:497339097084:$ApiId/*/*/*" `
  --region $Region

Write-Host "Permission added (or already existed)."
