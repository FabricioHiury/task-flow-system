import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { NotificationService } from '../services/notification.service';
import { CreateNotificationDto, NotificationResponseDto } from '../dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Obter todas as notificações do usuário' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Itens por página',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de notificações retornada com sucesso',
    schema: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: { $ref: '#/components/schemas/NotificationResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  async getAllNotifications(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const userId = req.user.sub;
    const { notifications, total } =
      await this.notificationService.getAllNotifications(userId, page, limit);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  @Get('unread')
  @ApiOperation({ summary: 'Obter notificações não lidas' })
  @ApiResponse({
    status: 200,
    description: 'Notificações não lidas retornadas com sucesso',
    type: [NotificationResponseDto],
  })
  async getUnreadNotifications(@Request() req: any) {
    const userId = req.user.sub;
    return this.notificationService.getPendingNotifications(userId);
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Obter contagem de notificações não lidas' })
  @ApiResponse({
    status: 200,
    description: 'Contagem de notificações não lidas',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
      },
    },
  })
  async getUnreadCount(@Request() req: any) {
    const userId = req.user.sub;
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova notificação' })
  @ApiResponse({
    status: 201,
    description: 'Notificação criada com sucesso',
    type: NotificationResponseDto,
  })
  @HttpCode(HttpStatus.CREATED)
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
    @Request() req: any,
  ) {
    const senderId = req.user.sub;
    return this.notificationService.createAndSendNotification({
      ...createNotificationDto,
      senderId,
    });
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({
    status: 200,
    description: 'Notificação marcada como lida',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async markAsRead(@Param('id') notificationId: string, @Request() req: any) {
    const userId = req.user.sub;
    const success = await this.notificationService.markAsRead(
      notificationId,
      userId,
    );

    return {
      success,
      message: success
        ? 'Notificação marcada como lida'
        : 'Notificação não encontrada ou já lida',
    };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({
    status: 200,
    description: 'Todas as notificações marcadas como lidas',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  async markAllAsRead(@Request() req: any) {
    const userId = req.user.sub;
    const count = await this.notificationService.markAllAsRead(userId);

    return {
      count,
      message: `${count} notificações marcadas como lidas`,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar uma notificação' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({
    status: 200,
    description: 'Notificação deletada com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async deleteNotification(
    @Param('id') notificationId: string,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    const success = await this.notificationService.deleteNotification(
      notificationId,
      userId,
    );

    return {
      success,
      message: success
        ? 'Notificação deletada com sucesso'
        : 'Notificação não encontrada',
    };
  }
}
