import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nome de usuário único',
    example: 'johndoe',
    minLength: 3,
    maxLength: 30,
  })
  @IsString({ message: 'Username deve ser uma string' })
  @IsNotEmpty({ message: 'Username é obrigatório' })
  @MinLength(3, { message: 'Username deve ter pelo menos 3 caracteres' })
  @MaxLength(30, { message: 'Username deve ter no máximo 30 caracteres' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username deve conter apenas letras, números, underscore e hífen',
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
    description: 'Senha forte com pelo menos 8 caracteres',
    example: 'MyStr0ngP@ssw0rd',
    minLength: 8,
  })
  @IsString({ message: 'Password deve ser uma string' })
  @IsNotEmpty({ message: 'Password é obrigatório' })
  @MinLength(8, { message: 'Password deve ter pelo menos 8 caracteres' })
  @MaxLength(128, { message: 'Password deve ter no máximo 128 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Password deve conter pelo menos: 1 letra minúscula, 1 maiúscula, 1 número e 1 caractere especial',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'John Doe',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Full name deve ser uma string' })
  @MaxLength(100, { message: 'Full name deve ter no máximo 100 caracteres' })
  fullName?: string;
}