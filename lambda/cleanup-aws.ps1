Param(
  [string]$StackName = $(if ($env:VISITJO_STACK_NAME) { $env:VISITJO_STACK_NAME } else { "VisitJo" }),
  [string]$Region = $(if ($env:AWS_REGION) { $env:AWS_REGION } elseif ($env:AWS_DEFAULT_REGION) { $env:AWS_DEFAULT_REGION } else { "us-east-1" }),
  [switch]$Force
)

$ErrorActionPreference = "Stop"

function Require-Command([string]$Name) {
  try { Get-Command $Name -ErrorAction Stop | Out-Null }
  catch { throw "Required command not found: $Name" }
}

function Try-Json([string]$Text) {
  if (-not $Text) { return $null }
  try { return $Text | ConvertFrom-Json }
  catch { return $null }
}

function Get-AccountId([string]$Region) {
  $out = aws sts get-caller-identity --region $Region --output json 2>$null
  $obj = Try-Json $out
  if (-not $obj -or -not $obj.Account) { throw "Unable to determine AWS account id (are you logged in?)" }
  return $obj.Account
}

function Get-StackResources([string]$StackName, [string]$Region) {
  $out = aws cloudformation describe-stack-resources --stack-name $StackName --region $Region --output json 2>$null
  $obj = Try-Json $out
  if (-not $obj) { throw "Unable to describe stack resources for $StackName in $Region" }
  return $obj.StackResources
}

function Get-LambdaTags([string]$FunctionName, [string]$Region, [string]$AccountId) {
  $arn = "arn:aws:lambda:${Region}:${AccountId}:function:${FunctionName}"
  $out = aws lambda list-tags --resource $arn --region $Region --output json 2>$null
  $obj = Try-Json $out
  return @{ Arn = $arn; Tags = $(if ($obj -and $obj.Tags) { $obj.Tags } else { @{} }) }
}

function Get-DynamoTableArn([string]$TableName, [string]$Region) {
  $out = aws dynamodb describe-table --table-name $TableName --region $Region --output json 2>$null
  $obj = Try-Json $out
  return $(if ($obj -and $obj.Table -and $obj.Table.TableArn) { $obj.Table.TableArn } else { $null })
}

function Get-DynamoTags([string]$TableArn, [string]$Region) {
  if (-not $TableArn) { return @{} }
  $out = aws dynamodb list-tags-of-resource --resource-arn $TableArn --region $Region --output json 2>$null
  $obj = Try-Json $out
  $tags = @{}
  if ($obj -and $obj.Tags) {
    foreach ($t in $obj.Tags) { $tags[$t.Key] = $t.Value }
  }
  return $tags
}

function Get-ApigwTags([string]$ApiId, [string]$Region) {
  # API Gateway tag ARN format for REST API: arn:aws:apigateway:{region}::/restapis/{apiId}
  $arn = "arn:aws:apigateway:${Region}::/restapis/${ApiId}"
  $out = aws apigateway get-tags --resource-arn $arn --region $Region --output json 2>$null
  $obj = Try-Json $out
  return @{ Arn = $arn; Tags = $(if ($obj -and $obj.tags) { $obj.tags } else { @{} }) }
}

function Is-FromStack($Tags, [string]$StackName) {
  if (-not $Tags) { return $false }
  $stackTag = $Tags['aws:cloudformation:stack-name']
  return ($stackTag -eq $StackName)
}

function Get-TagStackName($Tags) {
  if (-not $Tags) { return $null }
  return $Tags['aws:cloudformation:stack-name']
}

Require-Command aws

Write-Host "Cleanup scan (region: $Region, keep stack: $StackName)" -ForegroundColor Cyan
$accountId = Get-AccountId -Region $Region

$stackResources = Get-StackResources -StackName $StackName -Region $Region

$keepFunctions = @{}
$keepTables = @{}
$keepApis = @{}

foreach ($r in $stackResources) {
  switch ($r.ResourceType) {
    'AWS::Lambda::Function' { $keepFunctions[$r.PhysicalResourceId] = $true }
    'AWS::DynamoDB::Table' { $keepTables[$r.PhysicalResourceId] = $true }
    'AWS::ApiGateway::RestApi' { $keepApis[$r.PhysicalResourceId] = $true }
  }
}

# Also keep the Serverless Api physical id (often shows up as AWS::ApiGateway::RestApi, but be defensive)
foreach ($r in $stackResources) {
  if ($r.ResourceType -like '*Api*' -and $r.PhysicalResourceId -match '^[a-z0-9]{10}$') {
    $keepApis[$r.PhysicalResourceId] = $true
  }
}

Write-Host "Discovering candidate Lambdas/APIs/Tables..." -ForegroundColor Green

# Filter to likely app-related names to avoid touching unrelated resources in your account.
$lambdaOut = aws lambda list-functions --region $Region --output json
$lambdaObj = Try-Json $lambdaOut
$allLambda = @()
if ($lambdaObj -and $lambdaObj.Functions) {
  $allLambda = $lambdaObj.Functions | ForEach-Object { $_.FunctionName }
}

$candidateLambda = $allLambda | Where-Object {
  $_ -match '^(VisitJo-|visitjo-backend-|getHotels$|getHotelById$|getSignedUrl$|createCheckoutSession$|bookings$|user$|destinations$|deals$|experiences$|search$|sendBookingEmail$)'
}

