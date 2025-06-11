import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Enable global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('UniCal API')
    .setDescription('Unified Calendar Portal API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3030',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 UniCal Backend running on port ${port}`);
  console.log(
    `📚 API Documentation available at http://localhost:${port}/api-docs`,
  );
}

void bootstrap();
