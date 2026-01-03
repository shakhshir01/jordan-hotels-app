# Adding CORS (preflight OPTIONS) for API Gateway

This document shows two ways to ensure CORS preflight (OPTIONS) is handled for the `/hotels/{id}` resource.

1) Quick console steps (recommended when working with an existing API in the Console)

- Open the API in the API Gateway console.
- Under **Resources**, expand to `/hotels/{id}`.
- Click **Create Method** → choose `OPTIONS` → click the checkmark.
- For **Integration type** choose **Mock**.
- In the **Method Response**, add a 200 response. Add response header keys:
  - `Access-Control-Allow-Origin`
  - `Access-Control-Allow-Methods`
  - `Access-Control-Allow-Headers`
- In **Integration Response** for the 200 status, set mapping to return the CORS headers, e.g.:
  - `Access-Control-Allow-Origin` → `'"*"'`
  - `Access-Control-Allow-Methods` → `'"GET,POST,OPTIONS,PUT,DELETE"'`
  - `Access-Control-Allow-Headers` → `'"Authorization,Content-Type"'`
- Save and **Deploy API** to your stage.

After this, browser preflight requests will be answered by the mock integration and the actual GET/POST requests will be handled by your Lambda integrations.

2) CloudFormation snippet (for infrastructure-as-code)

If you manage your API via CloudFormation/SAM but still need an explicit OPTIONS method for a resource, you can add an `AWS::ApiGateway::Method` with a `Mock` integration. Example (replace `restApiId` and `resourceId` with actual values):

```yaml
OptionsMethod:
  Type: 'AWS::ApiGateway::Method'
  Properties:
    RestApiId: <your-rest-api-id>
    ResourceId: <resource-id-for-/hotels/{id}>
    HttpMethod: OPTIONS
    AuthorizationType: NONE
    Integration:
      Type: MOCK
      PassthroughBehavior: WHEN_NO_MATCH
      RequestTemplates:
        application/json: '{"statusCode": 200}'
      IntegrationResponses:
        - StatusCode: 200
          ResponseParameters:
            method.response.header.Access-Control-Allow-Origin: "'\'*\''"
            method.response.header.Access-Control-Allow-Methods: "'GET,POST,OPTIONS,PUT,DELETE'"
            method.response.header.Access-Control-Allow-Headers: "'Authorization,Content-Type'"
          ResponseTemplates:
            application/json: ''
    MethodResponses:
      - StatusCode: 200
        ResponseParameters:
          method.response.header.Access-Control-Allow-Origin: true
          method.response.header.Access-Control-Allow-Methods: true
          method.response.header.Access-Control-Allow-Headers: true
```

Note: finding the `ResourceId` for `/hotels/{id}` in CloudFormation can be done by creating the path with `AWS::ApiGateway::Resource` or by looking up the deployed API (API Gateway console or `aws apigateway get-resources --rest-api-id <id>`).

3) Quick test (curl preflight)

```bash
curl -i -X OPTIONS 'https://g7itqnbol9.execute-api.us-east-1.amazonaws.com/stage/hotels/123' \
  -H 'Origin: https://example.com' \
  -H 'Access-Control-Request-Method: GET' \
  -H 'Access-Control-Request-Headers: Authorization,Content-Type'
```

Expect a 200 response with the `Access-Control-Allow-*` headers present.

If you want, I can:
- (A) Add CloudFormation resources to the SAM template that create OPTIONS mock methods (I'll need to add resource creation and path refs), or
- (B) Walk you step-by-step in the Console and then verify the preflight using the `curl` command above.
