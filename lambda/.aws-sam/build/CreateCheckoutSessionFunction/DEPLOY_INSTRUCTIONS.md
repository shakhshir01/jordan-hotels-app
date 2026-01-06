# Deploy instructions for Lambda + API Gateway (SAM & CLI)

This file contains exact steps to deploy the SAM stack you already have in `lambda/sam-template.yaml`, verify the API, and wire permissions. Use the method that matches your workflow (SAM CLI or manual Console/CLI steps).

Prerequisites
- AWS CLI configured with credentials for account `497339097084` and region `us-east-1`.
- AWS SAM CLI installed if you plan to use SAM (`sam` command).
- An S3 bucket in `us-east-1` for SAM artifacts (create one if needed):

```bash
aws s3 mb s3://your-visitjo-sam-bucket --region us-east-1
```

1) Build the SAM package

```bash
cd lambda
sam build --template-file sam-template.yaml
```

2) Deploy the SAM stack (guided first time)

Interactive (recommended first run):

```bash
sam deploy --guided --template-file .aws-sam/build/template.yaml
```

Non-interactive (after --guided has saved parameters):

```bash
sam deploy --template-file .aws-sam/build/template.yaml --stack-name visitjo-backend --s3-bucket your-visitjo-sam-bucket --capabilities CAPABILITY_IAM --region us-east-1
```

If you want the API to use a Cognito User Pool for authentication, pass the `CognitoUserPoolArn` parameter during deploy (replace the ARN):

```bash
sam deploy --template-file .aws-sam/build/template.yaml --stack-name visitjo-backend --s3-bucket your-visitjo-sam-bucket --capabilities CAPABILITY_IAM --region us-east-1 --parameter-overrides CognitoUserPoolArn=arn:aws:cognito-idp:us-east-1:497339097084:userpool/your_pool_id
```

3) Get the API ID and URL from CloudFormation outputs

List stack outputs:

```bash
aws cloudformation describe-stacks --stack-name visitjo-backend --region us-east-1 --query 'Stacks[0].Outputs' --output json
```

If you used the Console to deploy, you can also find the API URL in the CloudFormation stack Outputs or in the API Gateway console under Stages.

4) (If you didn't use SAM to create API permissions) Grant API Gateway permission to invoke your Lambda(s)

Replace `{api-id}` and `LAMBDA_NAME` accordingly.

```bash
aws lambda add-permission --function-name getHotelById \
  --statement-id apigw-invoke-1 --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com --source-arn "arn:aws:execute-api:us-east-1:497339097084:{api-id}/*/GET/hotels/*" --region us-east-1
```

Or use the helper script added to this repo (from repo root):

```bash
API_ID={api-id} LAMBDA_NAME=getHotelById REGION=us-east-1 ./lambda/add-apigw-permission.sh
```

5) Deploy API stage (if you created API in the console or modified methods)

From API Gateway Console: Actions → Deploy API → select stage `stage` (or create `prod`). This makes your methods live at the stage URL.

6) Verify endpoints (curl)

List hotels:

```bash
curl -i "https://{api-id}.execute-api.us-east-1.amazonaws.com/stage/hotels"
```

Get hotel by id:

```bash
curl -i "https://{api-id}.execute-api.us-east-1.amazonaws.com/stage/hotels/123"
```

Create checkout session (POST):

```bash
curl -i -X POST "https://{api-id}.execute-api.us-east-1.amazonaws.com/stage/payments/create-checkout-session" \
  -H 'Content-Type: application/json' \
  -d '{"hotelId":"h1","userId":"u1","amount":100}'
```

Get signed URL (POST):

```bash
curl -i -X POST "https://{api-id}.execute-api.us-east-1.amazonaws.com/stage/uploads/signed-url" \
  -H 'Content-Type: application/json' \
  -d '{"filename":"photo.jpg"}'
```

7) Update frontend env and test end-to-end

- Set `VITE_API_GATEWAY_URL` in your frontend `.env.local` to the API root, e.g.:

```
VITE_API_GATEWAY_URL=https://{api-id}.execute-api.us-east-1.amazonaws.com/stage
```

- Restart dev server and verify UI calls succeed (hotels list, hotel details, book flow).

8) Optional: Add Cognito Authorizer

