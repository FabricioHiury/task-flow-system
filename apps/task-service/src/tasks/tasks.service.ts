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

  async create(createTaskDto: CreateTaskDto, userId: number): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      createdBy: userId,
    });

    const savedTask = await this.taskRepository.save(task);

    // Log task creation in history
    await this.taskHistoryService.logTaskCreation(savedTask, userId);

    // Emit event for task creation
    this.rabbitClient.emit('task.created', {
      taskId: savedTask.id,
      title: savedTask.title,
      assignedTo: savedTask.assignedTo,
      createdBy: savedTask.createdBy,
      createdAt: savedTask.createdAt,
    });

    return savedTask;
  }

  async findAll(
    paginationDto: PaginationDto,
    userId?: number,
  ): Promise<{ tasks: Task[]; total: number }> {
    const { page = 1, size = 10 } = paginationDto;
    const skip = (page - 1) * size;

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.comments', 'comments')
      .orderBy('task.createdAt', 'DESC');

    if (userId) {
      queryBuilder.where(
        'task.createdBy = :userId OR task.assignedTo = :userId',
        { userId },
      );
    }

    const [tasks, total] = await queryBuilder
      .skip(skip)
      .take(size)
      .getManyAndCount();

    return { tasks, total };
  }

  async findOne(id: number, userId?: number): Promise<Task> {
    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.comments', 'comments')
      .where('task.id = :id', { id });

    if (userId) {
      queryBuilder.andWhere(
        '(task.createdBy = :userId OR task.assignedTo = :userId)',
        { userId },
      );
    }

    const task = await queryBuilder.getOne();

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    userId: number,
  ): Promise<Task> {
    const task = await this.findOne(id, userId);

    // Store previous values for history
    const previousTask = { ...task };
    const previousStatus = task.status;
    Object.assign(task, updateTaskDto);

    const updatedTask = await this.taskRepository.save(task);

    // Log task update in history
    await this.taskHistoryService.logTaskUpdate(
      id,
      previousTask,
      updatedTask,
      userId,
    );

    // Emit event for task update
    this.rabbitClient.emit('task.updated', {
      taskId: updatedTask.id,
      title: updatedTask.title,
      previousStatus,
      newStatus: updatedTask.status,
      assignedTo: updatedTask.assignedTo,
      updatedBy: userId,
      updatedAt: updatedTask.updatedAt,
    });

    return updatedTask;
  }

  async remove(id: number, userId: number): Promise<void> {
    const task = await this.findOne(id, userId);

    // Log task deletion in history before removing
    await this.taskHistoryService.logTaskDeletion(task, userId);

    await this.taskRepository.remove(task);

    // Emit event for task deletion
    this.rabbitClient.emit('task.deleted', {
      taskId: id,
      title: task.title,
      deletedBy: userId,
      deletedAt: new Date(),
    });
  }

  async findByStatus(status: TaskStatus, userId?: number): Promise<Task[]> {
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

  async getTaskHistory(taskId: number, userId?: number): Promise<any[]> {
    // Verify user has access to the task
    if (userId) {
      await this.findOne(taskId, userId);
    }
    
    return this.taskHistoryService.getTaskHistory(taskId);
  }

  async findByAssignee(assigneeId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { assignedTo: assigneeId },
      relations: ['comments'],
      order: { createdAt: 'DESC' },
    });
  }
}