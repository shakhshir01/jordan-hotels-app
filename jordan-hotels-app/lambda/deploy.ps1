Set-Location $PSScriptRoot
sam deploy --template-file packaged.yaml --stack-name visitjo-backend-2 --capabilities CAPABILITY_NAMED_IAM