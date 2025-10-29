import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsDateString, IsArray, IsUUID } from 'class-validator';
import { TaskPriority, TaskStatus } from '../enums/index';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class CreateTaskDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  deadline: string;

  @IsEnum(TaskPriority)
  priority: TaskPriority;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assignedUserIds?: string[];
}

export class UpdateTaskDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assignedUserIds?: string[];
}

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  content: string;
}

export class PaginationDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  size?: number = 10;
}