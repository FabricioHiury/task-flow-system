import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Nome de usuário ou email',
    example: 'johndoe',
  })
  @IsString({ message: 'Username deve ser uma string' })
  @IsNotEmpty({ message: 'Username é obrigatório' })
  @MaxLength(255, { message: 'Username deve ter no máximo 255 caracteres' })
  username: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'MyStr0ngP@ssw0rd',
  })
  @IsString({ message: 'Password deve ser uma string' })
  @IsNotEmpty({ message: 'Password é obrigatório' })
  @MinLength(1, { message: 'Password não pode estar vazio' })
  @MaxLength(128, { message: 'Password deve ter no máximo 128 caracteres' })
  password: string;
}