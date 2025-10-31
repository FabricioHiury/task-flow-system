import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { MicroservicesModule } from '../microservices/microservices.module';

@Module({
  imports: [MicroservicesModule],
  controllers: [TasksController],
})
export class TasksModule {}