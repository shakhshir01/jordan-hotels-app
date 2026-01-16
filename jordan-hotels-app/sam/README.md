# SAM: Cognito Federation deploy

This folder contains a CloudFormation template and a small deploy helper to add a Google identity provider to an existing Cognito User Pool, and to create a federated User Pool Client that enables the Hosted UI.

Files
- `template.yaml` — CloudFormation template that creates:
  - `AWS::Cognito::UserPoolIdentityProvider` for Google
  - `AWS::Cognito::UserPoolClient` configured for OAuth flows and supported IdPs
- `deploy.ps1` — PowerShell helper that prompts for inputs (or reads environment variables) and runs `sam deploy`.

Before you run
- Install AWS SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html
- Ensure `aws` CLI is configured with credentials (or use `--profile` in the deploy script).
- Create a Google app in the Google Developer Console and set redirect/callback URL(s) to `https://<your-domain>/auth/callback` (or `http://localhost:5173/auth/callback` for local dev if needed).

Deploy example (PowerShell):
```powershell
cd sam
# Optionally set secrets as environment variables so they are not visible in shell history:
$env:GOOGLE_CLIENT_ID = '150629199826-7crvqmib6bf5ij04sar9a59f3ogol8ra.apps.googleusercontent.com'
$env:GOOGLE_CLIENT_SECRET = '...'
$env:GOOGLE_CLIENT_SECRET = '...'

# Run the helper (it will prompt for missing values):
.\deploy.ps1 -StackName visitjo-cognito-federation -AWSProfile default -UserPoolId us-east-1_T5vYoBi0N -CallbackURLs 'https://app.example.com/auth/callback' -LogoutURLs 'https://app.example.com/'
```

Notes
- The template creates a new User Pool Client; your frontend must be updated to use the new client id (the stack output `UserPoolClientId`). Update `visit_runtime_config.js` with `VITE_COGNITO_CLIENT_ID` accordingly and redeploy the frontend.
- This template does NOT create or modify a User Pool domain. If you want to use a custom Hosted UI domain, create a `UserPoolDomain` resource or configure the domain in the console, then set `VITE_COGNITO_DOMAIN` to the domain value.
- Secrets passed as CloudFormation parameters will be stored in the stack (not recommended for long-term secrets). For production, consider using Secrets Manager and referencing via SSM/Secrets during deployment.
