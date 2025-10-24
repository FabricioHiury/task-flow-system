import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { Request } from 'express';
import { NotificationsService } from './notifications.service';
import type { CreateNotificationDto } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { PaginationDto } from '@task-flow/shared';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Req() req: Request, @Query() paginationDto: PaginationDto) {
    const userId = (req as any).user?.sub;
    return this.notificationsService.findAllByUser(userId, paginationDto);
  }

  @Get('unread')
  async findUnread(@Req() req: Request) {
    const userId = (req as any).user?.sub;
    return this.notificationsService.findUnreadByUser(userId);
  }

  @Get('unread/count')
  async getUnreadCount(@Req() req: Request) {
    const userId = (req as any).user?.sub;
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.sub;
    return this.notificationsService.markAsRead(id, userId);
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: Request) {
    const userId = (req as any).user?.sub;
    await this.notificationsService.markAllAsRead(userId);
    return { message: 'Todas as notificações foram marcadas como lidas' };
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: Request) {
    const userId = (req as any).user?.sub;
    await this.notificationsService.delete(id, userId);
    return { message: 'Notificação deletada com sucesso' };
  }

  // Microservice message patterns
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