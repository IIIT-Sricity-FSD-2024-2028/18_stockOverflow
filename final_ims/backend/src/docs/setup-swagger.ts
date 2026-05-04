import { INestApplication, Logger } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const logger = new Logger('Swagger');

function resolveSwaggerDocumentPath() {
  const candidates = [
    join(process.cwd(), 'docs', 'swagger.json'),
    join(__dirname, '..', '..', 'docs', 'swagger.json'),
  ];

  return candidates.find((candidate) => existsSync(candidate));
}

export function setupSwagger(app: INestApplication) {
  const documentPath = resolveSwaggerDocumentPath();
  if (!documentPath) {
    logger.warn('Swagger document not found. Run `npm run swagger:generate`.');
    return;
  }

  const document = JSON.parse(readFileSync(documentPath, 'utf-8'));
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
    customSiteTitle: 'Stock Overflow API Docs',
    jsonDocumentUrl: 'docs/json',
    swaggerOptions: {
      displayRequestDuration: true,
      docExpansion: 'list',
      persistAuthorization: true,
    },
  });
}
