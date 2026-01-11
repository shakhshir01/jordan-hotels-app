Repair helper for VisitJo
========================

This folder contains an interactive PowerShell repair script `repair_visitjo.ps1` that helps diagnose and repair API Gateway → Lambda → DynamoDB issues after cleanup.

What it does
- Collects API Gateway resources, Lambda lists, DynamoDB table list into `./inventory/`.
- Detects API integrations pointing to missing Lambda functions and offers to update integrations to an existing `VisitJo-*` Lambda.
- Creates on-demand backups for any non-empty DynamoDB tables (prompts before creating).
- Collects recent CloudWatch logs for Lambda functions.

Usage
1. Open PowerShell in the repo root (where this script is located).
2. Ensure the AWS CLI is installed and you have credentials with permissions (see Minimum Policy below).
3. Run:

```powershell
pwsh ./scripts/repair_visitjo.ps1 -Region us-east-1
```

Notes & Safety
- The script prompts before making any changes.
- It will create on-demand backups of any DynamoDB tables you confirm before modifying or deleting anything.
- It attempts to add the necessary Lambda permission for API Gateway to invoke a replacement Lambda when you apply an integration update.

Minimum IAM policy (diagnostic + repair scope)
--------------------------------------------
Attach this limited policy to the temporary IAM user/role used to run the script (short-lived credentials recommended):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {"Effect":"Allow","Action":["apigateway:GET","apigateway:PUT","apigateway:POST","apigateway:DELETE"],"Resource":"*"},
    {"Effect":"Allow","Action":["lambda:GetFunction","lambda:GetFunctionConfiguration","lambda:InvokeFunction","lambda:ListFunctions","lambda:AddPermission"],"Resource":"*"},
    {"Effect":"Allow","Action":["logs:FilterLogEvents","logs:GetLogEvents","logs:DescribeLogStreams","logs:DescribeLogGroups"],"Resource":"*"},
    {"Effect":"Allow","Action":["dynamodb:DescribeTable","dynamodb:ListTables","dynamodb:Scan","dynamodb:CreateBackup"],"Resource":"*"},
    {"Effect":"Allow","Action":["sts:GetCallerIdentity"],"Resource":"*"}
  ]
}
```

If you want me to run these steps for you, provide short-lived credentials, otherwise run the script locally and paste the `./inventory/*` outputs here and I will continue with repair guidance.
