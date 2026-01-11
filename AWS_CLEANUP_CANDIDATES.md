# AWS Cleanup Candidates (initial review)

This file lists candidate AWS resources (API Gateway, Lambda, DynamoDB) that appear to be duplicates or unused based on the recent console snapshot. **Do NOT delete anything until you review and back up production data.** Use this as a starting checklist — I recommend running the inventory commands below and verifying ownership (CloudFormation/Amplify) before deletion.

---

## Summary / guidance

- Prefer deleting entire CloudFormation / SAM / Amplify stacks when possible (stack deletion removes dependent resources safely).
- For DynamoDB tables, always create an on-demand backup or export to S3 before deleting.
- Identify which APIs/Lambdas are referenced by your Amplify backend or production `runtime-config.js` before removing.
- `VisitJo` prefix appears to be the active project; `jordan-hotels`, `visitjo`, and `visitjo-v2` look like older/duplicate deployments in the account snapshot.

---

## API Gateway (REST) — candidates

From the console snapshot there are these REST APIs:

- `gnx1gwole5` (imported 2026-01-09) — unknown/likely leftover import
- `cy3w0i2d2g` (imported 2026-01-09) — unknown/likely leftover import
- `3sh1kxvhoc` (imported 2026-01-09) — unknown/likely leftover import
- `zcxnvm9klg` (jordan-hotels) — referenced by production previously; returned empty hotels in production test. Consider deleting if you confirm no clients depend on it.
- `bjdkfctfq6` (VisitJo) — appears to be the API that currently contains seeded hotel data (keep)

Recommendation
- Keep `bjdkfctfq6` (VisitJo) if it is the active API used by the site.
- Investigate the 3 imported APIs (`gnx1gwole5`, `cy3w0i2d2g`, `3sh1kxvhoc`) and delete if they are test/import artifacts.
- If `zcxnvm9klg` is an old/junk API and no clients use it, delete it after confirming no references.

Check commands
```bash
# list REST APIs
aws apigateway get-rest-apis --region us-east-1 --output table

# test which api returns hotels (replace <api-id>)
curl -sS https://<api-id>.execute-api.us-east-1.amazonaws.com/prod/hotels | jq .

# delete a Rest API (after confirmation)
aws apigateway delete-rest-api --rest-api-id <api-id> --region us-east-1
```

---

## DynamoDB tables — candidates

Snapshot (selected):
- `jordan-hotels-BookingsTable-1FYRJBY7IESEK` — 0 bytes (candidate)
- `jordan-hotels-DealsTable-GN24OJSFZPD1` — 0 bytes (candidate)
- `jordan-hotels-DestinationsTable-MP3RH2L5NMOR` — 0 bytes (candidate)
- `jordan-hotels-ExperiencesTable-1SRMPNENLTLRH` — 0 bytes (candidate)
- `jordan-hotels-HotelsTable-19DZJQPC78UY0` — 0 bytes (candidate)
- `jordan-hotels-UsersTable-1ICMHYOFHRBFP` — 0 bytes (candidate)
- `VisitJo-BookingsTable-15XL6U9YI8DVI` — 1.7 kilobytes (has data; keep or backup)
- `VisitJo-HotelsTable-W4T0RDUFRSJG` — 132.3 kilobytes (has data; keep)
- `visitjo-UsersTable-3O4P66CDEQDC` — 576 bytes (small, inspect)
- `visitjo-v2-*` tables — mostly 0 bytes (candidates for deletion)

Recommendation
- Keep and backup `VisitJo-HotelsTable-W4T0RDUFRSJG` and `VisitJo-BookingsTable-15XL6...` — they contain data.
- Candidate tables for deletion: any `jordan-hotels-*`, `visitjo-v2-*`, or other `visitjo-*` tables that show `0 bytes` and are not owned by an active stack.

Safety / Backup commands
```bash
# list tables
aws dynamodb list-tables --region us-east-1

# describe to confirm size and item count
aws dynamodb describe-table --table-name <TableName> --region us-east-1 | jq .

# create on-demand backup (strongly recommended before delete)
aws dynamodb create-backup --table-name <TableName> --backup-name before-delete-$(date +%Y%m%d) --region us-east-1

# export to S3 (alternative for large tables)
aws dynamodb export-table-to-point-in-time --table-arn <table-arn> --s3-bucket <bucket> --region us-east-1

# delete table (after backup and confirmation)
aws dynamodb delete-table --table-name <TableName> --region us-east-1
```

---

## Lambda functions — candidates

Snapshot shows many duplicates with different prefixes (examples):

- `jordan-hotels-GetSignedUrlFunction-...` and `VisitJo-GetSignedUrlFunction-...`
- `jordan-hotels-BookingsFunction-...` and `VisitJo-BookingsFunction-...`
- `jordan-hotels-GetHotelsFunction-...` and `VisitJo-GetHotelsFunction-...` (multiple GetHotels functions)
- `jordan-hotels-UserFunction-...`, `visitjo-user-UserFunction-...`, `VisitJo-UserFunction-...`
- `visitjo-chat-ChatFunction-...` and `visitjo-chat-ChatFunction-...` (duplicate-ish)

Recommendation
- Keep one set of functions that are actively used by your API (prefer `VisitJo-*` if that is your current deployment).
- Candidate deletions: older `jordan-hotels-*` prefixed functions and any `*-duplicate-*` names that are not referenced by an API or stack.

