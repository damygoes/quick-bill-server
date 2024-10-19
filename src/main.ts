import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties that do not have decorators in the DTO
      forbidNonWhitelisted: true, // Rejects requests with non-whitelisted properties
      validateCustomDecorators: true, // Validates custom decorators
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  // Set the global prefix for all routes
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: 'http://localhost:5173', // Replace with your frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Quick Bill API')
    .setDescription('The Quick Bill API description')
    .setVersion('1.0')
    .addTag('Authentication')
    .addTag('Users')
    .addTag('Companies')
    .addTag('Customers')
    .addTag('Invoices')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
