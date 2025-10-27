import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebSocketNotificationGateway } from './websocket.gateway';
import { NotificationService } from './services/notification.service';
import { NotificationsController } from './controllers/notifications.controller';
import { Notification } from './entities/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [
    WebSocketNotificationGateway,
    NotificationService,
  ],
  controllers: [NotificationsController],
  exports: [
    WebSocketNotificationGateway,
    NotificationService,
  ],
})
export class WebSocketModule {}