$apiOut = aws apigateway get-rest-apis --region $Region --output json
$apiObj = Try-Json $apiOut
$allApis = @()
if ($apiObj -and $apiObj.items) { $allApis = $apiObj.items }
$candidateApis = $allApis | Where-Object { $_.name -in @('VisitJo','VisitJoApi','HotelsApi') }

$tableOut = aws dynamodb list-tables --region $Region --output json
$tableObj = Try-Json $tableOut
$allTables = @()
if ($tableObj -and $tableObj.TableNames) { $allTables = $tableObj.TableNames }
$candidateTables = $allTables | Where-Object {
  $_ -match '^(VisitJo-|visitjo-backend-)|(\bhotels\b|\bbookings\b|\busers\b|\bdestinations\b|\bdeals\b|\bexperiences\b)$'
}

$stacksToDelete = New-Object System.Collections.Generic.HashSet[string]
$lambdaToDelete = New-Object System.Collections.Generic.List[string]
$apisToDelete = New-Object System.Collections.Generic.List[object]
$tablesToDelete = New-Object System.Collections.Generic.List[string]

# Lambdas
foreach ($fn in $candidateLambda) {
  if ($keepFunctions.ContainsKey($fn)) { continue }

  $tagInfo = Get-LambdaTags -FunctionName $fn -Region $Region -AccountId $accountId
  $tagStack = Get-TagStackName $tagInfo.Tags
  if ($tagStack -and $tagStack -ne $StackName) {
    $stacksToDelete.Add($tagStack) | Out-Null
  } else {
    $lambdaToDelete.Add($fn) | Out-Null
  }
}

# APIs
foreach ($api in $candidateApis) {
  if ($keepApis.ContainsKey($api.id)) { continue }

  $tagInfo = Get-ApigwTags -ApiId $api.id -Region $Region
  $tagStack = Get-TagStackName $tagInfo.Tags
  if ($tagStack -and $tagStack -ne $StackName) {
    $stacksToDelete.Add($tagStack) | Out-Null
  } else {
    $apisToDelete.Add($api) | Out-Null
  }
}

# Dynamo tables
foreach ($t in $candidateTables) {
  if ($keepTables.ContainsKey($t)) { continue }

  $arn = Get-DynamoTableArn -TableName $t -Region $Region
  $tags = Get-DynamoTags -TableArn $arn -Region $Region
  $tagStack = Get-TagStackName $tags
  if ($tagStack -and $tagStack -ne $StackName) {
    $stacksToDelete.Add($tagStack) | Out-Null
  } else {
    $tablesToDelete.Add($t) | Out-Null
  }
}

Write-Host "" 
Write-Host "=== DRY RUN (what would be deleted) ===" -ForegroundColor Yellow
Write-Host ("Keep stack: {0}" -f $StackName) -ForegroundColor Cyan
Write-Host "Stacks to delete (will remove their Lambdas/APIs/Tables):" -ForegroundColor Yellow
$stacksToDelete | Sort-Object | ForEach-Object { Write-Host "  - $_" }

Write-Host "`nStandalone Lambdas to delete:" -ForegroundColor Yellow
$lambdaToDelete | Sort-Object | ForEach-Object { Write-Host "  - $_" }

Write-Host "`nStandalone REST APIs to delete:" -ForegroundColor Yellow
$apisToDelete | ForEach-Object { Write-Host ("  - {0} ({1})" -f $_.name, $_.id) }

Write-Host "`nStandalone DynamoDB tables to delete:" -ForegroundColor Yellow
$tablesToDelete | Sort-Object | ForEach-Object { Write-Host "  - $_" }

if (-not $Force) {
  Write-Host "\nNo deletions performed. Re-run with -Force to execute." -ForegroundColor Cyan
  exit 0
}

Write-Host "\n=== EXECUTING DELETIONS (-Force) ===" -ForegroundColor Red

# Delete stacks first
foreach ($s in ($stacksToDelete | Sort-Object)) {
  if ($s -eq $StackName) { continue }
  Write-Host "Deleting stack: $s" -ForegroundColor Red
  aws cloudformation delete-stack --stack-name $s --region $Region | Out-Null
}
foreach ($s in ($stacksToDelete | Sort-Object)) {
  if ($s -eq $StackName) { continue }
  Write-Host "Waiting for stack delete: $s" -ForegroundColor Red
  aws cloudformation wait stack-delete-complete --stack-name $s --region $Region
}

# Delete standalone APIs
foreach ($api in $apisToDelete) {
  Write-Host ("Deleting REST API: {0} ({1})" -f $api.name, $api.id) -ForegroundColor Red
  $attempt = 0
  while ($true) {
    $attempt++
    try {
      aws apigateway delete-rest-api --rest-api-id $api.id --region $Region | Out-Null
      break
    } catch {
      if ($attempt -ge 6) { throw }
      $delay = [Math]::Min(30, 2 * $attempt)
      Write-Host "API Gateway throttled; retrying in ${delay}s..." -ForegroundColor Yellow
      Start-Sleep -Seconds $delay
    }
  }
}

# Delete standalone lambdas
foreach ($fn in ($lambdaToDelete | Sort-Object)) {
  Write-Host "Deleting Lambda: $fn" -ForegroundColor Red
  aws lambda delete-function --function-name $fn --region $Region | Out-Null
}

# Delete standalone tables
foreach ($t in ($tablesToDelete | Sort-Object)) {
  Write-Host "Deleting DynamoDB table: $t" -ForegroundColor Red
  aws dynamodb delete-table --table-name $t --region $Region | Out-Null
}

Write-Host "Done." -ForegroundColor Cyan
