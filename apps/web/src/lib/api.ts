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

// Interceptor para lidar com respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Serviços de autenticação
export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

// Tipos para tarefas
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  assignedToId?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {}

// Serviços de tarefas
export const taskService = {
  getTasks: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data;
  },

  getTask: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  updateTask: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
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
  authorId: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  taskId: string;
}

// Serviços de comentários
export const commentService = {
  getComments: async (taskId: string): Promise<Comment[]> => {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  createComment: async (data: CreateCommentRequest): Promise<Comment> => {
    const response = await api.post('/comments', data);
    return response.data;
  },

  deleteComment: async (id: string): Promise<void> => {
    await api.delete(`/comments/${id}`);
  },
};

// Tipos para notificações
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'COMMENT_ADDED' | 'TASK_DUE_SOON';
  status: 'UNREAD' | 'READ';
  userId: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Serviços de notificações
export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  getUnreadNotifications: async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/unread');
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/notifications/unread/count');
    return response.data.count;
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