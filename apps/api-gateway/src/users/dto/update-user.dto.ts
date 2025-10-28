import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nome de usuário único',
    example: 'johndoe',
    minLength: 3,
    maxLength: 30,
  })
  @IsOptional()
  @IsString({ message: 'Username deve ser uma string' })
  @MinLength(3, { message: 'Username deve ter pelo menos 3 caracteres' })
  @MaxLength(30, { message: 'Username deve ter no máximo 30 caracteres' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username deve conter apenas letras, números, underscore e hífen',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'Endereço de email válido',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @MaxLength(255, { message: 'Email deve ter no máximo 255 caracteres' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Nome completo do usuário',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Full name deve ser uma string' })
  @MaxLength(100, { message: 'Full name deve ter no máximo 100 caracteres' })
  fullName?: string;
}
