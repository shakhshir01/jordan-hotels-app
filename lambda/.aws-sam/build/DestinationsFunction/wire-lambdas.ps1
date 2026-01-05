param([Parameter(Mandatory=$true)][string]$ApiId, [Parameter(Mandatory=$false)][string]$Region = "us-east-1")

Write-Host "`n[API Gateway Lambda Wiring Script]`n" -ForegroundColor Cyan

$accountId = aws sts get-caller-identity --query Account --output text --region $Region
Write-Host "[Account: $accountId]`n" -ForegroundColor Green

$resourcesJson = aws apigateway get-resources --rest-api-id $ApiId --region $Region
$resources = $resourcesJson | ConvertFrom-Json
$resourceMap = @{}
foreach ($item in $resources.items) { $resourceMap[$item.path] = $item.id }

Write-Host "[Found $($resources.items.Count) resources]`n" -ForegroundColor Green

$integrations = @(
    @{ Path = "/hotels"; Method = "GET"; Lambda = "getHotels" }
    @{ Path = "/hotels/{id}"; Method = "GET"; Lambda = "getHotelById" }
    @{ Path = "/hotels/{id}/book"; Method = "POST"; Lambda = "bookings" }
    @{ Path = "/search"; Method = "GET"; Lambda = "search" }
    @{ Path = "/destinations"; Method = "GET"; Lambda = "destinations" }
    @{ Path = "/destinations/{id}"; Method = "GET"; Lambda = "destinations" }
    @{ Path = "/deals"; Method = "GET"; Lambda = "deals" }
    @{ Path = "/deals/{id}"; Method = "GET"; Lambda = "deals" }
    @{ Path = "/experiences"; Method = "GET"; Lambda = "experiences" }
    @{ Path = "/experiences/{id}"; Method = "GET"; Lambda = "experiences" }
    @{ Path = "/payments/create-checkout-session"; Method = "POST"; Lambda = "createCheckoutSession" }
    @{ Path = "/uploads/signed-url"; Method = "POST"; Lambda = "getSignedUrl" }
    @{ Path = "/user/profile"; Method = "GET"; Lambda = "user" }
    @{ Path = "/user/bookings"; Method = "GET"; Lambda = "user" }
    @{ Path = "/blog"; Method = "GET"; Lambda = "blog" }
    @{ Path = "/blog/{slug}"; Method = "GET"; Lambda = "blog" }
)

$created = 0; $skipped = 0

foreach ($int in $integrations) {
    if (-not $resourceMap[$int.Path]) { $skipped++; continue }
    
    Write-Host "[Wiring] $($int.Method) $($int.Path) to $($int.Lambda)" -ForegroundColor Yellow
    $rid = $resourceMap[$int.Path]
    $uri = "arn:aws:apigateway:${Region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${Region}:${accountId}:function:$($int.Lambda)/invocations"
    
    aws apigateway put-method --rest-api-id $ApiId --resource-id $rid --http-method $int.Method --authorization-type NONE --region $Region 2>&1 | Out-Null
    aws apigateway put-integration --rest-api-id $ApiId --resource-id $rid --http-method $int.Method --type AWS_PROXY --integration-http-method POST --uri $uri --region $Region 2>&1 | Out-Null
    
    Write-Host "  [OK]" -ForegroundColor Green
    $created++
}

Write-Host "`n[SUMMARY] Created: $created, Skipped: $skipped`n" -ForegroundColor Cyan

Write-Host "[PERMISSIONS]`n" -ForegroundColor Green
foreach ($lambda in @("getHotels", "getHotelById", "bookings", "search", "destinations", "deals", "experiences", "createCheckoutSession", "getSignedUrl", "user", "blog")) {
    aws lambda add-permission --function-name $lambda --statement-id "apigateway-$(Get-Random)" --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:${Region}:${accountId}:${ApiId}/*/*" --region $Region 2>&1 | Out-Null
    Write-Host "  OK - $lambda"
}

Write-Host "`n[DEPLOY]`n" -ForegroundColor Cyan
aws apigateway create-deployment --rest-api-id $ApiId --stage-name prod --region $Region 2>&1 | Out-Null
Write-Host "  Deployed: https://${ApiId}.execute-api.${Region}.amazonaws.com/prod`n" -ForegroundColor Green
