#!/bin/bash

# Wire Lambda Functions to API Gateway Methods
# Usage: ./wire-lambdas.sh -a "ny5ohksmc3" -r "us-east-1" -p "default"

API_ID=""
REGION="us-east-1"
AWS_PROFILE="default"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -a|--api-id) API_ID="$2"; shift 2;;
    -r|--region) REGION="$2"; shift 2;;
    -p|--profile) AWS_PROFILE="$2"; shift 2;;
    *) echo "Unknown option: $1"; exit 1;;
  esac
done

if [ -z "$API_ID" ]; then
  echo "❌ Error: API ID is required"
  echo "Usage: ./wire-lambdas.sh -a <API_ID> -r <REGION> -p <AWS_PROFILE>"
  echo "Example: ./wire-lambdas.sh -a ny5ohksmc3 -r us-east-1"
  exit 1
fi

echo ""
echo "📡 API Gateway Lambda Wiring Script"
echo "===================================="
echo ""

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text --profile $AWS_PROFILE 2>/dev/null)

if [ -z "$ACCOUNT_ID" ]; then
  echo "❌ Error: Could not get AWS Account ID. Check your AWS credentials."
  exit 1
fi

echo "✅ AWS Account ID: $ACCOUNT_ID"
echo ""

# Define all integrations as arrays
declare -a PATHS=("/hotels" "/hotels/{id}" "/hotels/{id}/book" "/search" "/destinations" "/destinations/{id}" "/deals" "/deals/{id}" "/experiences" "/experiences/{id}" "/payments/create-checkout-session" "/uploads/signed-url" "/user/profile" "/user/bookings" "/blog" "/blog/{slug}")
declare -a METHODS=("GET" "GET" "POST" "GET" "GET" "GET" "GET" "GET" "GET" "GET" "POST" "POST" "GET" "GET" "GET" "GET")
declare -a LAMBDAS=("getHotels" "getHotelById" "bookings" "search" "destinations" "destinations" "deals" "deals" "experiences" "experiences" "createCheckoutSession" "getSignedUrl" "user" "user" "blog" "blog")

echo "📋 Wiring Lambda functions to API Gateway methods..."
echo ""

CREATED=0
SKIPPED=0
ERRORS=0

# Loop through all integrations
for i in "${!PATHS[@]}"; do
  PATH="${PATHS[$i]}"
  METHOD="${METHODS[$i]}"
  LAMBDA="${LAMBDAS[$i]}"
  
  echo -n "🔗 $METHOD $PATH → $LAMBDA ... "

  # Get resource ID for path
  RESOURCE_ID=$(aws apigateway get-resources \
    --rest-api-id "$API_ID" \
    --query "items[?path=='$PATH'].id" \
    --output text \
    --region "$REGION" \
    --profile "$AWS_PROFILE" 2>/dev/null)

  if [ -z "$RESOURCE_ID" ]; then
    echo "⚠️  Resource not found"
    SKIPPED=$((SKIPPED + 1))
    continue
  fi

  # Create method
  aws apigateway put-method \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method "$METHOD" \
    --authorization-type NONE \
    --region "$REGION" \
    --profile "$AWS_PROFILE" \
    >/dev/null 2>&1

  # Create Lambda integration
  LAMBDA_URI="arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${LAMBDA}/invocations"
  
  if aws apigateway put-integration \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method "$METHOD" \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "$LAMBDA_URI" \
    --region "$REGION" \
    --profile "$AWS_PROFILE" \
    >/dev/null 2>&1; then
    echo "✅"
    CREATED=$((CREATED + 1))
  else
    echo "❌"
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""
echo "📊 Summary:"
echo "   ✅ Created: $CREATED"
echo "   ⚠️  Skipped: $SKIPPED"
echo "   ❌ Errors: $ERRORS"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo "✅ Now granting Lambda permissions..."
  echo ""
  
  for LAMBDA in getHotels getHotelById bookings search destinations deals experiences createCheckoutSession getSignedUrl user blog; do
    echo -n "   Granting permission for $LAMBDA ... "
    if aws lambda add-permission \
      --function-name "$LAMBDA" \
      --statement-id "allow-apigateway-$(date +%s)" \
      --action lambda:InvokeFunction \
      --principal apigateway.amazonaws.com \
      --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" \
      --region "$REGION" \
      --profile "$AWS_PROFILE" \
      >/dev/null 2>&1; then
      echo "✅"
    else
      echo "⚠️ (may already exist)"
    fi
  done
  
  echo ""
  echo "🚀 Deploying API..."
  
  if aws apigateway create-deployment \
    --rest-api-id "$API_ID" \
    --stage-name prod \
    --region "$REGION" \
    --profile "$AWS_PROFILE" \
    >/dev/null 2>&1; then
    echo "✅ API deployed to prod stage"
  else
    echo "⚠️  Deployment may have failed - check AWS Console"
  fi
  
  echo ""
  echo "🎉 Success! Your API is ready:"
  echo "   https://${API_ID}.execute-api.${REGION}.amazonaws.com/prod"
  echo ""
fi

echo ""
