#!/usr/bin/env bash
set -euo pipefail

STACK_NAME=${STACK_NAME:-VISIT-JO-backend}
S3_BUCKET=${S3_BUCKET:-}
REGION=${REGION:-us-east-1}

if ! command -v sam >/dev/null 2>&1; then
  echo "AWS SAM CLI not found. Install from https://aws.amazon.com/serverless/sam/"
  exit 2
fi

pushd lambda
sam build --template-file sam-template.yaml
if [ -z "$S3_BUCKET" ]; then
  echo "Running interactive deploy (you will be prompted)"
  sam deploy --guided --template-file .aws-sam/build/template.yaml
else
  sam deploy --template-file .aws-sam/build/template.yaml --stack-name "$STACK_NAME" --s3-bucket "$S3_BUCKET" --capabilities CAPABILITY_IAM --region "$REGION"
fi
popd

echo "SAM deploy finished. Check CloudFormation outputs or the SAM CLI output for the API URL."
