<#
Interactive Repair Script for VisitJo

What it does:
- Creates `./inventory` and saves API, integration, Lambda, and DynamoDB data there.
- Creates on-demand backups for non-empty DynamoDB tables it finds (prompts first).
- Collects recent CloudWatch logs for identified Lambda functions.
- Detects API Gateway integrations that reference Lambda ARNs which no longer exist.
- Offers to update broken integrations to an existing `VisitJo-*` Lambda you choose (prompts before applying).

Requirements:
- AWS CLI installed and configured, or run with environment credentials.
- PowerShell 7+ recommended but works in PowerShell 5.

Safety:
- The script prompts before making any changes. Backups are created before destructive ops.
#>

param(
    [string]$Region = 'us-east-1'
)

function Exec([string]$cmd) {
    Write-Host "> $cmd" -ForegroundColor Cyan
    iex $cmd
}

Write-Host "Repair VisitJo interactive helper" -ForegroundColor Green
Write-Host "Region: $Region" -ForegroundColor Yellow

$inventoryDir = Join-Path -Path (Get-Location) -ChildPath 'inventory'
if (-not (Test-Path $inventoryDir)) { New-Item -ItemType Directory -Path $inventoryDir | Out-Null }

Write-Host "Collecting API Gateway resources for API 'bjdkfctfq6'..." -ForegroundColor Green
Exec "aws apigateway get-resources --rest-api-id bjdkfctfq6 --region $Region --output json > `"$inventoryDir\resources.json`""

$resources = Get-Content "$inventoryDir\resources.json" -Raw | ConvertFrom-Json

$hotelsRes = $resources.items | Where-Object { $_.path -eq '/hotels' }
if ($hotelsRes) {
    Write-Host "Found /hotels resource id: $($hotelsRes.id)" -ForegroundColor Green
} else {
    Write-Host "Couldn't find /hotels resource in API resources. Review $inventoryDir\resources.json" -ForegroundColor Red
}

Write-Host "Collecting all REST APIs (summary)..." -ForegroundColor Green
Exec "aws apigateway get-rest-apis --region $Region --output json > `"$inventoryDir\rest_apis.json`""

Write-Host "Listing Lambdas..." -ForegroundColor Green
Exec "aws lambda list-functions --region $Region --output json > `"$inventoryDir\lambdas.json`""

Write-Host "Listing DynamoDB tables..." -ForegroundColor Green
Exec "aws dynamodb list-tables --region $Region --output json > `"$inventoryDir\tables.json`""

Write-Host "Inspecting integrations for each resource method..." -ForegroundColor Green
$brokenIntegrations = @()
foreach ($res in $resources.items) {
    if ($null -eq $res.resourceMethods) { continue }
    $rid = $res.id
    foreach ($method in $res.resourceMethods.Keys) {
        if ($method -eq 'OPTIONS') { continue }
        $methFile = "$inventoryDir\integration_${rid}_${method}.json"
        Exec "aws apigateway get-integration --rest-api-id bjdkfctfq6 --resource-id $rid --http-method $method --region $Region > `"$methFile`""
        Start-Sleep -Milliseconds 200
        try {
            $integ = Get-Content $methFile -Raw | ConvertFrom-Json
        } catch { continue }
        $uri = $integ.uri
        if ($uri -and $uri -match 'functions\/arn:aws:lambda:[^:]+:\d+:function:([^\/]+)') {
            $funcName = $matches[1]
            # check if function exists
            $exists = $false
            try {
                iex "aws lambda get-function --function-name $funcName --region $Region --output json 2>`"$inventoryDir\lambda_check_${funcName}.err`" > `"$inventoryDir\lambda_check_${funcName}.json`""
                $last = $LASTEXITCODE
                if ($last -eq 0) { $exists = $true }
            } catch { $exists = $false }
            if (-not $exists) {
                $brokenIntegrations += [PSCustomObject]@{ ResourceId=$rid; Method=$method; Function=$funcName; Uri=$uri }
            }
        }
    }
}

