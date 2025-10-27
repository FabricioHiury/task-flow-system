import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsJwtGuard } from './guards/ws-jwt.guard';
import { NotificationService } from './services/notification.service';
import { 
  JoinRoomDto, 
  LeaveRoomDto, 
  SendNotificationDto,
  TaskUpdateDto,
  CommentUpdateDto 
} from './dto';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/notifications',
})
export class WebSocketNotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketNotificationGateway.name);
  private connectedUsers = new Map<string, { userId: string; rooms: Set<string> }>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractTokenFromSocket(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      this.connectedUsers.set(client.id, {
        userId,
        rooms: new Set(),
      });

      client.data.userId = userId;
      
      // Join user to their personal room for direct notifications
      await client.join(`user:${userId}`);
      
      this.logger.log(`User ${userId} connected with socket ${client.id}`);
      
      // Send pending notifications
      await this.sendPendingNotifications(client, userId);
      
    } catch (error) {
      this.logger.error(`Authentication failed for socket ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userInfo = this.connectedUsers.get(client.id);
    if (userInfo) {
      this.logger.log(`User ${userInfo.userId} disconnected (socket: ${client.id})`);
      this.connectedUsers.delete(client.id);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) return;

    await client.join(data.room);
    userInfo.rooms.add(data.room);
    
    this.logger.log(`User ${userInfo.userId} joined room: ${data.room}`);
    
    // Notify others in the room
    client.to(data.room).emit('user-joined', {
      userId: userInfo.userId,
      room: data.room,
      timestamp: new Date().toISOString(),
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave-room')
  async handleLeaveRoom(
    @MessageBody() data: LeaveRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) return;

    await client.leave(data.room);
    userInfo.rooms.delete(data.room);
    
    this.logger.log(`User ${userInfo.userId} left room: ${data.room}`);
    
    // Notify others in the room
    client.to(data.room).emit('user-left', {
      userId: userInfo.userId,
      room: data.room,
      timestamp: new Date().toISOString(),
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send-notification')
  async handleSendNotification(
    @MessageBody() data: SendNotificationDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userInfo = this.connectedUsers.get(client.id);
    if (!userInfo) return;

    await this.notificationService.createAndSendNotification({
      ...data,
      senderId: userInfo.userId,
    });
  }

  // Public methods for external services to emit events
  async emitTaskUpdate(taskUpdate: TaskUpdateDto) {
    this.server.to(`project:${taskUpdate.projectId}`).emit('task-updated', {
      ...taskUpdate,
      timestamp: new Date().toISOString(),
    });
    
    this.logger.log(`Task update emitted to project:${taskUpdate.projectId}`);
  }

  async emitCommentUpdate(commentUpdate: CommentUpdateDto) {
    this.server.to(`task:${commentUpdate.taskId}`).emit('comment-updated', {
      ...commentUpdate,
      timestamp: new Date().toISOString(),
    });
    
    this.logger.log(`Comment update emitted to task:${commentUpdate.taskId}`);
  }

  async emitUserNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
    
    this.logger.log(`Notification sent to user:${userId}`);
  }

  async emitToRoom(room: string, event: string, data: any) {
    this.server.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
    
    this.logger.log(`Event '${event}' emitted to room: ${room}`);
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get users in specific room
  async getUsersInRoom(room: string): Promise<string[]> {
    const sockets = await this.server.in(room).fetchSockets();
    return sockets.map(socket => socket.data.userId).filter(Boolean);
  }

  private extractTokenFromSocket(client: Socket): string | null {
    const token = client.handshake.auth?.token || 
                 client.handshake.headers?.authorization?.replace('Bearer ', '');
    return token || null;
  }

  private async sendPendingNotifications(client: Socket, userId: string) {
    try {
      const pendingNotifications = await this.notificationService.getPendingNotifications(userId);
      
      if (pendingNotifications.length > 0) {
        client.emit('pending-notifications', pendingNotifications);
        this.logger.log(`Sent ${pendingNotifications.length} pending notifications to user ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send pending notifications to user ${userId}:`, error.message);
    }
  }
}