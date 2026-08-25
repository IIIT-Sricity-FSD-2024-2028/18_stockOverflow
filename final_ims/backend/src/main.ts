import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { AppModule } from './app.module';
import { setupSwagger } from './docs/setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const uploadsDir = path.join(process.cwd(), 'uploads');
  const productUploadsDir = path.join(uploadsDir, 'products');
  if (!fs.existsSync(productUploadsDir)) {
    fs.mkdirSync(productUploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  app.use(json({ limit: '25mb' }));
  app.use(urlencoded({ extended: true, limit: '25mb' }));
  app.enableCors({
    origin: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();