if ($brokenIntegrations.Count -eq 0) {
    Write-Host "No broken API→Lambda integrations detected." -ForegroundColor Green
} else {
    Write-Host "Detected broken integrations:" -ForegroundColor Yellow
    $brokenIntegrations | Format-Table | Out-String | Write-Host
    $reportPath = Join-Path $inventoryDir 'broken_integrations.md'
    $brokenIntegrations | ConvertTo-Json -Depth 5 | Out-File $reportPath -Encoding utf8
    Write-Host "Wrote $reportPath" -ForegroundColor Green

    # show candidate lambdas to map to
    $lambdas = Get-Content "$inventoryDir\lambdas.json" -Raw | ConvertFrom-Json
    $lambdaNames = $lambdas.Functions | ForEach-Object { $_.FunctionName }

    foreach ($b in $brokenIntegrations) {
        Write-Host "\nBroken integration: ResourceId=$($b.ResourceId) Method=$($b.Method) ExpectedFunction=$($b.Function)" -ForegroundColor Red
        Write-Host "Choose replacement function from the list below or press Enter to skip:" -ForegroundColor Cyan
        $idx = 0
        $candidates = $lambdaNames | Where-Object { $_ -like '*VisitJo*' -or $_ -like '*visitjo*' } | Sort-Object
        foreach ($c in $candidates) { Write-Host "[$idx] $c"; $idx++ }
        if ($candidates.Count -eq 0) { Write-Host "No VisitJo candidates found. You can still input a function name manually." -ForegroundColor Yellow }
        $sel = Read-Host "Enter index or function name to use as replacement (blank=skip)"
        if ([string]::IsNullOrWhiteSpace($sel)) { Write-Host "Skipping"; continue }
        $replacement = $null
        if ($sel -match '^[0-9]+$') { $replacement = $candidates[[int]$sel] } else { $replacement = $sel }
        if (-not $replacement) { Write-Host "Invalid selection, skipping."; continue }

        # build integration uri
        $newArnJson = iex "aws lambda get-function --function-name $replacement --region $Region --output json 2>`"$inventoryDir\lambda_check_${replacement}.err`" > `"$inventoryDir\lambda_check_${replacement}.json`""
        $newArn = (Get-Content "$inventoryDir\lambda_check_${replacement}.json" -Raw | ConvertFrom-Json).Configuration.FunctionArn
        if (-not $newArn) { Write-Host "Could not read ARN for $replacement, skipping."; continue }
        $newUri = "arn:aws:apigateway:$Region:lambda:path/2015-03-31/functions/$newArn/invocations"

        Write-Host "About to update integration for resource $($b.ResourceId) method $($b.Method) to $replacement" -ForegroundColor Yellow
        $confirm = Read-Host "Apply update? (y/N)"
        if ($confirm -ne 'y') { Write-Host "Skipped update"; continue }

        # apply integration update
        Exec "aws apigateway put-integration --rest-api-id bjdkfctfq6 --resource-id $($b.ResourceId) --http-method $($b.Method) --type AWS_PROXY --integration-http-method POST --uri `"$newUri`" --region $Region"

        # ensure api gateway can invoke the lambda (add permission)
        $accountId = (aws sts get-caller-identity --query Account --output text)
        $sid = "apigw-invoke-$([Guid]::NewGuid().ToString().Substring(0,8))"
        $sourceArn = "arn:aws:execute-api:$Region:$accountId:bjdkfctfq6/*/$($b.Method)/*"
        Write-Host "Adding lambda permission so API Gateway can invoke $replacement (statement id $sid)" -ForegroundColor Cyan
        Exec "aws lambda add-permission --function-name `"$replacement`" --statement-id $sid --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn `"$sourceArn`" --region $Region"

        Write-Host "Integration updated. You may need to redeploy the API in the console or via CloudFormation/Amplify." -ForegroundColor Green
    }
}

Write-Host "Now scanning DynamoDB tables and creating backups for non-empty tables." -ForegroundColor Green
$tables = Get-Content "$inventoryDir\tables.json" -Raw | ConvertFrom-Json
foreach ($t in $tables.TableNames) {
    $descJson = iex "aws dynamodb describe-table --table-name `"$t`" --region $Region --output json > `"$inventoryDir\table_${t}.json`""
    $desc = Get-Content "$inventoryDir\table_${t}.json" -Raw | ConvertFrom-Json
    $items = $desc.Table.ItemCount
    Write-Host "$t: itemCount=$items"
    if ($items -gt 0) {
        $ok = Read-Host "Create on-demand backup for $t? (y/N)"
        if ($ok -eq 'y') {
            $bakName = "before-repair-$(Get-Date -Format yyyyMMddHHmm)-$t"
            Exec "aws dynamodb create-backup --table-name `"$t`" --backup-name `"$bakName`" --region $Region > `"$inventoryDir\backup_${t}.json`""
        }
    }
}

Write-Host "Collected logs for Lambda functions referenced in inventory (last 200 events)." -ForegroundColor Green
$lfuncs = (Get-Content "$inventoryDir\lambdas.json" -Raw | ConvertFrom-Json).Functions | Select-Object -ExpandProperty FunctionName
foreach ($fn in $lfuncs) {
    $safe = $fn -replace '[^a-zA-Z0-9-_]','_'
    Exec "aws logs filter-log-events --log-group-name `/aws/lambda/$fn` --limit 200 --region $Region > `"$inventoryDir\logs_${safe}.json`" 2>`"$inventoryDir\logs_${safe}.err`""
}

Write-Host "Repair helper finished. Check the inventory folder and 'broken_integrations.md' for suggested changes and applied updates." -ForegroundColor Green
