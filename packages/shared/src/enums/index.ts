export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  TASK_STATUS_CHANGED = 'TASK_STATUS_CHANGED',
  NEW_COMMENT = 'NEW_COMMENT',
}