- In API Gateway Console → Authorizers → Create a Cognito authorizer and point it to your User Pool.
- On protected methods (bookings, profile, create-checkout-session) set Authorization to the Cognito authorizer.
- Ensure your Lambda handlers validate JWTs if needed (or use API Gateway authorizer to validate and forward claims).

9) Database and S3 wiring (next steps for production readiness)
- Create a DynamoDB table (or RDS) to store hotels and bookings.
- Update Lambda code to use AWS SDK clients (DynamoDB DocumentClient or RDS driver) using IAM role permissions.
- Create an S3 bucket for uploads; update `getSignedUrl` Lambda to generate real pre-signed URLs using `@aws-sdk/client-s3`.
- Store secrets (Stripe secret key) in AWS Secrets Manager and grant Lambda role permission to read it.

IAM & environment variables for DynamoDB (SAM notes)

If you deploy with SAM and want the Lambdas to read/write DynamoDB, add environment variables and grant permissions. Example additions to the function resource in `sam-template.yaml`:

```yaml
  GetHotelByIdFunction:
    Properties:
      Environment:
        Variables:
          DYNAMODB_TABLE_HOTELS: !Ref HotelsTableName
      Policies:
        - Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - dynamodb:GetItem
                - dynamodb:Query
                - dynamodb:Scan
              Resource: !Sub arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/${HotelsTableName}

  BookingsFunction:
    Properties:
      Environment:
        Variables:
          DYNAMODB_TABLE_BOOKINGS: !Ref BookingsTableName
      Policies:
        - Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - dynamodb:PutItem
                - dynamodb:Scan
              Resource: !Sub arn:aws:dynamodb:${AWS::Region}:${AWS::AccountId}:table/${BookingsTableName}
```

And add CloudFormation Parameters / Resources for `HotelsTableName` and `BookingsTableName` or create the tables separately and pass names as parameters.

If you prefer an all-in-one stack, SAM can create DynamoDB tables for you with `AWS::DynamoDB::Table` resources and you can reference them.

S3 IAM notes

If you enable real presigned URL generation, give the Lambda role permission to put objects in the upload bucket. Example IAM policy snippet for SAM:
CloudWatch logging & alarms

The SAM template now creates CloudWatch LogGroups (14-day retention) for each Lambda and metric filters/alarms that count occurrences of the string "ERROR" in logs. After deployment:

- Logs: view function logs in CloudWatch Logs under the log group `/aws/lambda/<function-name>`.
- Alarms: navigate to CloudWatch → Alarms to manage notification actions. The default template creates alarms but no notification actions; attach an SNS topic or other alarm action in the console or by adding ARNs to `AlarmActions`.

If you want automatic notifications on alarm, create an SNS topic and add its ARN to the alarm `AlarmActions` in the SAM template, or pass it as a parameter and reference it.


```yaml
      Policies:
        - Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - s3:PutObject
                - s3:PutObjectAcl
              Resource: !Sub arn:aws:s3:::${UploadBucketName}/*
```

And set the environment variable for the function:

```yaml
      Environment:
        Variables:
          S3_UPLOAD_BUCKET: !Ref UploadBucketName
```

Stripe & Secrets Manager notes

You can supply the Stripe secret key directly via environment variable `STRIPE_SECRET_KEY` or store the key in Secrets Manager and pass the secret ARN via `STRIPE_SECRET_ARN` environment variable.

Example SAM additions for the Checkout function:

```yaml
  CreateCheckoutFunction:
    Properties:
      Environment:
        Variables:
          STRIPE_SECRET_ARN: !Ref StripeSecretArn
          STRIPE_SUCCESS_URL: https://your-frontend.example.com/checkout/success
          STRIPE_CANCEL_URL: https://your-frontend.example.com/checkout/cancel
      Policies:
        - Version: '2012-10-17'
          Statement:
            - Effect: Allow
              Action:
                - secretsmanager:GetSecretValue
              Resource: !Ref StripeSecretArn
```

Alternatively, set `STRIPE_SECRET_KEY` directly (less secure) or use Secrets Manager for better security.



Troubleshooting
- If you get `Missing Authentication Token`, check that the path and method exactly match a deployed stage resource and you called the correct stage name.
- Check CloudWatch Logs for Lambda errors and API Gateway logs (enable CloudWatch logs on the stage if debugging requests).
