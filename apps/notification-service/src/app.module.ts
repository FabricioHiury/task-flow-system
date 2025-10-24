import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { NotificationsModule } from './notifications/notifications.module';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: databaseConfig,
      inject: [ConfigModule],
    }),
    NotificationsModule,
    WebSocketModule,
  ],
})
export class AppModule {}
