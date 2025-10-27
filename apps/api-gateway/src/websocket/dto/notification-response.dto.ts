import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'ID da notificação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Tipo da notificação',
    example: 'task_assigned',
  })
  type: string;

  @ApiProperty({
    description: 'Título da notificação',
    example: 'Nova tarefa atribuída',
  })
  title: string;

  @ApiProperty({
    description: 'Mensagem da notificação',
    example: 'Você foi atribuído à tarefa: Implementar autenticação',
  })
  message: string;

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
    example: 'task',
  })
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Metadados adicionais',
    example: { priority: 'high' },
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