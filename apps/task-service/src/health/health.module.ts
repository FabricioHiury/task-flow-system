import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { databaseConfig } from '../config/database.config';

@Module({
  imports: [
    TerminusModule,
    TypeOrmModule.forRoot(databaseConfig),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
