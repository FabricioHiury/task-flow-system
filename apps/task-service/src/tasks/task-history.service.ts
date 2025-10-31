import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskHistory, ChangeType } from './task-history.entity';
import { Task } from './task.entity';

@Injectable()
export class TaskHistoryService {
  constructor(
    @InjectRepository(TaskHistory)
    private taskHistoryRepository: Repository<TaskHistory>,
  ) {}

  async createHistoryEntry(
    taskId: string,
    changeType: ChangeType,
    changedBy: string,
    description?: string,
    previousValues?: Record<string, any>,
    newValues?: Record<string, any>,
  ): Promise<TaskHistory> {
    if (!changedBy || changedBy.trim() === '') {
      throw new Error('changedBy field is required and cannot be empty');
    }

    const historyEntry = this.taskHistoryRepository.create({
      taskId,
      changeType,
      changedBy: changedBy.trim(),
      description,
      previousValues,
      newValues,
    });

    return this.taskHistoryRepository.save([historyEntry])[0];
  }

  async getTaskHistory(taskId: string): Promise<TaskHistory[]> {
    return this.taskHistoryRepository.find({
      where: { taskId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async logTaskCreation(task: Task, createdBy: string): Promise<void> {
    await this.createHistoryEntry(
      task.id.toString(),
      ChangeType.CREATED,
      createdBy,
      `Task "${task.title}" was created`,
      undefined,
      {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        deadline: task.deadline,
      },
    );
  }

  async logTaskUpdate(
    taskId: string,
    previousTask: Partial<Task>,
    updatedTask: Partial<Task>,
    updatedBy: string,
  ): Promise<void> {
    const changes: string[] = [];
    const previousValues: Record<string, any> = {};
    const newValues: Record<string, any> = {};

    // Check for status change
    if (previousTask.status !== updatedTask.status) {
      changes.push(
        `status changed from "${previousTask.status}" to "${updatedTask.status}"`,
      );
      previousValues.status = previousTask.status;
      newValues.status = updatedTask.status;

      await this.createHistoryEntry(
        taskId,
        ChangeType.STATUS_CHANGED,
        updatedBy,
        `Status changed from "${previousTask.status}" to "${updatedTask.status}"`,
        { status: previousTask.status },
        { status: updatedTask.status },
      );
    }

    // Check for assignment change
    if (previousTask.assignedTo !== updatedTask.assignedTo) {
      if (previousTask.assignedTo && !updatedTask.assignedTo) {
        changes.push('task was unassigned');
        await this.createHistoryEntry(
          taskId,
          ChangeType.UNASSIGNED,
          updatedBy,
          'Task was unassigned',
          { assignedTo: previousTask.assignedTo },
          { assignedTo: null },
        );
      } else if (!previousTask.assignedTo && updatedTask.assignedTo) {
        changes.push(`task was assigned to user ${updatedTask.assignedTo}`);
        await this.createHistoryEntry(
          taskId,
          ChangeType.ASSIGNED,
          updatedBy,
          `Task was assigned to user ${updatedTask.assignedTo}`,
          { assignedTo: null },
          { assignedTo: updatedTask.assignedTo },
        );
      } else {
        changes.push(
          `assignment changed from user ${previousTask.assignedTo} to user ${updatedTask.assignedTo}`,
        );
        await this.createHistoryEntry(
          taskId,
          ChangeType.ASSIGNED,
          updatedBy,
          `Assignment changed from user ${previousTask.assignedTo} to user ${updatedTask.assignedTo}`,
          { assignedTo: previousTask.assignedTo },
          { assignedTo: updatedTask.assignedTo },
        );
      }
      previousValues.assignedTo = previousTask.assignedTo;
      newValues.assignedTo = updatedTask.assignedTo;
    }

    // Check for priority change
    if (previousTask.priority !== updatedTask.priority) {
      changes.push(
        `priority changed from "${previousTask.priority}" to "${updatedTask.priority}"`,
      );
      previousValues.priority = previousTask.priority;
      newValues.priority = updatedTask.priority;

      await this.createHistoryEntry(
        taskId,
        ChangeType.PRIORITY_CHANGED,
        updatedBy,
        `Priority changed from "${previousTask.priority}" to "${updatedTask.priority}"`,
        { priority: previousTask.priority },
        { priority: updatedTask.priority },
      );
    }

    // Check for deadline change
    if (previousTask.deadline !== updatedTask.deadline) {
      const prevDeadline = previousTask.deadline
        ? previousTask.deadline instanceof Date
          ? previousTask.deadline.toISOString()
          : new Date(previousTask.deadline).toISOString()
        : 'none';
      const newDeadline = updatedTask.deadline
        ? updatedTask.deadline instanceof Date
          ? updatedTask.deadline.toISOString()
          : new Date(updatedTask.deadline).toISOString()
        : 'none';
      changes.push(`deadline changed from ${prevDeadline} to ${newDeadline}`);
      previousValues.deadline = previousTask.deadline;
      newValues.deadline = updatedTask.deadline;

      await this.createHistoryEntry(
        taskId,
        ChangeType.DEADLINE_CHANGED,
        updatedBy,
        `Deadline changed from ${prevDeadline} to ${newDeadline}`,
        { deadline: previousTask.deadline },
        { deadline: updatedTask.deadline },
      );
    }

    // Check for title or description changes
    if (
      previousTask.title !== updatedTask.title ||
      previousTask.description !== updatedTask.description
    ) {
      const titleChanged = previousTask.title !== updatedTask.title;
      const descriptionChanged =
        previousTask.description !== updatedTask.description;

      if (titleChanged) {
        changes.push(
          `title changed from "${previousTask.title}" to "${updatedTask.title}"`,
        );
        previousValues.title = previousTask.title;
        newValues.title = updatedTask.title;
      }

      if (descriptionChanged) {
        changes.push('description was updated');
        previousValues.description = previousTask.description;
        newValues.description = updatedTask.description;
      }

      if (changes.length > 0) {
        await this.createHistoryEntry(
          taskId,
          ChangeType.UPDATED,
          updatedBy,
          changes.join(', '),
          previousValues,
          newValues,
        );
      }
    }
  }

  async logTaskDeletion(task: Task, deletedBy: string): Promise<void> {
    await this.createHistoryEntry(
      task.id.toString(),
      ChangeType.DELETED,
      deletedBy,
      `Task "${task.title}" was deleted`,
      {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo,
        deadline: task.deadline,
      },
      undefined,
    );
  }
}
