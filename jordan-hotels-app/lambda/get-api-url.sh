#!/usr/bin/env bash
set -euo pipefail

# Usage: STACK=VISIT-JO-backend REGION=us-east-1 ./get-api-url.sh
STACK=${STACK:-VISIT-JO-backend}
REGION=${REGION:-us-east-1}

echo "Fetching API URL from CloudFormation stack '$STACK' in region $REGION..."
URL=$(aws cloudformation describe-stacks --stack-name "$STACK" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text)

if [ -z "$URL" ] || [ "$URL" = "None" ]; then
  echo "ApiUrl output not found in stack $STACK. Check CloudFormation outputs or provide correct stack name."
  exit 2
fi

echo "VITE_API_GATEWAY_URL=$URL" > .env.local
echo ".env.local created with VITE_API_GATEWAY_URL=$URL"
