import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from '../../notifications/notifications.service';
import type { CreateNotificationDto } from '../../notifications/notifications.service';

@Controller()
export class NotificationEventsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @MessagePattern('notification.create')
  async handleCreateNotification(@Payload() data: CreateNotificationDto) {
    return this.notificationsService.create(data);
  }

  @MessagePattern('notification.task.created')
  async handleTaskCreated(@Payload() data: any) {
    const notification: CreateNotificationDto = {
      title: 'Nova Tarefa Criada',
      message: `A tarefa "${data.title}" foi criada.`,
      type: 'task_created' as any,
      userId: data.assignedTo || data.createdBy,
      relatedEntityId: data.id,
      metadata: { taskTitle: data.title, priority: data.priority },
    };

    return this.notificationsService.create(notification);
  }

  @MessagePattern('notification.task.updated')
  async handleTaskUpdated(@Payload() data: any) {
    const notification: CreateNotificationDto = {
      title: 'Tarefa Atualizada',
      message: `A tarefa "${data.title}" foi atualizada.`,
      type: 'task_updated' as any,
      userId: data.assignedTo || data.createdBy,
      relatedEntityId: data.id,
      metadata: { taskTitle: data.title, changes: data.changes },
    };

    return this.notificationsService.create(notification);
  }

  @MessagePattern('notification.task.deleted')
  async handleTaskDeleted(@Payload() data: any) {
    const notification: CreateNotificationDto = {
      title: 'Tarefa Deletada',
      message: `A tarefa "${data.title}" foi deletada.`,
      type: 'task_deleted' as any,
      userId: data.assignedTo || data.createdBy,
      relatedEntityId: data.id,
      metadata: { taskTitle: data.title },
    };

    return this.notificationsService.create(notification);
  }

  @MessagePattern('notification.comment.created')
  async handleCommentCreated(@Payload() data: any) {
    const notification: CreateNotificationDto = {
      title: 'Novo Comentário',
      message: `Um novo comentário foi adicionado à tarefa.`,
      type: 'comment_created' as any,
      userId: data.taskOwnerId,
      relatedEntityId: data.taskId,
      metadata: { commentId: data.id, commentContent: data.content },
    };

    return this.notificationsService.create(notification);
  }

  @MessagePattern('notification.comment.deleted')
  async handleCommentDeleted(@Payload() data: any) {
    const notification: CreateNotificationDto = {
      title: 'Comentário Deletado',
      message: `Um comentário foi removido da tarefa.`,
      type: 'comment_deleted' as any,
      userId: data.taskOwnerId,
      relatedEntityId: data.taskId,
      metadata: { commentId: data.id },
    };

    return this.notificationsService.create(notification);
  }
}