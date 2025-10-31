import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerService, LoggerMiddleware } from '../services/logger.service';

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
