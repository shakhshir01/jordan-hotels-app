Param()

Write-Host "Running deploy-and-seed.ps1" -ForegroundColor Cyan

# Ensure script runs from project root (jordan-hotels-app)
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location ..

Write-Host "1) Building SAM..." -ForegroundColor Green
sam build --template-file lambda/sam-template.yaml

Write-Host "2) Deploying SAM (interactive guided deploy will run)..." -ForegroundColor Green
sam deploy --guided --template-file .aws-sam/build/template.yaml

Write-Host "3) Run seed script to populate DynamoDB..." -ForegroundColor Green
node lambda/seed/seed.js

Write-Host "Done. Copy ApiUrl output and set VITE_API_GATEWAY_URL in .env.local" -ForegroundColor Cyan
