#!/usr/bin/env node

/**
 * Script to create API Gateway methods and integrate them with Lambda functions
 * Usage: node wire-lambdas.js <API_ID> <REGION>
 * Example: node wire-lambdas.js ny5ohksmc3 us-east-1
 */

import {
  APIGatewayClient,
  GetResourcesCommand,
  PutMethodCommand,
  PutIntegrationCommand,
  PutMethodResponseCommand,
  PutIntegrationResponseCommand,
} from "@aws-sdk/client-api-gateway";

const apiId = process.argv[2];
const region = process.argv[3] || 'us-east-1';
const rawAccountId = process.argv[4];
const accountId = rawAccountId ? rawAccountId.replace(/[^0-9]/g, '') : null;

if (!apiId || !accountId) {
  console.error('❌ Error: API ID and AWS Account ID are required.');
  console.error('Usage: node wire-lambdas.js <API_ID> <REGION> <ACCOUNT_ID>');
  console.error('Example: node wire-lambdas.js ny5ohksmc3 us-east-1 123456789012');
  process.exit(1);
}

const client = new APIGatewayClient({ region });
console.log(`Configured for API: ${apiId}, Region: ${region}, Account: ${accountId}`);

// Map of resource paths to Lambda integrations
const INTEGRATIONS = [
  // Hotels
  { path: '/hotels', method: 'GET', lambda: 'getHotels' },
  { path: '/hotels/{id}', method: 'GET', lambda: 'getHotelById' },
  { path: '/hotels/{id}/images', method: 'POST', lambda: 'getHotels' },
  
  // Bookings
  { path: '/bookings', method: 'POST', lambda: 'bookings' },
  { path: '/bookings', method: 'DELETE', lambda: 'bookings' },
  { path: '/user/bookings', method: 'GET', lambda: 'bookings', auth: 'COGNITO_USER_POOLS' },
  
  // Search
  { path: '/search', method: 'GET', lambda: 'search' },
  
  // Destinations
  { path: '/destinations', method: 'GET', lambda: 'destinations' },
  { path: '/destinations/{id}', method: 'GET', lambda: 'destinations' },
  
  // Deals
  { path: '/deals', method: 'GET', lambda: 'deals' },
  { path: '/deals/{id}', method: 'GET', lambda: 'deals' },
  
  // Experiences
  { path: '/experiences', method: 'GET', lambda: 'experiences' },
  { path: '/experiences/{id}', method: 'GET', lambda: 'experiences' },
  { path: '/experiences/{id}/images', method: 'POST', lambda: 'experiences' },
  
  // Payments
  { path: '/payments/create-checkout-session', method: 'POST', lambda: 'createCheckoutSession' },
  
  // Uploads
  { path: '/uploads/signed-url', method: 'POST', lambda: 'getSignedUrl' },
  
  // User (NEW) - with Cognito authorizer
  { path: '/user/profile', method: 'GET', lambda: 'user', auth: 'COGNITO_USER_POOLS' },
  { path: '/user/profile', method: 'PUT', lambda: 'user', auth: 'COGNITO_USER_POOLS' },
  { path: '/user/mfa/email/setup', method: 'POST', lambda: 'user', auth: 'COGNITO_USER_POOLS' },
  { path: '/user/mfa/email/verify', method: 'POST', lambda: 'user', auth: 'COGNITO_USER_POOLS' },
  { path: '/user/mfa/disable', method: 'POST', lambda: 'user', auth: 'COGNITO_USER_POOLS' },
  { path: '/auth/email-mfa/request', method: 'POST', lambda: 'user', auth: 'COGNITO_USER_POOLS' },
  
  // Blog (NEW)
  { path: '/blog', method: 'GET', lambda: 'blog' },
  { path: '/blog/{slug}', method: 'GET', lambda: 'blog' }];

async function main() {
  try {
    console.log(`\n📡 Fetching resources from API Gateway (${apiId})...`);
    
    // Get all resources
    const resources = await client.send(new GetResourcesCommand({ restApiId: apiId }));
    const resourceMap = {};
    
    resources.items.forEach(item => {
      resourceMap[item.path] = item.id;
    });

    console.log(`✅ Found ${resources.items.length} resources\n`);

    let created = 0;
    let skipped = 0;

    for (const integration of INTEGRATIONS) {
      const resourceId = resourceMap[integration.path];
      
      if (!resourceId) {
        console.log(`⚠️  SKIP: Resource ${integration.path} not found`);
        skipped++;
        continue;
      }

      console.log(`🔗 Wiring ${integration.method} ${integration.path} → ${integration.lambda}...`);

      try {
        // Create method
        await client.send(new PutMethodCommand({
          restApiId: apiId,
          resourceId: resourceId,
          httpMethod: integration.method,
          authorizationType: integration.auth || 'NONE',
          requestParameters: {}
        }));

        // Create integration with Lambda
        const lambdaUri = `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${region}:${accountId}:function:${integration.lambda}/invocations`;
        
        await client.send(new PutIntegrationCommand({
          restApiId: apiId,
          resourceId: resourceId,
          httpMethod: integration.method,
          type: 'AWS_PROXY',
          integrationHttpMethod: 'POST',
          uri: lambdaUri
        }));

        console.log(`   ✅ Created ${integration.method} method for ${integration.path}`);
        created++;
      } catch (error) {
        if (error.name === 'ConflictException') {
          console.log(`   ℹ️  Method already exists for ${integration.path}`);
          skipped++;
        } else {
          console.error(`   ❌ Error: ${error.message}`);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ℹ️  Skipped/Existing: ${skipped}`);
    console.log(`\n⚠️  IMPORTANT:`);
    console.log(`   1. Ensure API Gateway has permission to invoke your Lambda functions.`);
    console.log(`   2. Deploy the API after running this script: aws apigateway create-deployment --rest-api-id ${apiId} --stage-name prod`);
    console.log(`\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
