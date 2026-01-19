@echo off
cd /d %~dp0
aws cloudformation deploy --template-file packaged.yaml --stack-name VISIT-JO-backend-2 --capabilities CAPABILITY_NAMED_IAM --region us-east-1

