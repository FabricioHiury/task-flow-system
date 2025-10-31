import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, EntityType } from '../entities/notification.entity';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'ID da notificação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Tipo da notificação',
    enum: NotificationType,
    example: NotificationType.TASK_CREATED,
  })
  type: NotificationType;

  @ApiProperty({
    description: 'ID do usuário que receberá a notificação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  recipientId: string;

  @ApiPropertyOptional({
    description: 'ID do usuário que enviou a notificação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  senderId?: string;

  @ApiPropertyOptional({
    description: 'ID da entidade relacionada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Tipo da entidade relacionada',
    enum: EntityType,
    example: EntityType.TASK,
  })
  entityType?: EntityType;

  @ApiPropertyOptional({
    description: 'Metadados da notificação (incluindo título e mensagem)',
    example: { 
      title: 'Nova tarefa criada',
      message: 'A tarefa "Implementar autenticação" foi criada.',
      priority: 'high' 
    },
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Indica se a notificação foi lida',
    example: false,
  })
  isRead: boolean;

  @ApiPropertyOptional({
    description: 'Data em que a notificação foi lida',
    example: '2024-01-15T10:30:00.000Z',
  })
  readAt?: string;

  @ApiProperty({
    description: 'Data de criação da notificação',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Data de atualização da notificação',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: string;
}
