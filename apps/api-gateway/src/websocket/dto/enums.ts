export enum NotificationType {
  TASK_ASSIGNED = 'task_assigned',
  TASK_UPDATED = 'task_updated',
  TASK_COMPLETED = 'task_completed',
  COMMENT_ADDED = 'comment_added',
  PROJECT_INVITATION = 'project_invitation',
  DEADLINE_REMINDER = 'deadline_reminder',
}

export enum EntityType {
  TASK = 'task',
  PROJECT = 'project',
  COMMENT = 'comment',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  DONE = 'done',
  CANCELLED = 'cancelled',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}