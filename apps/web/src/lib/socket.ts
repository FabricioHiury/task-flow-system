import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3002';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  connect(token: string) {
    this.token = token;
    
    this.socket = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Métodos para eventos específicos
  onNotification(callback: (notification: any) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  onTaskUpdate(callback: (task: any) => void) {
    if (this.socket) {
      this.socket.on('task-updated', callback);
    }
  }

  onCommentAdded(callback: (comment: any) => void) {
    if (this.socket) {
      this.socket.on('comment-added', callback);
    }
  }

  // Métodos para emitir eventos
  joinRoom(room: string) {
    if (this.socket) {
      this.socket.emit('join-room', room);
    }
  }

  leaveRoom(room: string) {
    if (this.socket) {
      this.socket.emit('leave-room', room);
    }
  }

  // Remover listeners
  offNotification() {
    if (this.socket) {
      this.socket.off('notification');
    }
  }

  offTaskUpdate() {
    if (this.socket) {
      this.socket.off('task-updated');
    }
  }

  offCommentAdded() {
    if (this.socket) {
      this.socket.off('comment-added');
    }
  }
}

export const socketService = new SocketService();
export default socketService;