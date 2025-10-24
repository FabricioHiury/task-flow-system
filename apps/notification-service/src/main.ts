import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Criar aplicação HTTP
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Configurar validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar prefixo global da API
  app.setGlobalPrefix('api');

  // Conectar microserviço RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'notifications_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  // Iniciar microserviços
  await app.startAllMicroservices();

  // Iniciar servidor HTTP
  const port = process.env.PORT || 3002;
  await app.listen(port);

  console.log(`🚀 Notification Service running on: http://localhost:${port}`);
  console.log(
    `📡 WebSocket server running on: ws://localhost:${port}/notifications`,
  );
  console.log(`🐰 RabbitMQ microservice connected`);
}

bootstrap();
