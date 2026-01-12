Set-Location $PSScriptRoot
sam deploy --template-file template.yaml --no-confirm-changeset --no-fail-on-empty-changeset
