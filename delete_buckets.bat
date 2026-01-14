@echo off
echo Deleting S3 buckets...

REM Empty and delete buckets
aws s3 rm s3://amman-events-media --recursive --region us-east-1
aws s3 rb s3://amman-events-media --region us-east-1

aws s3 rm s3://amplify-jordanhotelsapp-dev-7bb8d-deployment --recursive --region us-east-1
aws s3 rb s3://amplify-jordanhotelsapp-dev-7bb8d-deployment --region us-east-1

aws s3 rm s3://aws-sam-cli-managed-default-samclisourcebucket-xexzfzmdc929 --recursive --region us-east-1
aws s3 rb s3://aws-sam-cli-managed-default-samclisourcebucket-xexzfzmdc929 --region us-east-1

aws s3 rm s3://visitjo-logsbucket-rrmpq9lzsr0m --recursive --region us-east-1
aws s3 rb s3://visitjo-logsbucket-rrmpq9lzsr0m --region us-east-1

aws s3 rm s3://visitjo-logsbucket-vpdy5vbcszda --recursive --region us-east-1
aws s3 rb s3://visitjo-logsbucket-vpdy5vbcszda --region us-east-1

aws s3 rm s3://visitjo-uploadsbucket-imj9bohofes5 --recursive --region us-east-1
aws s3 rb s3://visitjo-uploadsbucket-imj9bohofes5 --region us-east-1

aws s3 rm s3://visitjo-uploadsbucket-ozix8odrmfkr --recursive --region us-east-1
aws s3 rb s3://visitjo-uploadsbucket-ozix8odrmfkr --region us-east-1

echo S3 bucket deletions completed.
