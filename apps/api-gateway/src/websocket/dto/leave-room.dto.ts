import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LeaveRoomDto {
  @ApiProperty({
    description: 'Nome da sala para sair (formato: tipo:id)',
    example: 'project:123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(project|task|user):[a-zA-Z0-9-_]+$/, {
    message: 'Room format must be: type:id (e.g., project:123, task:456, user:789)',
  })
  room: string;
}