@echo off
cd /d %~dp0
sam deploy --template-file sam-template.yaml --no-confirm-changeset --no-fail-on-empty-changeset
