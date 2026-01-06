#!/usr/bin/env bash
set -euo pipefail

# Usage: ./lambda/deploy-and-seed.sh
# Requirements: AWS SAM CLI, Node.js, AWS CLI configured (aws configure)

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "Root: $ROOT_DIR"
cd "$ROOT_DIR"

echo "1) Building SAM..."
sam build --template-file lambda/sam-template.yaml

echo "2) Deploying SAM (interactive guided deploy will run)..."
sam deploy --guided --template-file .aws-sam/build/template.yaml

echo "3) Run seed script to populate DynamoDB (requires AWS creds / network access)..."
node lambda/seed/seed.js

echo "Done. Check SAM outputs for ApiUrl and update frontend .env.local -> VITE_API_GATEWAY_URL"
