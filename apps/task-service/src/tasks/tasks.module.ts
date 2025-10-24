import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './task.entity';
import { Comment } from '../comments/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Comment]),
    JwtModule.register({
      secret:
        process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
      signOptions: { expiresIn: '1h' },
    }),
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
          ],
          queue: 'task_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}