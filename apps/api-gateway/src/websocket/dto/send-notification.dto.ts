import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, EntityType } from './enums';

export class SendNotificationDto {
  @ApiProperty({
    description: 'Tipo da notificação',
    enum: NotificationType,
    example: NotificationType.TASK_ASSIGNED,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Título da notificação',
    example: 'Nova tarefa atribuída',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Mensagem da notificação',
    example: 'Você foi atribuído à tarefa: Implementar autenticação',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    description: 'ID do usuário que receberá a notificação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  recipientId: string;

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
    description: 'Metadados adicionais da notificação',
    example: { priority: 'high', dueDate: '2024-12-31' },
  })
  @IsOptional()
  metadata?: Record<string, any>;
}