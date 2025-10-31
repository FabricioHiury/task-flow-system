import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType, EntityType } from '../entities/notification.entity';

export interface NotificationPayload {
  type: NotificationType;
  recipientId: string;
  senderId?: string;
  entityId?: string; // task ID, project ID, etc.
  entityType?: EntityType;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async createAndSendNotification(payload: NotificationPayload): Promise<Notification> {
    try {
      const notification = this.notificationRepository.create({
        type: payload.type,
        recipientId: payload.recipientId,
        senderId: payload.senderId,
        entityId: payload.entityId,
        entityType: payload.entityType,
        metadata: payload.metadata,
        isRead: false,
        createdAt: new Date(),
      });

      const savedNotification = await this.notificationRepository.save(notification);
      
      this.logger.log(`Notification created: ${savedNotification.id} for user ${payload.recipientId}`);
      
      return savedNotification;
    } catch (error) {
      this.logger.error('Failed to create notification:', error.message);
      throw error;
    }
  }

  async getPendingNotifications(userId: string): Promise<Notification[]> {
    try {
      const notifications = await this.notificationRepository.find({
        where: {
          recipientId: userId,
          isRead: false,
        },
        order: {
          createdAt: 'DESC',
        },
        take: 50, // Limit to last 50 unread notifications
      });

      return notifications;
    } catch (error) {
      this.logger.error(`Failed to get pending notifications for user ${userId}:`, error.message);
      return [];
    }
  }

  async getAllNotifications(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{ notifications: Notification[]; total: number }> {
    try {
      const [notifications, total] = await this.notificationRepository.findAndCount({
        where: {
          recipientId: userId,
        },
        order: {
          createdAt: 'DESC',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      return { notifications, total };
    } catch (error) {
      this.logger.error(`Failed to get notifications for user ${userId}:`, error.message);
      return { notifications: [], total: 0 };
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.notificationRepository.update(
        {
          id: notificationId,
          recipientId: userId,
        },
        {
          isRead: true,
          readAt: new Date(),
        }
      );

      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      this.logger.error(`Failed to mark notification ${notificationId} as read:`, error.message);
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await this.notificationRepository.update(
        {
          recipientId: userId,
          isRead: false,
        },
        {
          isRead: true,
          readAt: new Date(),
        }
      );

      this.logger.log(`Marked ${result.affected} notifications as read for user ${userId}`);
      return result.affected || 0;
    } catch (error) {
      this.logger.error(`Failed to mark all notifications as read for user ${userId}:`, error.message);
      return 0;
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.notificationRepository.delete({
        id: notificationId,
        recipientId: userId,
      });

      return result.affected ? result.affected > 0 : false;
    } catch (error) {
      this.logger.error(`Failed to delete notification ${notificationId}:`, error.message);
      return false;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await this.notificationRepository.count({
        where: {
          recipientId: userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      this.logger.error(`Failed to get unread count for user ${userId}:`, error.message);
      return 0;
    }
  }

  // Helper methods for creating specific notification types
  async createTaskAssignedNotification(
    taskId: string,
    taskTitle: string,
    assigneeId: string,
    assignerId: string
  ): Promise<Notification> {
    return this.createAndSendNotification({
      type: NotificationType.TASK_CREATED,
      recipientId: assigneeId,
      senderId: assignerId,
      entityId: taskId,
      entityType: EntityType.TASK,
      metadata: {
        title: 'Nova tarefa atribuída',
        message: `Você foi atribuído à tarefa: ${taskTitle}`,
        taskTitle
      },
    });
  }

  async createTaskUpdatedNotification(
    taskId: string,
    taskTitle: string,
    recipientId: string,
    updaterId: string,
    changes: string[]
  ): Promise<Notification> {
    return this.createAndSendNotification({
      type: NotificationType.TASK_UPDATED,
      recipientId,
      senderId: updaterId,
      entityId: taskId,
      entityType: EntityType.TASK,
      metadata: { 
        title: 'Tarefa atualizada',
        message: `A tarefa "${taskTitle}" foi atualizada: ${changes.join(', ')}`,
        taskTitle,
        changes 
      },
    });
  }

  async createCommentAddedNotification(
    taskId: string,
    taskTitle: string,
    recipientId: string,
    commenterId: string,
    commentPreview: string
  ): Promise<Notification> {
    return this.createAndSendNotification({
      type: NotificationType.COMMENT_CREATED,
      recipientId,
      senderId: commenterId,
      entityId: taskId,
      entityType: EntityType.TASK,
      metadata: { 
        title: 'Novo comentário',
        message: `Novo comentário na tarefa "${taskTitle}": ${commentPreview}`,
        taskTitle,
        commentPreview 
      },
    });
  }

  async createDeadlineReminderNotification(
    taskId: string,
    taskTitle: string,
    recipientId: string,
    deadline: Date
  ): Promise<Notification> {
    const daysUntilDue = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    return this.createAndSendNotification({
      type: NotificationType.SYSTEM,
      recipientId,
      entityId: taskId,
      entityType: EntityType.TASK,
      metadata: { 
        title: 'Lembrete de prazo',
        message: `A tarefa "${taskTitle}" vence em ${daysUntilDue} dia(s)`,
        taskTitle,
        deadline: deadline.toISOString(), 
        daysUntilDue 
      },
    });
  }
}