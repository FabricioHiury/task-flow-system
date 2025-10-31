import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, PaginationDto, TaskStatus } from '@task-flow/shared';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.create(createTaskDto, user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.findAll(paginationDto, user.sub);
  }

  @Get('status/:status')
  @UseGuards(JwtAuthGuard)
  findByStatus(
    @Param('status') status: TaskStatus,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.findByStatus(status, user.sub);
  }

  @Get('assigned/:userId')
  @UseGuards(JwtAuthGuard)
  findByAssignee(@Param('userId') userId: string) {
    return this.tasksService.findByAssignee(userId);
  }

  @Get(':id/history')
  @UseGuards(JwtAuthGuard)
  getTaskHistory(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tasksService.getTaskHistory(id, user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tasksService.findOne(id, user.sub);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.tasksService.update(id, updateTaskDto, user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.tasksService.remove(id, user.sub);
  }

  // Microservice message patterns
  @MessagePattern('task.get')
  async getTask(@Payload() data: { taskId: string; userId?: string; token?: string }) {
    return this.tasksService.findOne(data.taskId, data.userId || 'unknown-user');
  }

  @MessagePattern('task.list')
  async getTasks(@Payload() data: any) {
    const { userId, ...filters } = data;
    const paginationDto: PaginationDto = {
      page: filters.page || 1,
      size: filters.limit || 10,
    };
    return this.tasksService.findAll(paginationDto, userId || undefined);
  }

  @MessagePattern('task.create')
  async createTask(@Payload() data: any) {
    const { createdBy, ...createTaskDto } = data;
    return this.tasksService.create(createTaskDto, createdBy);
  }

  @MessagePattern('task.update')
  async updateTask(@Payload() data: any) {
    const { taskId, updatedBy, ...updateTaskDto } = data;
    return this.tasksService.update(taskId, updateTaskDto, updatedBy);
  }

  @MessagePattern('task.delete')
  async deleteTask(@Payload() data: { taskId: string; userId: string }) {
    return this.tasksService.remove(data.taskId, data.userId);
  }

  @MessagePattern('task.assign')
  async assignTask(@Payload() data: { taskId: string; assigneeId: string }) {
    return this.tasksService.assignTask(data.taskId, data.assigneeId, data.assigneeId);
  }

  @MessagePattern('update_task_status')
  async updateTaskStatus(@Payload() data: { taskId: string; status: string; userId: string }) {
    return this.tasksService.updateTaskStatus(data.taskId, data.status as any, data.userId);
  }

  @MessagePattern('task.getHistory')
  async getTaskHistoryMicroservice(@Payload() data: { taskId: string; token?: string }) {
    // Extrair userId do token se necessário
    const userId = data.token ? this.extractUserIdFromToken(data.token) : undefined;
    return this.tasksService.getTaskHistory(data.taskId, userId);
  }

  private extractUserIdFromToken(token: string): string {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });
      return payload.sub;
    } catch (error) {
      return 'unknown-user';
    }
  }

  @MessagePattern('get_task')
  async getTaskLegacy(@Payload() data: { id: number }) {
    return this.tasksService.findOne(data.id.toString(), 'unknown-user');
  }

  @MessagePattern('get_user_tasks')
  async getUserTasksLegacy(
    @Payload() data: { userId: string; pagination: PaginationDto },
  ) {
    return this.tasksService.findAll(data.pagination, data.userId);
  }

  @MessagePattern('update_task_status')
  async updateTaskStatusLegacy(
    @Payload() data: { id: number; status: TaskStatus; userId: string },
  ) {
    return this.tasksService.update(
      data.id.toString(),
      { status: data.status },
      data.userId,
    );
  }
}
