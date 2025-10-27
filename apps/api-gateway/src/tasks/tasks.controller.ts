import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { TaskServiceClient } from '../microservices/clients/task-service.client';
import type { CreateTaskDto, UpdateTaskDto, TaskFilters } from '../microservices/clients/task-service.client';
import { firstValueFrom } from 'rxjs';
import { 
  ApiResponseDto, 
  UnauthorizedResponseDto, 
  NotFoundResponseDto, 
  ValidationErrorResponseDto 
} from '../common/dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly taskServiceClient: TaskServiceClient) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createTask(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    try {
      const result = await firstValueFrom(
        this.taskServiceClient.createTask({
          ...createTaskDto,
          createdBy: req.user.sub,
        })
      );
      return {
        success: true,
        data: result,
        message: 'Task created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TASK_CREATION_FAILED',
            message: error.message || 'Failed to create task',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get tasks with filters' })
  @ApiResponse({ status: 200, description: 'Tasks retrieved successfully' })
  async getTasks(@Query() filters: TaskFilters, @Request() req) {
    try {
      const result = await firstValueFrom(
        this.taskServiceClient.getTasks({
          ...filters,
          userId: req.user.sub, // Para filtrar tarefas do usuário
        })
      );
      return {
        success: true,
        data: result,
        message: 'Tasks retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TASKS_RETRIEVAL_FAILED',
            message: error.message || 'Failed to retrieve tasks',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getTask(@Param('id') taskId: string) {
    try {
      const result = await firstValueFrom(
        this.taskServiceClient.getTask(taskId)
      );
      return {
        success: true,
        data: result,
        message: 'Task retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TASK_NOT_FOUND',
            message: error.message || 'Task not found',
          },
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task updated successfully', type: ApiResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request', type: ValidationErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: UnauthorizedResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found', type: NotFoundResponseDto })
  async updateTask(
    @Param('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    try {
      const result = await firstValueFrom(
        this.taskServiceClient.updateTask(taskId, {
          ...updateTaskDto,
          updatedBy: req.user.sub,
        })
      );
      return {
        success: true,
        data: result,
        message: 'Task updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TASK_UPDATE_FAILED',
            message: error.message || 'Failed to update task',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async deleteTask(@Param('id') taskId: string, @Request() req) {
    try {
      const result = await firstValueFrom(
        this.taskServiceClient.deleteTask(taskId)
      );
      return {
        success: true,
        data: result,
        message: 'Task deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TASK_DELETION_FAILED',
            message: error.message || 'Failed to delete task',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign task to user' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({ status: 200, description: 'Task assigned successfully', type: ApiResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request', type: ValidationErrorResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: UnauthorizedResponseDto })
  @ApiResponse({ status: 404, description: 'Task not found', type: NotFoundResponseDto })
  async assignTask(@Param('id') taskId: string, @Body('assigneeId') assigneeId: string, @Request() req) {
    try {
      const result = await firstValueFrom(
        this.taskServiceClient.assignTask(taskId, assigneeId)
      );
      return {
        success: true,
        data: result,
        message: 'Task assigned successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'TASK_ASSIGNMENT_FAILED',
            message: error.message || 'Failed to assign task',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to task' })
  @ApiResponse({ status: 201, description: 'Comment added successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async addComment(
    @Param('id') taskId: string,
    @Body('content') content: string,
    @Request() req,
  ) {
    try {
      const result = await firstValueFrom(
        this.taskServiceClient.addComment(taskId, content, req.user.sub)
      );
      return {
        success: true,
        data: result,
        message: 'Comment added successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'COMMENT_CREATION_FAILED',
            message: error.message || 'Failed to add comment',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Get task comments' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async getComments(@Param('id') taskId: string) {
    try {
      const result = await firstValueFrom(
        this.taskServiceClient.getComments(taskId)
      );
      return {
        success: true,
        data: result,
        message: 'Comments retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'COMMENTS_RETRIEVAL_FAILED',
            message: error.message || 'Failed to retrieve comments',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}