import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService, NotificationPayload } from './notification.service';
import { Notification } from '../entities/notification.entity';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: Repository<Notification>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    repository = module.get<Repository<Notification>>(getRepositoryToken(Notification));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAndSendNotification', () => {
    it('should create a notification successfully', async () => {
      const payload: NotificationPayload = {
        type: 'task_assigned',
        title: 'Nova tarefa atribuída',
        message: 'Você foi atribuído a uma nova tarefa',
        recipientId: 'user-123',
        senderId: 'user-456',
        entityId: 'task-789',
        entityType: 'task',
        metadata: { priority: 'high' },
      };

      const mockNotification = {
        id: 'notification-123',
        ...payload,
        isRead: false,
        readAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createAndSendNotification(payload);

      expect(mockRepository.create).toHaveBeenCalledWith({
        type: payload.type,
        title: payload.title,
        message: payload.message,
        recipientId: payload.recipientId,
        senderId: payload.senderId,
        entityId: payload.entityId,
        entityType: payload.entityType,
        metadata: payload.metadata,
        isRead: false,
        createdAt: expect.any(Date),
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockNotification);
      expect(result).toEqual(mockNotification);
    });

    it('should handle creation errors', async () => {
      const payload: NotificationPayload = {
        type: 'task_assigned',
        title: 'Nova tarefa atribuída',
        message: 'Você foi atribuído a uma nova tarefa',
        recipientId: 'user-123',
      };

      mockRepository.create.mockReturnValue(payload);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.createAndSendNotification(payload)).rejects.toThrow('Database error');
    });
  });

  describe('getPendingNotifications', () => {
    it('should return pending notifications for a user', async () => {
      const userId = 'user-123';
      const mockNotifications = [
        {
          id: 'notification-1',
          type: 'task_assigned',
          title: 'Tarefa 1',
          message: 'Mensagem 1',
          recipientId: userId,
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: 'notification-2',
          type: 'comment_added',
          title: 'Comentário',
          message: 'Novo comentário',
          recipientId: userId,
          isRead: false,
          createdAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(mockNotifications);

      const result = await service.getPendingNotifications(userId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { recipientId: userId, isRead: false },
        order: { createdAt: 'DESC' },
        take: 50,
      });
      expect(result).toEqual(mockNotifications);
    });

    it('should return empty array when no notifications found', async () => {
      const userId = 'user-123';
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getPendingNotifications(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getAllNotifications', () => {
    it('should return paginated notifications', async () => {
      const userId = 'user-123';
      const mockNotifications = [
        {
          id: 'notification-1',
          type: 'task_assigned',
          title: 'Tarefa 1',
          message: 'Mensagem 1',
          recipientId: userId,
          isRead: false,
          createdAt: new Date(),
        },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockNotifications, 1]);

      const result = await service.getAllNotifications(userId, 1, 20);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { recipientId: userId },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
      expect(result).toEqual({
        notifications: mockNotifications,
        total: 1,
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read successfully', async () => {
      const notificationId = 'notification-123';
      const userId = 'user-123';
      const mockUpdateResult = { affected: 1 };

      mockRepository.update.mockResolvedValue(mockUpdateResult);

      const result = await service.markAsRead(notificationId, userId);

      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: notificationId, recipientId: userId },
        { isRead: true, readAt: expect.any(Date) },
      );
      expect(result).toBe(true);
    });

    it('should return false when notification not found', async () => {
      const notificationId = 'notification-123';
      const userId = 'user-123';
      const mockUpdateResult = { affected: 0 };

      mockRepository.update.mockResolvedValue(mockUpdateResult);

      const result = await service.markAsRead(notificationId, userId);

      expect(result).toBe(false);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification successfully', async () => {
      const notificationId = 'notification-123';
      const userId = 'user-123';
      const mockDeleteResult = { affected: 1 };

      mockRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.deleteNotification(notificationId, userId);

      expect(mockRepository.delete).toHaveBeenCalledWith({
        id: notificationId,
        recipientId: userId,
      });
      expect(result).toBe(true);
    });

    it('should return false when notification not found', async () => {
      const notificationId = 'notification-123';
      const userId = 'user-123';
      const mockDeleteResult = { affected: 0 };

      mockRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.deleteNotification(notificationId, userId);

      expect(result).toBe(false);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count for user', async () => {
      const userId = 'user-123';
      const expectedCount = 5;

      mockRepository.count.mockResolvedValue(expectedCount);

      const result = await service.getUnreadCount(userId);

      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { recipientId: userId, isRead: false },
      });
      expect(result).toBe(expectedCount);
    });

    it('should return 0 when no unread notifications', async () => {
      const userId = 'user-123';
      mockRepository.count.mockResolvedValue(0);

      const result = await service.getUnreadCount(userId);

      expect(result).toBe(0);
    });
  });

  describe('createTaskAssignedNotification', () => {
    it('should create task assigned notification', async () => {
      const taskId = 'task-123';
      const taskTitle = 'Nova Tarefa';
      const assigneeId = 'user-123';
      const assignerId = 'user-456';

      const mockNotification = {
        id: 'notification-123',
        type: 'task_assigned',
        title: `Tarefa atribuída: ${taskTitle}`,
        message: `Você foi atribuído à tarefa "${taskTitle}"`,
        recipientId: assigneeId,
        senderId: assignerId,
        entityId: taskId,
        entityType: 'task',
        isRead: false,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createTaskAssignedNotification(
        taskId,
        taskTitle,
        assigneeId,
        assignerId,
      );

      expect(result).toEqual(mockNotification);
    });
  });

  describe('createTaskUpdatedNotification', () => {
    it('should create task updated notification', async () => {
      const taskId = 'task-123';
      const taskTitle = 'Tarefa Atualizada';
      const recipientId = 'user-123';
      const updaterId = 'user-456';
      const changes = ['status', 'priority'];

      const mockNotification = {
        id: 'notification-123',
        type: 'task_updated',
        title: `Tarefa atualizada: ${taskTitle}`,
        message: `A tarefa "${taskTitle}" foi atualizada. Campos alterados: ${changes.join(', ')}`,
        recipientId,
        senderId: updaterId,
        entityId: taskId,
        entityType: 'task',
        metadata: { changes },
        isRead: false,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createTaskUpdatedNotification(
        taskId,
        taskTitle,
        recipientId,
        updaterId,
        changes,
      );

      expect(result).toEqual(mockNotification);
    });
  });

  describe('createCommentAddedNotification', () => {
    it('should create comment added notification', async () => {
      const taskId = 'task-123';
      const taskTitle = 'Tarefa com Comentário';
      const recipientId = 'user-123';
      const commenterId = 'user-456';
      const commentPreview = 'Este é um comentário...';

      const mockNotification = {
        id: 'notification-123',
        type: 'comment_added',
        title: `Novo comentário: ${taskTitle}`,
        message: `Novo comentário na tarefa "${taskTitle}": ${commentPreview}`,
        recipientId,
        senderId: commenterId,
        entityId: taskId,
        entityType: 'task',
        isRead: false,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createCommentAddedNotification(
        taskId,
        taskTitle,
        recipientId,
        commenterId,
        commentPreview,
      );

      expect(result).toEqual(mockNotification);
    });
  });

  describe('createDeadlineReminderNotification', () => {
    it('should create deadline reminder notification', async () => {
      const taskId = 'task-123';
      const taskTitle = 'Tarefa com Prazo';
      const recipientId = 'user-123';
      const dueDate = new Date('2024-12-31');

      const mockNotification = {
        id: 'notification-123',
        type: 'deadline_reminder',
        title: `Lembrete de prazo: ${taskTitle}`,
        message: `A tarefa "${taskTitle}" vence em ${dueDate.toLocaleDateString('pt-BR')}`,
        recipientId,
        entityId: taskId,
        entityType: 'task',
        metadata: { dueDate: dueDate.toISOString() },
        isRead: false,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockNotification);
      mockRepository.save.mockResolvedValue(mockNotification);

      const result = await service.createDeadlineReminderNotification(
        taskId,
        taskTitle,
        recipientId,
        dueDate,
      );

      expect(result).toEqual(mockNotification);
    });
  });
});