import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUUID, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus, TaskPriority } from './enums';

export class TaskUpdateDto {
  @ApiProperty({
    description: 'ID da tarefa atualizada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  taskId: string;

  @ApiProperty({
    description: 'ID do projeto da tarefa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  projectId: string;

  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Implementar autenticação JWT',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Descrição da tarefa',
    example: 'Implementar sistema de autenticação usando JWT tokens',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Status da tarefa',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Prioridade da tarefa',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'ID do usuário atribuído à tarefa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Data de vencimento da tarefa',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiProperty({
    description: 'ID do usuário que fez a atualização',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  updatedBy: string;

  @ApiPropertyOptional({
    description: 'Lista de campos que foram alterados',
    example: ['status', 'assigneeId'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  changedFields?: string[];

  @ApiPropertyOptional({
    description: 'Valores anteriores dos campos alterados',
    example: { status: 'todo', assigneeId: null },
  })
  @IsOptional()
  previousValues?: Record<string, any>;
}