import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  PaginationDto,
  TaskStatus,
} from '@task-flow/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.create(createTaskDto, user.sub);
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.findAll(paginationDto, user.sub);
  }

  @Get('status/:status')
  findByStatus(
    @Param('status') status: TaskStatus,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.findByStatus(status, user.sub);
  }

  @Get('assigned/:userId')
  findByAssignee(@Param('userId') userId: string) {
    return this.tasksService.findByAssignee(+userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tasksService.findOne(+id, user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.update(+id, updateTaskDto, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tasksService.remove(+id, user.sub);
  }

  // Microservice message patterns
  @MessagePattern('get_task')
  async getTask(@Payload() data: { id: number }) {
    return this.tasksService.findOne(data.id);
  }

  @MessagePattern('get_user_tasks')
  async getUserTasks(
    @Payload() data: { userId: number; pagination: PaginationDto },
  ) {
    return this.tasksService.findAll(data.pagination, data.userId);
  }

  @MessagePattern('update_task_status')
  async updateTaskStatus(
    @Payload() data: { id: number; status: TaskStatus; userId: number },
  ) {
    return this.tasksService.update(
      data.id,
      { status: data.status },
      data.userId,
    );
  }
}
