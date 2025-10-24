import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Notification } from '../notifications/notification.entity';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WSGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;

      this.connectedUsers.set(payload.sub, client.id);

      this.logger.log(`User ${payload.sub} connected with socket ${client.id}`);

      // Enviar confirmação de conexão
      client.emit('connected', { userId: payload.sub });
    } catch (error) {
      this.logger.error(
        `Authentication failed for client ${client.id}:`,
        error.message,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!client.userId) return;

    client.join(data.room);
    this.logger.log(`User ${client.userId} joined room ${data.room}`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!client.userId) return;

    client.leave(data.room);
    this.logger.log(`User ${client.userId} left room ${data.room}`);
  }

  // Método para enviar notificação para um usuário específico
  sendNotificationToUser(userId: string, notification: Notification) {
    const socketId = this.connectedUsers.get(userId);

    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
      this.logger.log(`Notification sent to user ${userId}`);
    } else {
      this.logger.log(
        `User ${userId} not connected, notification will be stored`,
      );
    }
  }

  // Método para enviar notificação para uma sala
  sendNotificationToRoom(room: string, notification: Notification) {
    this.server.to(room).emit('notification', notification);
    this.logger.log(`Notification sent to room ${room}`);
  }

  // Método para broadcast geral
  broadcastNotification(notification: Notification) {
    this.server.emit('notification', notification);
    this.logger.log('Notification broadcasted to all connected users');
  }
}