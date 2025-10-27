import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommentUpdateDto {
  @ApiProperty({
    description: 'ID do comentário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  commentId: string;

  @ApiProperty({
    description: 'ID da tarefa do comentário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  taskId: string;

  @ApiProperty({
    description: 'Conteúdo do comentário',
    example: 'Este é um comentário sobre a tarefa',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'ID do autor do comentário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  authorId: string;

  @ApiProperty({
    description: 'Nome do autor do comentário',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  authorName: string;

  @ApiPropertyOptional({
    description: 'ID do comentário pai (para respostas)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  parentCommentId?: string;

  @ApiProperty({
    description: 'Data de criação do comentário',
    example: '2024-01-15T10:30:00.000Z',
  })
  @IsString()
  createdAt: string;

  @ApiPropertyOptional({
    description: 'Data de atualização do comentário',
    example: '2024-01-15T10:35:00.000Z',
  })
  @IsOptional()
  @IsString()
  updatedAt?: string;

  @ApiPropertyOptional({
    description: 'Indica se o comentário foi editado',
    example: false,
  })
  @IsOptional()
  isEdited?: boolean;
}