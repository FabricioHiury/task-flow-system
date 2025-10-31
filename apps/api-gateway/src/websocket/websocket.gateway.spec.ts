import { Test, TestingModule } from '@nestjs/testing';
import { WebSocketNotificationGateway } from './websocket.gateway';
import { NotificationService } from './services/notification.service';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { JoinRoomDto } from './dto/join-room.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { TaskUpdateDto } from './dto/task-update.dto';
import { CommentUpdateDto } from './dto/comment-update.dto';
import { NotificationType, EntityType, TaskStatus } from './dto/enums';

describe('WebSocketNotificationGateway', () => {
  let gateway: WebSocketNotificationGateway;
  let notificationService: NotificationService;
  let jwtService: JwtService;

  const mockNotificationService = {
    createAndSendNotification: jest.fn(),
    getPendingNotifications: jest.fn(),
    getAllNotifications: jest.fn(),
    markAsRead: jest.fn(),
    deleteNotification: jest.fn(),
    getUnreadCount: jest.fn(),
  };

  const mockJwtService = {
    verifyAsync: jest.fn(),
  };

  const mockSocket = {
    id: 'socket-123',
    join: jest.fn(),
    leave: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    handshake: {
      auth: {
        token: 'valid-jwt-token',
      },
    },
    data: {},
  } as any as Socket;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebSocketNotificationGateway,
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    gateway = module.get<WebSocketNotificationGateway>(WebSocketNotificationGateway);
    notificationService = module.get<NotificationService>(NotificationService);
    jwtService = module.get<JwtService>(JwtService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should authenticate user and join user room', async () => {
      const mockPayload = { sub: 'user-123', username: 'testuser' };
      mockJwtService.verifyAsync.mockResolvedValue(mockPayload);
      mockNotificationService.getPendingNotifications.mockResolvedValue([]);

      await gateway.handleConnection(mockSocket);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-jwt-token');
      expect(mockSocket.join).toHaveBeenCalledWith('user:user-123');
      expect(mockSocket.data.userId).toBe('user-123');
    });

    it('should disconnect socket on invalid token', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await gateway.handleConnection(mockSocket);

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('should disconnect socket when no token provided', async () => {
      const socketWithoutToken = {
        ...mockSocket,
        handshake: { auth: {} },
      } as any as Socket;

      await gateway.handleConnection(socketWithoutToken);

      expect(socketWithoutToken.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle user disconnection', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Simulate connected user
      gateway['connectedUsers'].set('socket-123', {
        userId: 'user-123',
        rooms: new Set(),
      });

      gateway.handleDisconnect(mockSocket);

      expect(gateway['connectedUsers'].has('socket-123')).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('handleJoinRoom', () => {
    it('should join user to specified room', async () => {
      const joinRoomDto: JoinRoomDto = { room: 'project-456' };
      
      const mockSocket = {
        id: 'socket-123',
        join: jest.fn(),
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
        disconnect: jest.fn(),
      } as any;

      // Simulate connected user
      gateway['connectedUsers'].set('socket-123', {
        userId: 'user-123',
        rooms: new Set(),
      });

      await gateway.handleJoinRoom(joinRoomDto, mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith('project-456');
      expect(mockSocket.to).toHaveBeenCalledWith('project-456');
      expect(mockSocket.emit).toHaveBeenCalledWith('user-joined', {
        userId: 'user-123',
        room: 'project-456',
        timestamp: expect.any(String),
      });
    });
  });

  describe('handleLeaveRoom', () => {
    it('should leave room and notify others', async () => {
      const mockSocket = {
        id: 'socket-123',
        leave: jest.fn(),
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
        disconnect: jest.fn(),
      } as any;

      // Setup connected user
      gateway['connectedUsers'].set('socket-123', {
        userId: 'user-123',
        rooms: new Set(['project-456']),
      });

      await gateway.handleLeaveRoom({ room: 'project-456' }, mockSocket);

      expect(mockSocket.leave).toHaveBeenCalledWith('project-456');
      expect(mockSocket.to).toHaveBeenCalledWith('project-456');
      expect(mockSocket.emit).toHaveBeenCalledWith('user-left', {
        userId: 'user-123',
        room: 'project-456',
        timestamp: expect.any(String),
      });
    });
  });

  describe('handleSendNotification', () => {
    it('should create and send notification successfully', async () => {
      const sendNotificationDto: SendNotificationDto = {
        type: NotificationType.TASK_ASSIGNED,
        title: 'Nova tarefa atribuída',
        message: 'Você foi atribuído a uma nova tarefa',
        recipientId: 'user-456',
        entityType: EntityType.TASK,
        entityId: 'task-789',
        metadata: { taskName: 'Implementar feature' },
      };

      const mockSocket = {
        id: 'socket-123',
        disconnect: jest.fn(),
      } as any;

      // Setup connected user
      gateway['connectedUsers'].set('socket-123', {
        userId: 'user-123',
        rooms: new Set(),
      });

      await gateway.handleSendNotification(sendNotificationDto, mockSocket);

      expect(mockNotificationService.createAndSendNotification).toHaveBeenCalledWith({
        ...sendNotificationDto,
        senderId: 'user-123',
      });
    });
  });

  describe('emitTaskUpdate', () => {
    beforeEach(() => {
      gateway.server = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;
    });

    it('should emit task update to project room', async () => {
         const taskUpdate: TaskUpdateDto = {
           taskId: 'task-123',
           projectId: 'project-456',
           title: 'Task Updated',
           status: TaskStatus.IN_PROGRESS,
           assigneeId: 'user-789',
           updatedBy: 'user-123',
         };

         await gateway.emitTaskUpdate(taskUpdate);

         expect(gateway.server.to).toHaveBeenCalledWith(`project:project-456`);
         expect(gateway.server.emit).toHaveBeenCalledWith('task-updated', expect.objectContaining({
           ...taskUpdate,
           timestamp: expect.any(String),
         }));
       });
  });

  describe('emitCommentUpdate', () => {
    beforeEach(() => {
      gateway.server = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;
    });

    it('should emit comment update to task room', async () => {
       const commentUpdate: CommentUpdateDto = {
         commentId: 'comment-123',
         taskId: 'task-456',
         content: 'New comment',
         authorId: 'user-789',
         authorName: 'João Silva',
         createdAt: '2024-01-15T10:30:00.000Z',
       };

       await gateway.emitCommentUpdate(commentUpdate);

       expect(gateway.server.to).toHaveBeenCalledWith(`task:task-456`);
       expect(gateway.server.emit).toHaveBeenCalledWith('comment-updated', expect.objectContaining({
         ...commentUpdate,
         timestamp: expect.any(String),
       }));
     });
  });

  describe('emitUserNotification', () => {
    beforeEach(() => {
      gateway.server = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;
    });

    it('should emit notification to specific user', async () => {
      const notification = {
        id: 'notification-123',
        type: NotificationType.TASK_ASSIGNED,
        title: 'Nova tarefa',
        message: 'Mensagem de teste',
        recipientId: 'user-456',
        isRead: false,
        createdAt: new Date(),
      };

      await gateway.emitUserNotification('user-456', notification);

      expect(gateway.server.to).toHaveBeenCalledWith('user:user-456');
      expect(gateway.server.emit).toHaveBeenCalledWith('notification', expect.objectContaining({
        ...notification,
        timestamp: expect.any(String),
      }));
    });
  });

  describe('emitToRoom', () => {
    beforeEach(() => {
      gateway.server = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      } as any;
    });

    it('should emit event to specific room', async () => {
      const data = { message: 'Test data' };

      await gateway.emitToRoom('project-789', 'custom-event', data);

      expect(gateway.server.to).toHaveBeenCalledWith('project-789');
      expect(gateway.server.emit).toHaveBeenCalledWith('custom-event', expect.objectContaining({
        ...data,
        timestamp: expect.any(String),
      }));
    });
  });

  describe('getConnectedUsersCount', () => {
    it('should return connected users count', () => {
      gateway['connectedUsers'].set('socket-1', { userId: 'user-1', rooms: new Set() });
      gateway['connectedUsers'].set('socket-2', { userId: 'user-2', rooms: new Set() });

      const count = gateway.getConnectedUsersCount();

      expect(count).toBe(2);
    });
  });
});