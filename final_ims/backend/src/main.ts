import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { setupSwagger } from './docs/setup-swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
<<<<<<< Updated upstream

  const uploadsDir = path.join(process.cwd(), 'uploads');
  const productUploadsDir = path.join(uploadsDir, 'products');
  const supplierUploadsDir = path.join(uploadsDir, 'suppliers');
  [productUploadsDir, supplierUploadsDir].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  app.use('/uploads', express.static(uploadsDir));

=======
>>>>>>> Stashed changes
  app.use(json({ limit: '25mb' }));
  app.use(urlencoded({ extended: true, limit: '25mb' }));
  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3001);
  console.log('NestJS Backend Server listening on http://localhost:3001/api');
}
void bootstrap();
