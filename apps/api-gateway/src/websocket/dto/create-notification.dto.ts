import { IsEnum, IsOptional, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, EntityType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Tipo da notificação',
    enum: NotificationType,
    example: NotificationType.TASK_CREATED,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'ID do usuário que receberá a notificação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  recipientId: string;

  @ApiPropertyOptional({
    description: 'ID do usuário que enviou a notificação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  senderId?: string;

  @ApiPropertyOptional({
    description: 'ID da entidade relacionada (tarefa, projeto, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Tipo da entidade relacionada',
    enum: EntityType,
    example: EntityType.TASK,
  })
  @IsOptional()
  @IsEnum(EntityType)
  entityType?: EntityType;

  @ApiPropertyOptional({
    description: 'Metadados da notificação (incluindo título e mensagem)',
    example: { 
      title: 'Nova tarefa criada',
      message: 'A tarefa "Implementar autenticação" foi criada.',
      priority: 'high' 
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}