# getHotelById Lambda

This folder contains a minimal Lambda handler stub for the `/hotels/{id}` route.

Deployment (AWS CLI)

1. Zip the handler:

```bash
cd lambda/getHotelById
zip function.zip index.js
```

2. Create the function (replace `YourLambdaRole` with your Lambda execution role ARN):

```bash
aws lambda create-function --function-name getHotelById \
  --runtime nodejs18.x --role arn:aws:iam::497339097084:role/YourLambdaRole \
  --handler index.handler --zip-file fileb://function.zip --region us-east-1
```

3. (Optional) Update function code:

```bash
aws lambda update-function-code --function-name getHotelById --zip-file fileb://function.zip --region us-east-1
```

4. If API Gateway didn't auto-grant permission, add it manually (replace `{api-id}`):

```bash
aws lambda add-permission \
  --function-name getHotelById \
  --statement-id apigw-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:497339097084:{api-id}/*/GET/hotels/*"
```

Test the deployed API

After you've deployed the method and stage (for example the `stage` stage), call:

```bash
curl -i "https://z9u6p9basl.execute-api.us-east-1.amazonaws.com/Stage/hotels/123"
```

You should receive a JSON response with the demo hotel object. Replace `123` with any id to see the stubbed response.

Next steps

- Replace the stub with a real DB query (DynamoDB or RDS).
- Add Cognito authorizer to protected routes and validate tokens in the handler if required.
- Create other endpoints: `/hotels` (list), `/payments/create-checkout-session`, `/uploads/signed-url`.

AWS SAM deploy (optional)

You can deploy this Lambda + API quickly with the AWS SAM CLI. From the repository root:

```bash
# build the function
sam build --template-file lambda/sam-template.yaml

# guided deploy (first-time, follow prompts)
sam deploy --guided --template-file .aws-sam/build/template.yaml

# or deploy non-interactively (after guided deploy saved parameters):
sam deploy --template-file .aws-sam/build/template.yaml --stack-name visitjo-backend --capabilities CAPABILITY_IAM
```

Notes:
- Ensure `sam` is installed and configured with credentials for account `497339097084` and region `us-east-1`.
- `sam deploy --guided` will prompt for an S3 bucket to upload artifacts. Create an S3 bucket in the same region if needed.
- After deployment, your API URL will be visible in the SAM outputs or CloudFormation stack outputs.

