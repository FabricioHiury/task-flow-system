import { registerAs } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

export default registerAs('rabbitmq', () => ({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
    queue: 'api_gateway_queue',
    queueOptions: {
      durable: true,
    },
    socketOptions: {
      heartbeatIntervalInSeconds: 60,
      reconnectTimeInSeconds: 5,
    },
  },
  // Configurações específicas para cada serviço
  services: {
    taskService: {
      queue: 'task_service_queue',
      patterns: {
        createTask: 'task.create',
        updateTask: 'task.update',
        deleteTask: 'task.delete',
        getTask: 'task.get',
        getTasks: 'task.list',
        assignTask: 'task.assign',
      },
    },
    notificationService: {
      queue: 'notification_service_queue',
      patterns: {
        sendNotification: 'notification.send',
        getNotifications: 'notification.list',
        markAsRead: 'notification.read',
        deleteNotification: 'notification.delete',
      },
    },
  },
}));