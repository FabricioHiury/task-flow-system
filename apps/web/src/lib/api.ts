import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await authService.refreshToken(refreshToken);
          
          localStorage.setItem('token', response.access_token);
          localStorage.setItem('refreshToken', response.refresh_token);
          
          api.defaults.headers.common.Authorization = `Bearer ${response.access_token}`;
          
          processQueue(null, response.access_token);
          
          originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Tipos para autenticação
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    fullName?: string;
  };
}

// Serviços de autenticação
export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data.data; 
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data.data; 
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  // Função para fazer logout no backend (invalidar tokens)
  logoutBackend: async (refreshToken?: string) => {
    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Error during backend logout:', error);
    }
  },
};

// Tipos para tarefas
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string[];
  createdBy: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadline?: string;
  assignedUserIds?: string[];
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {}

// Serviços de tarefas
export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data.data.tasks;
  },

  getTask: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data;
  },

  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post('/tasks', data);
    return response.data.data;
  },

  updateTask: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

// Tipos para comentários
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  createdBy: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface CreateCommentRequest {
  content: string;
  taskId: string;
}

// Tipos para histórico de tarefas
export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  changeType: 'created' | 'updated' | 'status_changed' | 'assigned' | 'unassigned' | 'priority_changed' | 'deadline_changed' | 'deleted';
  changedBy: string;
  description: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  createdAt: string;
  user?: User;
}

// Serviços de usuários
export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data.data;
  },

  getUser: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data.data;
  },
};

export interface CreateUserRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

// Serviços de comentários
export const commentService = {
  getComments: async (taskId: string): Promise<Comment[]> => {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data.data.comments;
  },

  createComment: async (data: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post(`/tasks/${data.taskId}/comments`, { content: data.content });
    return response.data.data;
  },

  deleteComment: async (taskId: string, id: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/comments/${id}`);
  },
};

// Tipos para notificações
export interface Notification {
  id: string;
  type: string;
  metadata: {
    title: string;
    message: string;
    taskTitle?: string;
    priority?: string;
    changes?: Record<string, any>;
  };
  recipientId: string;
  senderId?: string;
  entityId?: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getNotificationDisplayType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'task_created': 'TASK_ASSIGNED',
    'task_updated': 'TASK_UPDATED',
    'task_deleted': 'TASK_DELETED',
    'comment_created': 'COMMENT_CREATED',
    'comment_deleted': 'COMMENT_DELETED',
    'system': 'SYSTEM',
  };
  return typeMap[type] || type;
};

export const getNotificationStatus = (isRead: boolean): 'UNREAD' | 'READ' => {
  return isRead ? 'READ' : 'UNREAD';
};

// Serviços de notificações
export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data.data.notifications;
  },

  getUnreadNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/unread');
    return response.data.data.notifications;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread/count');
    return response.data.data?.count || response.data.count || 0;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};

// Serviços de histórico de tarefas
export const taskHistoryService = {
  getTaskHistory: async (taskId: string): Promise<TaskHistory[]> => {
    const response = await api.get(`/tasks/${taskId}/history`);
    return response.data.data;
  },
};

// Funções utilitárias para histórico
export const getHistoryChangeTypeDisplay = (changeType: string): string => {
  const typeMap: Record<string, string> = {
    'created': 'Tarefa Criada',
    'updated': 'Tarefa Atualizada',
    'status_changed': 'Status Alterado',
    'assigned': 'Tarefa Atribuída',
    'unassigned': 'Atribuição Removida',
    'priority_changed': 'Prioridade Alterada',
    'deadline_changed': 'Prazo Alterado',
    'deleted': 'Tarefa Excluída',
  };
  return typeMap[changeType] || changeType;
};

export const getHistoryChangeTypeIcon = (changeType: string): string => {
  const iconMap: Record<string, string> = {
    'created': '✅',
    'updated': '📝',
    'status_changed': '🔄',
    'assigned': '👤',
    'unassigned': '🚫',
    'priority_changed': '⚡',
    'deadline_changed': '📅',
    'deleted': '🗑️',
  };
  return iconMap[changeType] || '📋';
};