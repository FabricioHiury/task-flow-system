import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome de usuário único',
    example: 'johndoe',
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: 'Nome de usuário deve ser uma string' })
  @IsNotEmpty({ message: 'Nome de usuário é obrigatório' })
  @MinLength(3, { message: 'Nome de usuário deve ter pelo menos 3 caracteres' })
  @MaxLength(50, {
    message: 'Nome de usuário deve ter no máximo 50 caracteres',
  })
  username: string;

  @ApiProperty({
    description: 'Endereço de email válido',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @MaxLength(255, { message: 'Email deve ter no máximo 255 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Senha com pelo menos 8 caracteres',
    example: 'minhasenha123',
    minLength: 8,
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(128, { message: 'Senha deve ter no máximo 128 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Nome completo do usuário',
    example: 'John Doe',
    maxLength: 100,
  })
  @IsString({ message: 'Nome completo deve ser uma string' })
  @MaxLength(100, {
    message: 'Nome completo deve ter no máximo 100 caracteres',
  })
  fullName: string;
}
