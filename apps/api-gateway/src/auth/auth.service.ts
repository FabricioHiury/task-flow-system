import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, RegisterDto } from '../users/users.service';
import { User } from '../users/user.entity';

interface JwtPayload {
  sub: number;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await user.validatePassword(password))) {
      return user;
    }
    return null;
  }

  async login(user: User): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async register(registerDto: any): Promise<AuthTokens> {
    const user = await this.usersService.create(registerDto);
    return this.login(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret:
          process.env.JWT_REFRESH_SECRET ||
          'your-super-secret-refresh-key-change-in-production',
      });

      const user = await this.usersService.findById(payload.sub.toString());
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
