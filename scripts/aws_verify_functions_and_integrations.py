#!/usr/bin/env python3
"""
Verify Lambda ownership and API Gateway integrations.

Usage:
  python scripts/aws_verify_functions_and_integrations.py --functions-file candidates.txt --region us-east-1

Requires AWS credentials (env or shared config) and `boto3` installed.

Output: writes `inventory/function_integration_report.md` with findings.
"""
import argparse
import os
import sys
import boto3
from botocore.exceptions import ClientError


def paginate_get(fn, *args, **kwargs):
    """Generic paginator for boto3 calls that return items under common keys."""
    resp = fn(*args, **kwargs)
    for key in ('items', 'restApis', 'items'):
        if key in resp:
            for it in resp[key]:
                yield it
    # follow 'position' pagination for API Gateway
    while resp.get('position'):
        kwargs['position'] = resp['position']
        resp = fn(*args, **kwargs)
        for key in ('items', 'restApis', 'items'):
            if key in resp:
                for it in resp[key]:
                    yield it


def list_rest_apis(apigw):
    apis = []
    try:
        for api in paginate_get(apigw.get_rest_apis):
            apis.append(api)
    except ClientError as e:
        print('Error listing REST APIs:', e, file=sys.stderr)
    return apis


def get_api_integrations(apigw, rest_api_id):
    integrations = []
    try:
        resp = apigw.get_resources(restApiId=rest_api_id, limit=500)
        resources = resp.get('items', [])
        for res in resources:
            resource_id = res['id']
            methods = res.get('resourceMethods') or {}
            for m in methods.keys():
                try:
                    integ = apigw.get_integration(restApiId=rest_api_id, resourceId=resource_id, httpMethod=m)
                    uri = integ.get('uri')
                    if uri:
                        integrations.append({'resourceId': resource_id, 'httpMethod': m, 'uri': uri})
                except ClientError:
                    continue
    except ClientError as e:
        print('Error getting resources for API', rest_api_id, e, file=sys.stderr)
    return integrations


def inspect_function(lambda_client, apigw, function_name, region):
    item = {'FunctionName': function_name, 'Found': False, 'Arn': None, 'Tags': {}, 'OwnedBy': None, 'APIGatewayIntegrations': []}
    try:
        resp = lambda_client.get_function(FunctionName=function_name)
        cfg = resp.get('Configuration', {})
        func_arn = cfg.get('FunctionArn')
        item['Found'] = True
        item['Arn'] = func_arn
        # tags
        try:
            tags = lambda_client.list_tags(Resource=func_arn).get('Tags', {})
            item['Tags'] = tags
            # ownership detection
            for k in ('aws:cloudformation:stack-name', 'aws:cloudformation:stack-id', 'amplify:appId'):
                if k in tags:
                    item['OwnedBy'] = tags[k]
                    break
        except ClientError:
            pass

        # check API Gateway integrations
        apis = list_rest_apis(apigw)
        for api in apis:
            api_id = api.get('id')
            api_name = api.get('name')
            integrs = get_api_integrations(apigw, api_id)
            for integ in integrs:
                uri = integ.get('uri','')
                if func_arn and func_arn in uri:
                    item['APIGatewayIntegrations'].append({'ApiId': api_id, 'ApiName': api_name, 'ResourceId': integ['resourceId'], 'HttpMethod': integ['httpMethod'], 'Uri': uri})
    except ClientError as e:
        # function not found or access denied
        item['Error'] = str(e)
    return item


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--functions-file', '-f', help='File with one Lambda function name per line', required=True)
    p.add_argument('--region', '-r', help='AWS region', default='us-east-1')
    args = p.parse_args()

    region = args.region
    if not os.path.exists(args.functions_file):
        print('functions file not found:', args.functions_file, file=sys.stderr)
        sys.exit(2)

    with open(args.functions_file, 'r', encoding='utf-8') as fh:
        fnames = [l.strip() for l in fh if l.strip() and not l.strip().startswith('#')]

    session = boto3.Session(region_name=region)
    lambda_client = session.client('lambda')
    apigw = session.client('apigateway')

    out_lines = []
    out_lines.append('# Lambda verification report\n')
    out_lines.append('Region: {}\n'.format(region))

    for fn in fnames:
        print('Inspecting', fn)
        info = inspect_function(lambda_client, apigw, fn, region)
        out_lines.append('## {}\n'.format(fn))
        if not info.get('Found'):
            out_lines.append('- Status: NOT FOUND or access denied\n')
            out_lines.append('- Error: {}\n'.format(info.get('Error', '')))
            continue
        out_lines.append('- ARN: {}\n'.format(info.get('Arn')))
        tags = info.get('Tags') or {}
        if tags:
            out_lines.append('- Tags:\n')
            for k, v in tags.items():
                out_lines.append('  - {}: {}\n'.format(k, v))
        else:
            out_lines.append('- Tags: none\n')
        owned = info.get('OwnedBy') or 'unknown'
        out_lines.append('- OwnedBy: {}\n'.format(owned))

        ints = info.get('APIGatewayIntegrations') or []
        if ints:
            out_lines.append('- Integrated by APIs:\n')
            for it in ints:
                out_lines.append('  - {} ({}): {} {}\n'.format(it['ApiName'], it['ApiId'], it['HttpMethod'], it['Uri']))
        else:
            out_lines.append('- Integrated by APIs: none found\n')

        out_lines.append('\n')

    os.makedirs('inventory', exist_ok=True)
    report_path = os.path.join('inventory', 'function_integration_report.md')
    with open(report_path, 'w', encoding='utf-8') as out:
        out.writelines(out_lines)

    print('\nReport written to', report_path)


if __name__ == '__main__':
    main()
