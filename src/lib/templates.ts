import type { GraphResponse } from '@/types/diagram';

export const TEMPLATES: Record<string, { label: string, description: string, graph: GraphResponse }> = {
  'aws-serverless': {
    label: 'AWS Serverless API',
    description: 'API Gateway to Lambda to DynamoDB',
    graph: { direction: 'LR', nodes: [ { id: 'user', label: 'Client', shape: 'ellipse' }, { id: 'api', label: 'API Gateway', shape: 'rectangle', icon: 'amazonapigateway', color: 'purple' }, { id: 'lambda', label: 'Auth Lambda', shape: 'rectangle', icon: 'awslambda', color: 'orange' }, { id: 'db', label: 'DynamoDB', shape: 'rectangle', icon: 'amazondynamodb', color: 'teal' } ], edges: [ { from: 'user', to: 'api', label: 'HTTPS' }, { from: 'api', to: 'lambda', label: 'Invoke' }, { from: 'lambda', to: 'db', label: 'Query' } ], groups: [] }
  },
  'nextjs-postgres': {
    label: 'Next.js + Postgres',
    description: 'Fullstack Next.js app with Prisma and PostgreSQL',
    graph: { direction: 'TB', nodes: [ { id: 'browser', label: 'Browser', shape: 'ellipse' }, { id: 'next', label: 'Next.js App', shape: 'rectangle', icon: 'nextdotjs', color: 'blue' }, { id: 'prisma', label: 'Prisma ORM', shape: 'rectangle', icon: 'prisma', color: 'grey' }, { id: 'pg', label: 'PostgreSQL', shape: 'rectangle', icon: 'postgresql', color: 'teal' } ], edges: [ { from: 'browser', to: 'next', label: 'HTTP' }, { from: 'next', to: 'prisma' }, { from: 'prisma', to: 'pg', label: 'TCP/SQL' } ], groups: [ { id: 'backend', label: 'Backend Server', color: 'grey', nodes: ['next', 'prisma'] } ] }
  }
};
