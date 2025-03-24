import type { AWS } from '@serverless/typescript';

const serverlessConfiguration: AWS = {
  service: 'scraper-service', 
  frameworkVersion: '3', 
  configValidationMode: 'error', 
  plugins: [
    'serverless-esbuild',
    'serverless-offline'
  ],
  provider: {
    name: 'aws', 
    runtime: 'nodejs18.x',
    architecture: 'x86_64', 
    region: 'us-east-1',
    memorySize: 1769, 
    timeout: 30,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:PutItem',
              'dynamodb:BatchWriteItem',
              'dynamodb:Scan'
            ],
            Resource: 'arn:aws:dynamodb:us-east-1:*:table/ProductsTable'
          }
        ]
      }
    }
  },
  functions: {
    scraper: {
      handler: 'src/functions/scraper/remoteHandler.handler',
      events: [
        {
          http: {
            method: 'POST',
            path: 'scraper'
          }
        }
      ]
    },
    getProducts: {
      handler: 'src/functions/getProducts/handler.handler',
      events: [
        {
          http: {
            method: 'get',
            path: 'products'
          }
        }
      ]
    }    
  },
  package: {
    individually: true,
    patterns: [
      '!node_modules/puppeteer/**', 
      'node_modules/aws-sdk/dist/aws-sdk/**',
      'node_modules/puppeteer-core/**', 
      'node_modules/@sparticuz/chromium/**', 
    ],
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: true,
      target: 'node18',
      sourcemap: true,
      exclude: [

      ],
      external: [
        'puppeteer-core',
        '@sparticuz/chromium'
      ]
    }
  },
  resources: {
    Resources: {
      ProductsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: 'ProductsTable',
          AttributeDefinitions: [
            { AttributeName: 'id', AttributeType: 'S' }
          ],
          KeySchema: [
            { AttributeName: 'id', KeyType: 'HASH' }
          ],
          BillingMode: 'PAY_PER_REQUEST'
        }
      }
    }
  }
};

module.exports = serverlessConfiguration;