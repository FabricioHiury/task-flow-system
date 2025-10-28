import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome de usuário único',
    example: 'johndoe',
  })
  username: string;

  @ApiProperty({
    description: 'Endereço de email do usuário',
    example: 'john@example.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Nome completo do usuário',
    example: 'John Doe',
  })
  fullName?: string;

  @ApiProperty({
    description: 'Data de criação do usuário',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de última atualização do usuário',
    example: '2024-01-15T10:35:00.000Z',
  })
  updatedAt: Date;
}
