SAM deployment steps

Prerequisites
- AWS CLI configured with credentials that can create CloudFormation stacks, IAM roles, S3, DynamoDB, Lambda, and API Gateway.
- SAM CLI installed (https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- Docker if using `--use-container` for `sam build` (recommended for reproducible builds)

Files in this folder:
- `template.yaml` - SAM template defining S3, DynamoDB, API, and two Lambda functions.
- `deploy.ps1` - PowerShell helper to build & deploy the template.

How to deploy
1) Copy the function code from `amplify-helpers/presign-upload` and `amplify-helpers/user-profile` into the same-named folders relative to this template (already arranged as `../presign-upload/` and `../user-profile/`).

2) (Optional) Edit `template.yaml` to adjust names or remove the Cognito authorizer if you want to secure via a different method.

3) Run the deploy script from PowerShell inside this folder:

```powershell
# from jordan-hotels-app\amplify-helpers\sam
.\deploy.ps1 -StackName visitjo-backend -Region us-east-1 -CognitoUserPoolArn "arn:aws:cognito-idp:...:userpool/..." -AllowedOrigins "http://localhost:5175,https://your-prod-domain.com"
```

If you do not yet have a Cognito user pool ARN, leave `-CognitoUserPoolArn` empty and finish the guided deploy. After deployment you can secure the API by updating API Gateway's authorizer to use your Cognito user pool.

After deploy
- The script prints the API base URL in the CloudFormation outputs. Use that URL to set `VITE_API_GATEWAY_URL` in your frontend runtime config or `.env`.
- The Lambdas will have `BUCKET_NAME` and `TABLE_NAME` environment variables set. The `presign-upload` Lambda returns a signed PUT URL and key; `user-profile` GET/PUT returns/updates the DynamoDB item keyed by `userId` (Cognito `sub`).

Notes
- The template currently sets the S3 bucket and DynamoDB table to `Retain` on deletion to avoid accidental data loss. Remove `DeletionPolicy: Retain` if you want stacks to remove resources on delete.
- For secure image delivery, generate presigned GET URLs from a separate Lambda or use CloudFront with signed URLs.

If you want, I can now:
- Scaffold the SAM function folders under `amplify/backend/sam/` or similar so you can deploy immediately, or
- Run a dry-run validation of the SAM template here and surface any errors.
