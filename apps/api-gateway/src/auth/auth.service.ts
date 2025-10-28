import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/user.entity';
import { TokenInvalidationService } from './token-invalidation.service';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    fullName?: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly tokenInvalidationService: TokenInvalidationService,
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
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  async register(createUserDto: CreateUserDto): Promise<AuthTokens> {
    const user = await this.usersService.create(createUserDto);
    return this.login(user);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
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

  async logout(accessToken: string, refreshToken?: string): Promise<void> {
    try {
      // Invalidar o access token
      this.tokenInvalidationService.invalidateToken(accessToken);
      this.logger.log('Access token invalidado com sucesso');

      // Invalidar o refresh token se fornecido
      if (refreshToken) {
        this.tokenInvalidationService.invalidateToken(refreshToken);
        this.logger.log('Refresh token invalidado com sucesso');
      }
    } catch (error) {
      this.logger.error(`Erro durante logout: ${error.message}`);
      throw new UnauthorizedException('Erro durante logout');
    }
  }

  async logoutAllDevices(userId: string): Promise<void> {
    try {
      // Invalidar todos os tokens do usuário
      this.tokenInvalidationService.invalidateAllUserTokens(userId);
      this.logger.log(
        `Logout realizado em todos os dispositivos para usuário: ${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `Erro durante logout de todos os dispositivos: ${error.message}`,
      );
      throw new UnauthorizedException('Erro durante logout');
    }
  }
}
