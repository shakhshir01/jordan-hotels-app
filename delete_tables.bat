@echo off
echo Deleting remaining DynamoDB tables...

REM Delete VisitJo tables
aws dynamodb delete-table --table-name VisitJo-BookingsTable-1VMOD1M9XLGW9 --region us-east-1
aws dynamodb delete-table --table-name VisitJo-BookingsTable-6Z9WSBEB8FKK --region us-east-1
aws dynamodb delete-table --table-name VisitJo-DealsTable-11GR7H9E97U7CZ --region us-east-1
aws dynamodb delete-table --table-name VisitJo-DealsTable-GGW2KOX7FPZT --region us-east-1
aws dynamodb delete-table --table-name VisitJo-DestinationsTable-CBLGVEDD0ZLA --region us-east-1
aws dynamodb delete-table --table-name VisitJo-DestinationsTable-DZ06J0RZYXIW --region us-east-1
aws dynamodb delete-table --table-name VisitJo-ExperiencesTable-1FCCCJHJXLD51 --region us-east-1
aws dynamodb delete-table --table-name VisitJo-ExperiencesTable-WXRREJ7PODDU0 --region us-east-1
aws dynamodb delete-table --table-name VisitJo-HotelsTable-1NX63EB7E7JD5 --region us-east-1
aws dynamodb delete-table --table-name VisitJo-HotelsTable-BHPRCU1G0DSM --region us-east-1
aws dynamodb delete-table --table-name VisitJo-UsersTable-1FV64NSZ6OXTH --region us-east-1
aws dynamodb delete-table --table-name VisitJo-UsersTable-SF6BZDPQZPSY --region us-east-1

echo DynamoDB table deletions initiated.
