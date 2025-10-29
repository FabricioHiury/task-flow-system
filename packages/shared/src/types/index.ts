export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  createdBy: User;
  assignedUsers: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  type: 'TASK_ASSIGNED' | 'TASK_STATUS_CHANGED' | 'NEW_COMMENT';
  message: string;
  userId: string;
  taskId?: string;
  read: boolean;
  createdAt: Date;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}