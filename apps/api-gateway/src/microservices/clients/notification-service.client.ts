import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, timeout, catchError, throwError } from 'rxjs';

export interface SendNotificationDto {
  type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'TASK_COMPLETED' | 'COMMENT_ADDED' | 'PROJECT_UPDATED' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  recipientId: string;
  senderId?: string;
  entityType?: 'TASK' | 'PROJECT' | 'COMMENT' | 'USER';
  entityId?: string;
  metadata?: Record<string, any>;
}

export interface NotificationFilters {
  recipientId?: string;
  type?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class NotificationServiceClient {
  private readonly logger = new Logger(NotificationServiceClient.name);

  constructor(@Inject('NOTIFICATION_SERVICE') private client: ClientProxy) {}

  sendNotification(sendNotificationDto: SendNotificationDto): Observable<any> {
    this.logger.log(`Sending notification to user: ${sendNotificationDto.recipientId}`);
    return this.client
      .send('notification.send', sendNotificationDto)
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to send notification: ${error.message}`);
          return throwError(() => error);
        }),
      );
  }

  getNotifications(filters: NotificationFilters = {}): Observable<any> {
    this.logger.log(`Getting notifications with filters: ${JSON.stringify(filters)}`);
    return this.client
      .send('notification.list', filters)
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to get notifications: ${error.message}`);
          return throwError(() => error);
        }),
      );
  }

  markAsRead(notificationId: string, userId: string): Observable<any> {
    this.logger.log(`Marking notification ${notificationId} as read for user ${userId}`);
    return this.client
      .send('notification.read', { notificationId, userId })
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to mark notification ${notificationId} as read: ${error.message}`);
          return throwError(() => error);
        }),
      );
  }

  markAllAsRead(userId: string): Observable<any> {
    this.logger.log(`Marking all notifications as read for user ${userId}`);
    return this.client
      .send('notification.read.all', { userId })
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to mark all notifications as read for user ${userId}: ${error.message}`);
          return throwError(() => error);
        }),
      );
  }

  deleteNotification(notificationId: string, userId: string): Observable<any> {
    this.logger.log(`Deleting notification ${notificationId} for user ${userId}`);
    return this.client
      .send('notification.delete', { notificationId, userId })
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to delete notification ${notificationId}: ${error.message}`);
          return throwError(() => error);
        }),
      );
  }

  getUnreadCount(userId: string): Observable<any> {
    this.logger.log(`Getting unread count for user: ${userId}`);
    return this.client
      .send('notification.unread.count', { userId })
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to get unread count for user ${userId}: ${error.message}`);
          return throwError(() => error);
        }),
      );
  }

  // Método para enviar notificação em lote
  sendBulkNotifications(notifications: SendNotificationDto[]): Observable<any> {
    this.logger.log(`Sending ${notifications.length} bulk notifications`);
    return this.client
      .send('notification.send.bulk', { notifications })
      .pipe(
        timeout(15000),
        catchError((error) => {
          this.logger.error(`Failed to send bulk notifications: ${error.message}`);
          return throwError(() => error);
        }),
      );
  }

  // Método para obter estatísticas de notificações
  getNotificationStats(userId: string): Observable<any> {
    this.logger.log(`Getting notification stats for user: ${userId}`);
    return this.client
      .send('notification.stats', { userId })
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(`Failed to get notification stats for user ${userId}: ${error.message}`);
          return throwError(() => error);
        }),
      );
  }
}