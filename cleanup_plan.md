# AWS Cleanup Plan for VisitJo Project

## Current Active Resources (KEEP)
Based on runtime-config.js, the active API is: https://4yj6ft3108.execute-api.us-east-1.amazonaws.com/prod (sam-app2)

### Keep:
- **API Gateway**: 4yj6ft3108 (sam-app2)
- **Lambdas**: All sam-app2-* functions
- **DynamoDB**: All sam-app2-* tables
- **S3**: sam-app2-* buckets

## Resources to Delete

### API Gateway (4 APIs to delete):
- mo0p36q532 (Imported on 2026-01-10T22:55:11.370Z)
- v6mxktvvkb (Imported on 2026-01-09T16:50:00.567Z)
- vo2t0vj6tf (Imported on 2026-01-09T16:41:26.518Z)
- t5cfl89x5m (visitjo-restored-stack)

### Lambda Functions (35 functions to delete):
- VisitJo-DestinationsFunction-C59z3SNJBcPI
- visitjo-user-UserFunction-8fQOXs6usBuQ
- VisitJo-ChatFunction-xC6aV8zJKS31
- VisitJo-GetHotelByIdFunction-stHsGhEfSneu
- VisitJo-CreatePaymentIntentFunction-k07N1tY9mBdx
- sam-app2-GetHotelByIdFunction-VtJMHEIYqtbL
- VisitJo-CreateCheckoutSessionFunction-PiV24lLjxPb6
- visitjo-restored-stack-SearchFunction-cluXMViRDEeH
- sam-app2-BookingsFunction-YOGxfeO4krhW
- sam-app2-SendBookingEmailFunction-9xY6tr5JL6b9
- visitjo-restored-stack-UserFunction-zGNxKrVFR2IN
- sam-app2-UserFunction-Ae9QT73UUHav
- VisitJo-GetSignedUrlFunction-T8VWxWFC8x8V
- VisitJo-UserFunction-5wjh4mvl8MdH
- visitjo-restored-stack-DestinationsFunction-fFd4QZEjlPDJ
- sam-app2-ExperiencesFunction-T4cVTyncwuWx
- visitjo-restored-stack-GetHotelByIdFunction-fy4G6AstTZmz
- visitjo-restored-stack-BookingsFunction-TntN4mUyGG5Z
- VisitJo-BookingsFunction-EStG059HLb4C
- visitjo-restored-stack-DealsFunction-lCcG3319rof6
- visitjo-restored-stack-CreatePaymentIntentFunction-8Mgr8QtH9P8l
- sam-app2-SearchFunction-iYvPBnKDlF9o
- visitjo-restored-stack-CreateCheckoutSessionFuncti-gZRLCsLvfGEE
- sam-app2-CreateCheckoutSessionFunction-FQnsm85dTNke
- visitjo-restored-stack-GetSignedUrlFunction-oJNVvhSDp9Jt
- sam-app2-DestinationsFunction-WEsiNN4J7SPe
- VisitJo-SendBookingEmailFunction-sQqvhmdCjUjF
- visitjo-restored-stack-ExperiencesFunction-U8AqCBDOGgyq
- sam-app2-DealsFunction-g3Dxt30K2cHI
- VisitJo-SearchFunction-YqSdyyEl5k4y
- visitjo-chat-ChatFunction-iPCZM9yl7ECw
- sam-app2-GetSignedUrlFunction-seqp6OWNExUU
- VisitJo-ExperiencesFunction-BMn9XgNGUtm2
- visitjo-restored-stack-GetHotelsFunction-woUimeCgh2wT
- visitjo-restored-stack-ChatFunction-ekcPhiNRz5ek
- VisitJo-DealsFunction-P6s6B8kliTLK
- sam-app2-GetHotelsFunction-wh8CelMTMl8n

