import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS configuration
  const corsOrigins = configService.get('app.CORS_ORIGINS')?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    credentials: true,
  });

  // Global validation pipe with enhanced configuration
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true, // Rejeitar propriedades não permitidas
      transform: true, // Transformar automaticamente tipos
      transformOptions: {
        enableImplicitConversion: true, // Conversão implícita de tipos
      },
    }),
  );

  // Global exception filter for validation errors
  app.useGlobalFilters(new ValidationExceptionFilter());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Task Flow API Gateway')
    .setDescription('API Gateway para o sistema Task Flow - Gerenciamento de tarefas e usuários')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'Endpoints de autenticação e autorização')
    .addTag('Users', 'Gerenciamento de usuários')
    .addTag('Health', 'Endpoints de monitoramento e saúde da aplicação')
    .addServer('http://localhost:3000', 'Servidor de desenvolvimento')
    .addServer('https://api.taskflow.com', 'Servidor de produção')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = configService.get('app.API_GATEWAY_PORT') || 3000;
  await app.listen(port);
  
  console.log(`🚀 API Gateway running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  console.log(`🏥 Health check: http://localhost:${port}/api/health`);
}

bootstrap();
