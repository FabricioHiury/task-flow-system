import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationType,
  NotificationStatus,
} from './notification.entity';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import { PaginationDto } from '@task-flow/shared';

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  userId: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private webSocketGateway: WebSocketGateway,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationRepository.create(
      createNotificationDto,
    );
    const savedNotification =
      await this.notificationRepository.save(notification);

    // Enviar notificação via WebSocket
    this.webSocketGateway.sendNotificationToUser(
      savedNotification.userId,
      savedNotification,
    );

    this.logger.log(
      `Notification created for user ${savedNotification.userId}: ${savedNotification.title}`,
    );
    return savedNotification;
  }

  async findAllByUser(
    userId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, size = 10 } = paginationDto;
    const skip = (page - 1) * size;

    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where: { userId },
        order: { createdAt: 'DESC' },
        skip,
        take: size,
      });

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / size),
    };
  }

  async findUnreadByUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.status = NotificationStatus.READ;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ },
    );
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.notificationRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new Error('Notification not found');
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
      },
    });
  }
}
