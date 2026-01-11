#!/bin/bash

echo "Starting batch cleanup of remaining AWS resources..."

# Delete CloudFormation stacks (this will delete the Lambda functions and API Gateways)
echo "Deleting CloudFormation stacks..."
aws cloudformation delete-stack --stack-name sam-app2 --region us-east-1 || echo "Failed to delete stack sam-app2"
aws cloudformation delete-stack --stack-name visitjo-restored-stack --region us-east-1 || echo "Failed to delete stack visitjo-restored-stack"
aws cloudformation delete-stack --stack-name VisitJo --region us-east-1 || echo "Failed to delete stack VisitJo"
aws cloudformation delete-stack --stack-name visitjo-chat --region us-east-1 || echo "Failed to delete stack visitjo-chat"

echo "CloudFormation stacks deletion initiated."

# Wait for stacks to be deleted (optional - you can check status in AWS console)
echo "Waiting for stack deletions to complete..."
aws cloudformation wait stack-delete-complete --stack-name sam-app2 --region us-east-1 || echo "sam-app2 stack deletion may still be in progress"
aws cloudformation wait stack-delete-complete --stack-name visitjo-restored-stack --region us-east-1 || echo "visitjo-restored-stack stack deletion may still be in progress"
aws cloudformation wait stack-delete-complete --stack-name VisitJo --region us-east-1 || echo "VisitJo stack deletion may still be in progress"
aws cloudformation wait stack-delete-complete --stack-name visitjo-chat --region us-east-1 || echo "visitjo-chat stack deletion may still be in progress"

echo "Batch cleanup script completed. Check AWS console to verify deletions."
