import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { Notification } from './notification.entity';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { NotificationEventsController } from '../common/events/notification-events.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'notifications_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [NotificationsController, NotificationEventsController],
  providers: [NotificationsService, WebSocketGateway],
  exports: [NotificationsService, WebSocketGateway],
})
export class NotificationsModule {}