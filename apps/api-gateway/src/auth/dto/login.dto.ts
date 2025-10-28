import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsEmail,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  @MaxLength(255, { message: 'Email deve ter no máximo 255 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'minhasenha123',
  })
  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter pelo menos 8 caracteres' })
  @MaxLength(128, { message: 'Senha deve ter no máximo 128 caracteres' })
  password: string;
}
