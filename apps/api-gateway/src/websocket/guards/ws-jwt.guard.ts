import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private readonly logger = new Logger(WsJwtGuard.name);

  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient();
      const token = this.extractTokenFromSocket(client);

      if (!token) {
        throw new WsException('No token provided');
      }

      const payload = await this.jwtService.verifyAsync(token);
      
      // Attach user info to socket data
      client.data.userId = payload.sub;
      client.data.email = payload.email;
      
      return true;
    } catch (error) {
      this.logger.error('WebSocket JWT validation failed:', error.message);
      throw new WsException('Invalid token');
    }
  }

  private extractTokenFromSocket(client: Socket): string | null {
    // Try to get token from auth object first
    if (client.handshake.auth?.token) {
      return client.handshake.auth.token;
    }

    // Try to get token from authorization header
    const authHeader = client.handshake.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try to get token from query parameters
    if (client.handshake.query?.token) {
      return Array.isArray(client.handshake.query.token) 
        ? client.handshake.query.token[0] 
        : client.handshake.query.token;
    }

    return null;
  }
}