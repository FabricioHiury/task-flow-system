import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { WebSocketModule } from './websocket/websocket.module';
import { TasksModule } from './tasks/tasks.module';
import { MicroservicesModule } from './microservices/microservices.module';
import { GuardsModule } from './common/guards/guards.module';
import { LoggerModule } from './common/modules/logger.module';

// Configurações
import { validate } from './config/env.validation';
import {
  configuration,
  databaseConfig,
  jwtConfig,
} from './config/configuration';

// Interceptors e Filters
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      load: [configuration, databaseConfig, jwtConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService) => configService.get('database'),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService) => ({
        throttlers: [
          {
            ttl: configService.get('app.RATE_LIMIT_TTL') * 1000,
            limit: configService.get('app.RATE_LIMIT_LIMIT'),
          },
        ],
      }),
      inject: [ConfigService],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    GuardsModule,
    LoggerModule,
    AuthModule,
    UsersModule,
    HealthModule,
    WebSocketModule,
    TasksModule,
    MicroservicesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
