import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, timeout, catchError, throwError } from 'rxjs';

export interface CreateTaskDto {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date;
  tags?: string[];
  createdBy?: string;
  token?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
  assigneeId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: Date;
  tags?: string[];
  updatedBy?: string;
  token?: string;
}

export interface TaskFilters {
  projectId?: string;
  assigneeId?: string;
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
  userId?: string;
  token?: string;
}

@Injectable()
export class TaskServiceClient {
  private readonly logger = new Logger(TaskServiceClient.name);

  constructor(@Inject('TASK_SERVICE') private client: ClientProxy) {}

  createTask(createTaskDto: CreateTaskDto): Observable<any> {
    this.logger.log(`Creating task: ${createTaskDto.title}`);
    return this.client.send('task.create', createTaskDto).pipe(
      timeout(10000),
      catchError((error) => {
        this.logger.error(`Failed to create task: ${error.message}`);
        return throwError(() => error);
      }),
    );
  }

  updateTask(taskId: string, updateTaskDto: UpdateTaskDto): Observable<any> {
    this.logger.log(`Updating task: ${taskId}`);
    return this.client.send('task.update', { taskId, ...updateTaskDto }).pipe(
      timeout(10000),
      catchError((error) => {
        this.logger.error(`Failed to update task ${taskId}: ${error.message}`);
        return throwError(() => error);
      }),
    );
  }

  deleteTask(taskId: string, userId: string): Observable<any> {
    this.logger.log(`Deleting task: ${taskId} by user: ${userId}`);
    return this.client.send('task.delete', { taskId, userId }).pipe(
      timeout(10000),
      catchError((error) => {
        this.logger.error(`Failed to delete task ${taskId}: ${error.message}`);
        return throwError(() => error);
      }),
    );
  }

  getTask(taskId: string, token?: string): Observable<any> {
    this.logger.log(`Getting task: ${taskId}`);
    return this.client.send('task.get', { taskId, token }).pipe(
      timeout(10000),
      catchError((error) => {
        this.logger.error(`Failed to get task ${taskId}: ${error.message}`);
        return throwError(() => error);
      }),
    );
  }

  getTasks(filters: TaskFilters = {}): Observable<any> {
    this.logger.log(`Getting tasks with filters: ${JSON.stringify(filters)}`);
    return this.client.send('task.list', filters).pipe(
      timeout(10000),
      catchError((error) => {
        this.logger.error(`Failed to get tasks: ${error.message}`);
        return throwError(() => error);
      }),
    );
  }

  assignTask(taskId: string, assigneeId: string, token?: string): Observable<any> {
    this.logger.log(`Assigning task ${taskId} to user ${assigneeId}`);
    return this.client.send('task.assign', { taskId, assigneeId, token }).pipe(
      timeout(10000),
      catchError((error) => {
        this.logger.error(`Failed to assign task ${taskId}: ${error.message}`);
        return throwError(() => error);
      }),
    );
  }

  // Método para adicionar comentário
  addComment(
    taskId: string,
    content: string,
    authorId: string,
    token?: string,
  ): Observable<any> {
    this.logger.log(`Adding comment to task: ${taskId}`);
    return this.client
      .send('task.comment.create', { taskId, content, authorId, token })
      .pipe(
        timeout(10000),
        catchError((error) => {
          this.logger.error(
            `Failed to add comment to task ${taskId}: ${error.message}`,
          );
          return throwError(() => error);
        }),
      );
  }

  // Método para obter comentários de uma tarefa
  getComments(taskId: string, token?: string): Observable<any> {
    this.logger.log(`Getting comments for task: ${taskId}`);
    return this.client.send('task.comment.list', { taskId, token }).pipe(
      timeout(10000),
      catchError((error) => {
        this.logger.error(
          `Failed to get comments for task ${taskId}: ${error.message}`,
        );
        return throwError(() => error);
      }),
    );
  }
}
