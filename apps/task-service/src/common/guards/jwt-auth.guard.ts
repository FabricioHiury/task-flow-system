import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    let token: string | undefined;

    // Check if it's an RPC context (microservice)
    if (context.getType() === 'rpc') {
      const data = context.switchToRpc().getData();
      token = data?.token;
      if (!token && data?.authorization) {
        token = data.authorization.replace('Bearer ', '');
      }
    } else {
      // HTTP context
      const request = context.switchToHttp().getRequest();
      token = this.extractTokenFromHeader(request);
    }

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      console.log('Verifying token:', token ? 'Token present' : 'No token');
      console.log('JWT_SECRET present:', process.env.JWT_SECRET ? 'Yes' : 'No');
      
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      console.log('Token verified successfully, payload:', payload);
      
      if (context.getType() === 'rpc') {
        // For RPC context, we can't modify the request, so we'll store it in the data
        const data = context.switchToRpc().getData();
        data.user = payload;
      } else {
        const request = context.switchToHttp().getRequest();
        request.user = payload;
      }
    } catch (error) {
      console.log('Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}