### DynamoDB Tables (48 tables to delete):
- Visit-Jo-BookingsTable-NKGKRDKCMGEV
- Visit-Jo-DealsTable-4IINTA8ZYP15
- Visit-Jo-DestinationsTable-RQ8W4VPLTJEP
- Visit-Jo-ExperiencesTable-1QQFJCDYC7718
- Visit-Jo-HotelsTable-1HVQ39CM986GN
- Visit-Jo-UsersTable-AJMEG1USM8KS
- VisitJo-DealsTable-1UHXIWNZUG9TC
- VisitJo-DestinationsTable-1AOCNJKCTCQLJ
- VisitJo-ExperiencesTable-1J93JHVQ2W5R4
- visit-jo-stack-BookingsTable-1XRCB6T7HOKC2
- visit-jo-stack-DealsTable-1UM61ITIH0U8P
- visit-jo-stack-DestinationsTable-1TUAXI1SJ81WR
- visit-jo-stack-ExperiencesTable-GZ3JJBF5A1PQ
- visit-jo-stack-HotelsTable-3HWWOT7SGWTO
- visit-jo-stack-UsersTable-EHLDJF5BURKD
- visitjo-BookingsTable-1EFYV5C8S1NFK
- visitjo-DealsTable-HOOVBG8W6LQB
- visitjo-DestinationsTable-1S1T3QNA4ZHN0
- visitjo-ExperiencesTable-1C4JOQE1ZDL0G
- visitjo-HotelsTable-UQHEO1RZBPN3
- visitjo-UsersTable-1SAPJNJWQLJK3
- visitjo-restored-stack-BookingsTable-16NIBAWZ3E5C6
- visitjo-restored-stack-BookingsTable-1UEP0OR6QAUV
- visitjo-restored-stack-DealsTable-AAT20H3QQMEL
- visitjo-restored-stack-DealsTable-RCHS8VO1YW7E
- visitjo-restored-stack-DestinationsTable-1EPH12DXV0063
- visitjo-restored-stack-DestinationsTable-1J6TV1Y7Y3YUK
- visitjo-restored-stack-ExperiencesTable-14LO9SZFAEGGQ
- visitjo-restored-stack-ExperiencesTable-E8QDQDQG0RFS
- visitjo-restored-stack-HotelsTable-14NXLUGEPWJ5M
- visitjo-restored-stack-HotelsTable-5PXDGN592IBH
- visitjo-restored-stack-UsersTable-15AAN525QUA77
- visitjo-restored-stack-UsersTable-1PGDMBH1ANTYO
- visitjo-v2-BookingsTable-1D40LRJY9ZR4M
- visitjo-v2-BookingsTable-BNEKD8FW3YWS
- visitjo-v2-DealsTable-1JJ0ORJKRWDDS
- visitjo-v2-DealsTable-X18SK7VI9Q0J
- visitjo-v2-DestinationsTable-INUCJQ6ZK5IX
- visitjo-v2-DestinationsTable-TV4L3G5J555G
- visitjo-v2-ExperiencesTable-1W0HFHTO0RK8P
- visitjo-v2-ExperiencesTable-YDXB6VWXTY2D
- visitjo-v2-HotelsTable-1CP4FVVM6KSRS
- visitjo-v2-HotelsTable-8FL5I455OR5T
- visitjo-v2-UsersTable-1A3Z84GAYMOFM
- visitjo-v2-UsersTable-VE950KT5PPHO

### S3 Buckets (22 buckets to delete):
- amman-events-media
- amplify-jordanhotelsapp-dev-7bb8d-deployment
- aws-sam-cli-managed-default-samclisourcebucket-xexzfzmdc929
- jordan-hotels-logsbucket-iswfucv3p5um
- jordan-hotels-uploadsbucket-xqpieajvamme
- visit-jo-logsbucket-7vcbazq6xcau
- visit-jo-stack-logsbucket-tu0knb7rajba
- visit-jo-stack-uploadsbucket-2ll22jqcpi7p
- visit-jo-uploadsbucket-am12xdtakwib
- visitjo-backend-uploads-us-east-1
- visitjo-logsbucket-ahopfh93at3g
- visitjo-logsbucket-iqxna7bqsg5o
- visitjo-restored-stack-logsbucket-jxsqq91cyqoz
- visitjo-restored-stack-logsbucket-tf4bh2ktaaws
- visitjo-restored-stack-uploadsbucket-cxsk9bbj34vs
- visitjo-restored-stack-uploadsbucket-uf5rkadcjhws
- visitjo-sam-artifacts-20260109-001
- visitjo-uploadsbucket-4jldwlg1viol
- visitjo-uploadsbucket-hdcjrnpg1g3w
- visitjo-v2-logsbucket-92pbjg3hokfh
- visitjo-v2-logsbucket-pktw92nvvlya
- visitjo-v2-uploadsbucket-5qmlpuonochy
- visitjo-v2-uploadsbucket-kgqldxpxke8q

## Execution Order
1. Backup any DynamoDB tables with data (if needed)
2. Delete Lambda functions
3. Delete API Gateway APIs
4. Delete DynamoDB tables
5. Delete S3 buckets
6. Verify active resources still work
