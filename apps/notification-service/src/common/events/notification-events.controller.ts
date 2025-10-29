import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from '../../notifications/notifications.service';
import type { CreateNotificationDto } from '../../notifications/notifications.service';
import { EntityType } from '../../notifications/notification.entity';

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
      type: 'task_created' as any,
      userId: data.assignedTo || data.createdBy,
      senderId: data.createdBy,
      relatedEntityId: data.id,
      entityType: EntityType.TASK,
      metadata: { 
        taskTitle: data.title, 
        priority: data.priority,
        title: 'Nova Tarefa Criada',
        message: `A tarefa "${data.title}" foi criada.`
      },
    };

    return this.notificationsService.create(notification);
  }

  @MessagePattern('notification.task.updated')
  async handleTaskUpdated(@Payload() data: any) {
    const notification: CreateNotificationDto = {
      type: 'task_updated' as any,
      userId: data.assignedTo || data.createdBy,
      senderId: data.updatedBy || data.createdBy,
      relatedEntityId: data.id,
      entityType: EntityType.TASK,
      metadata: { 
        taskTitle: data.title, 
        changes: data.changes,
        title: 'Tarefa Atualizada',
        message: `A tarefa "${data.title}" foi atualizada.`
      },
    };

    return this.notificationsService.create(notification);
  }

  @MessagePattern('notification.task.deleted')
  async handleTaskDeleted(@Payload() data: any) {
    const notification: CreateNotificationDto = {
      type: 'task_deleted' as any,
      userId: data.assignedTo || data.createdBy,
      senderId: data.deletedBy || data.createdBy,
      relatedEntityId: data.id,
      entityType: EntityType.TASK,
      metadata: { 
        taskTitle: data.title,
        title: 'Tarefa Deletada',
        message: `A tarefa "${data.title}" foi deletada.`
      },
    };

    return this.notificationsService.create(notification);
  }

  @MessagePattern('notification.comment.created')
  async handleCommentCreated(@Payload() data: any) {
    const notification: CreateNotificationDto = {
      type: 'comment_created' as any,
      userId: data.taskOwnerId,
      senderId: data.createdBy,
      relatedEntityId: data.taskId,
      entityType: EntityType.COMMENT,
      metadata: { 
        commentId: data.id, 
        commentContent: data.content,
        title: 'Novo Comentário',
        message: `Um novo comentário foi adicionado à tarefa.`
      },
    };

    return this.notificationsService.create(notification);
  }

  @MessagePattern('notification.comment.deleted')
  async handleCommentDeleted(@Payload() data: any) {
    const notification: CreateNotificationDto = {
      type: 'comment_deleted' as any,
      userId: data.taskOwnerId,
      senderId: data.deletedBy,
      relatedEntityId: data.taskId,
      entityType: EntityType.COMMENT,
      metadata: { 
        commentId: data.id,
        title: 'Comentário Deletado',
        message: `Um comentário foi removido da tarefa.`
      },
    };

    return this.notificationsService.create(notification);
  }
}