How to verify before delete
1. For each Lambda candidate, find owning CloudFormation/Amplify stack: 
```bash
aws lambda get-function --function-name <FunctionName> --region us-east-1
```
Check the `Tags` and `Configuration` fields for `aws:cloudformation:stack-name` or similar.

2. Check API Gateway integration: find which Lambda is integrated with each REST API resource/method.

3. If Lambda is part of a CloudFormation/SAM/Amplify stack, prefer deleting the stack.

Delete commands
```bash
# delete function
aws lambda delete-function --function-name <FunctionName> --region us-east-1

# delete stack (preferred if resources are managed by the stack)
aws cloudformation delete-stack --stack-name <StackName> --region us-east-1
```

### Specific delete candidates (from your console snapshot)

Based on the Lambda list you pasted, these are high-confidence candidates to remove (appear to be older `jordan-hotels-*` deployments). I recommend deleting these first after you confirm they are not referenced by any active API or CloudFormation stack.

- jordan-hotels-GetSignedUrlFunction-9dx7IIByn9qo
- jordan-hotels-BookingsFunction-mA7ZlKau8tOl
- jordan-hotels-CreatePaymentIntentFunction-67xJcm2bIDjJ
- jordan-hotels-DealsFunction-pbuPALUrMICc
- jordan-hotels-SendBookingEmailFunction-S4VGoxIyPHe0
- jordan-hotels-DestinationsFunction-EhbQ1qlhn5ti
- jordan-hotels-CreateCheckoutSessionFunction-GIO4LqSLG3rN
- jordan-hotels-GetSignedUrlFunction- (duplicate entries) — remove any additional `jordan-hotels-GetSignedUrlFunction-*`
- jordan-hotels-GetHotelByIdFunction-xMGTnKGgisgU
- jordan-hotels-UserFunction-yHWr3pxpL0eU
- jordan-hotels-SearchFunction-7VVpBuE0KlIv
- jordan-hotels-GetHotelsFunction-gg2p8b38g7wc
- jordan-hotels-GetHotelsFunction- (remove other duplicates if present)
- jordan-hotels-ExperiencesFunction-Zzky5Iasbq7g

Medium-confidence candidates (likely duplicates of `VisitJo-*` functions). Only delete these after verifying the `VisitJo-*` counterpart works and ownership/tags are clear:

- visitjo-user-UserFunction-8fQOXs6usBuQ
- visitjo-chat-ChatFunction-iPCZM9yl7ECw

Keep (do not delete unless you explicitly want to): any `VisitJo-*` functions, `amplify-*` functions (these are created by Amplify), and any function that appears in your active API Gateway integrations.

Before deleting any function
- Run `aws lambda get-function --function-name <FunctionName> --region us-east-1` and check `Tags` and `Configuration` for stack ownership.
- Confirm the API Gateway integration does not reference the function:
	- `aws apigateway get-rest-apis --region us-east-1` then inspect resources/integrations in the API that might call the function.

Delete example (after verification):
```bash
# recommended: delete CloudFormation stack that owns these functions (example)
aws cloudformation delete-stack --stack-name jordan-hotels-stack-name --region us-east-1

# or delete function directly (only after confirming it's orphaned)
aws lambda delete-function --function-name jordan-hotels-GetHotelsFunction-gg2p8b38g7wc --region us-east-1
```

---

## Suggested cleanup plan (practical order)

1. Run a full inventory (list functions, APIs, tables, stacks) and save outputs.
2. Cross-reference resource ownership via CloudFormation/Amplify tags.
3. Backup DynamoDB tables that contain any data.
4. Prepare a short deletion candidate list grouped by stack — present it here and get explicit approval.
5. Delete stacks first (CloudFormation), then remaining orphan resources.
6. Validate site and API behavior, then invalidate CloudFront if needed.

## Quick checklist to run now
```bash
# Lambdas
aws lambda list-functions --region us-east-1 > inventory/lambdas.json

# APIs
aws apigateway get-rest-apis --region us-east-1 > inventory/apis.json

# DynamoDB
aws dynamodb list-tables --region us-east-1 > inventory/tables.json

# CloudFormationStacks
aws cloudformation list-stacks --region us-east-1 --query "StackSummaries[?StackStatus!='DELETE_COMPLETE']" > inventory/stacks.json
```

---

If you want, I can generate a runnable script that performs the inventory and produces a CSV/markdown of safe-to-delete candidates (based on emptiness and naming). Tell me whether you want me to run the inventory (I will need temporary AWS credentials) or produce the script for you to run locally and paste results here.

---

## Verification script included

I added a verification script at `scripts/aws_verify_functions_and_integrations.py` that:

- Reads a file with one Lambda function name per line (example `candidates.txt`).
- Calls Lambda to fetch function configuration and tags.
- Scans API Gateway REST APIs and finds integrations that reference each function ARN.
- Produces `inventory/function_integration_report.md` with findings.

Quick run (requires Python and `boto3` installed, and AWS credentials available):

```bash
python -m pip install --user boto3
python scripts/aws_verify_functions_and_integrations.py --functions-file candidates.txt --region us-east-1
```

Example `candidates.txt` (one per line):

```
visitjo-chat-ChatFunction-iPCZM9yl7ECw
visitjo-user-UserFunction-8fQOXs6usBuQ
jordan-hotels-GetHotelsFunction-gg2p8b38g7wc
```

After you run it, paste the `inventory/function_integration_report.md` here and I will generate exact `aws` delete commands for orphaned functions.


Created by: maintenance automation
