import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Task } from './task.entity';
import { TaskHistoryService } from './task-history.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  PaginationDto,
  TaskStatus,
} from '@task-flow/shared';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @Inject('RABBITMQ_SERVICE')
    private rabbitClient: ClientProxy,
    private taskHistoryService: TaskHistoryService,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    // Garantir que assignedTo seja sempre um array válido para o PostgreSQL
    const assignedTo = createTaskDto.assignedUserIds && createTaskDto.assignedUserIds.length > 0 
      ? createTaskDto.assignedUserIds 
      : [];
    
    const task = this.taskRepository.create({
      ...createTaskDto,
      assignedTo,
      createdBy: userId,
    });

    const savedTask = await this.taskRepository.save(task);

    // Log task creation in history
    await this.taskHistoryService.logTaskCreation(savedTask, userId);

    // Emit event for task creation
    this.rabbitClient.emit('task_created', {
      id: savedTask.id.toString(),
      title: savedTask.title,
      priority: savedTask.priority,
      assignedTo: savedTask.assignedTo,
      createdBy: savedTask.createdBy,
      createdAt: savedTask.createdAt,
    });

    return savedTask;
  }

  async findAll(
    paginationDto: PaginationDto,
    userId?: string,
  ): Promise<{ tasks: Task[]; total: number }> {
    const { page = 1, size = 10 } = paginationDto;
    const skip = (page - 1) * size;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.comments', 'comments')
      .orderBy('task.createdAt', 'DESC');

    if (userId) {
      queryBuilder.where(
        'task.createdBy = :userId OR :userId = ANY("task"."assigned_to")',
        { userId },
      );
    }

    const [tasks, total] = await queryBuilder
      .skip(skip)
      .take(size)
      .getManyAndCount();

    return { tasks, total };
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .where('task.id = :id', { id })
      .andWhere(
        'task.createdBy = :userId OR :userId = ANY(task.assignedTo)',
        { userId },
      );

    const task = await queryBuilder.getOne();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId: string,
  ): Promise<Task> {
    const task = await this.findOne(id, userId);

    // Store previous values for history
    const previousTask = { ...task };
    const previousStatus = task.status;
    
    // Handle assignedUserIds separately
    const updateData: any = { ...updateTaskDto };
    if (updateTaskDto.assignedUserIds !== undefined) {
      // Garantir que assignedTo seja sempre um array válido para o PostgreSQL
      updateData.assignedTo = updateTaskDto.assignedUserIds && updateTaskDto.assignedUserIds.length > 0 
        ? updateTaskDto.assignedUserIds 
        : [];
      delete updateData.assignedUserIds;
    }
    
    Object.assign(task, updateData);

    const updatedTask = await this.taskRepository.save(task);

    // Log task update in history
    await this.taskHistoryService.logTaskUpdate(
      id,
      previousTask,
      updatedTask,
      userId,
    );

    // Emit event for task update
    this.rabbitClient.emit('task_updated', {
      id: updatedTask.id.toString(),
      title: updatedTask.title,
      previousStatus,
      newStatus: updatedTask.status,
      assignedTo: updatedTask.assignedTo,
      createdBy: updatedTask.createdBy,
      updatedBy: userId,
      updatedAt: updatedTask.updatedAt,
      changes: { status: { from: previousStatus, to: updatedTask.status } },
    });

    return updatedTask;
  }

  async remove(id: string, userId: string): Promise<{ success: boolean; taskId: string; title: string }> {
    // Validate userId is provided
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required for task deletion');
    }

    const task = await this.findOne(id, userId);

    // Log task deletion in history before removing
    await this.taskHistoryService.logTaskDeletion(task, userId.trim());

    await this.taskRepository.remove(task);

    // Emit event for task deletion
    this.rabbitClient.emit('notification.task.deleted', {
      id: id.toString(),
      title: task.title,
      assignedTo: task.assignedTo,
      createdBy: task.createdBy, 
      deletedBy: userId.trim(),
      deletedAt: new Date(),
    });

    return {
      success: true,
      taskId: id,
      title: task.title,
    };
  }

  async findByStatus(status: TaskStatus, userId?: string): Promise<Task[]> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .where('task.status = :status', { status });

    if (userId) {
      queryBuilder.andWhere(
        '(task.createdBy = :userId OR task.assignedTo = :userId)',
        { userId },
      );
    }

    return queryBuilder.getMany();
  }

  async getTaskHistory(taskId: string, userId?: string): Promise<any[]> {
    // Verify user has access to the task
    if (userId) {
      await this.findOne(taskId, userId);
    }
    
    return this.taskHistoryService.getTaskHistory(taskId);
  }

  async updateTaskStatus(taskId: string, status: TaskStatus, userId: string): Promise<Task> {
    return this.update(taskId, { status }, userId);
  }

  async assignTask(taskId: string, assigneeId: string, userId: string): Promise<Task> {
    const task = await this.findOne(taskId, userId);
    
    // Store previous assignee for history
    const previousAssignee = task.assignedTo;
    task.assignedTo = [assigneeId];

    const updatedTask = await this.taskRepository.save(task);

    // Log task assignment in history
    await this.taskHistoryService.logTaskUpdate(
      taskId,
      { ...task, assignedTo: previousAssignee },
      updatedTask,
      userId,
    );

    // Emit event for task assignment
    this.rabbitClient.emit('task_updated', {
      taskId: updatedTask.id.toString(),
      title: updatedTask.title,
      previousAssignee,
      newAssignee: updatedTask.assignedTo,
      assignedBy: userId,
      updatedAt: updatedTask.updatedAt,
    });

    return updatedTask;
  }

  async findByAssignee(assigneeId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { assignedTo: assigneeId },
      relations: ['comments'],
      order: { createdAt: 'DESC' },
    });
  }
}