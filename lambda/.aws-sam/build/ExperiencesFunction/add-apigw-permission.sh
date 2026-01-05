#!/usr/bin/env bash
set -euo pipefail

if [ -z "${API_ID:-}" ] || [ -z "${LAMBDA_NAME:-}" ]; then
  echo "Usage: API_ID=yourApiId LAMBDA_NAME=getHotelById REGION=us-east-1 ./add-apigw-permission.sh"
  exit 2
fi

REGION=${REGION:-us-east-1}

echo "Adding permission for API Gateway (api=${API_ID}) to invoke Lambda ${LAMBDA_NAME}"

aws lambda add-permission \
  --function-name "${LAMBDA_NAME}" \
  --statement-id apigw-invoke-${API_ID} \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:497339097084:${API_ID}/*/*/*" \
  --region "${REGION}"

echo "Permission added (or already existed)."
