import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenInvalidationService } from '../../auth/token-invalidation.service';

interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  exp?: number;
  iat?: number;
  name?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenInvalidationService: TokenInvalidationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    try {
      // 1. Extrair token do header Authorization
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        this.logger.warn('Token não encontrado no header Authorization');
        throw new UnauthorizedException('Token de acesso requerido');
      }

      // 2. Verificar se o token foi invalidado
      if (this.tokenInvalidationService.isTokenInvalidated(token)) {
        this.logger.warn('Tentativa de uso de token invalidado');
        throw new UnauthorizedException('Token foi invalidado');
      }

      // 3. Verificar formato básico do JWT (3 partes separadas por pontos)
      if (!this.isValidJwtFormat(token)) {
        this.logger.warn('Token com formato inválido');
        throw new UnauthorizedException('Formato de token inválido');
      }

      // 4. Verificar e decodificar o token
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      // 5. Validações adicionais do payload
      this.validatePayload(payload);

      // 6. Anexar informações do usuário à requisição
      request.user = payload;

      this.logger.log(`Usuário autenticado: ${payload.sub} (${payload.email})`);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(
        `Erro na autenticação JWT: ${(error as Error).message}`,
      );
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers?.authorization;
    this.logger.debug(`Authorization header: ${authHeader}`);
    
    if (!authHeader || typeof authHeader !== 'string') {
      this.logger.warn('Authorization header não encontrado ou não é string');
      return undefined;
    }

    const parts = authHeader.split(' ');
    this.logger.debug(`Authorization parts: ${JSON.stringify(parts)}`);
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      this.logger.warn(`Formato de Authorization inválido. Esperado: 'Bearer <token>', recebido: '${authHeader}'`);
      return undefined;
    }

    const token = parts[1];
    this.logger.debug(`Token extraído: ${token.substring(0, 20)}...`);
    return token;
  }

  private isValidJwtFormat(token: string): boolean {
    const parts = token.split('.');
    this.logger.debug(`Token parts count: ${parts.length}`);
    this.logger.debug(`Token parts lengths: [${parts.map(p => p.length).join(', ')}]`);
    
    if (parts.length !== 3) {
      this.logger.warn(`Token JWT deve ter 3 partes separadas por ponto, mas tem ${parts.length}`);
      return false;
    }
    
    return true;
  }

  private validatePayload(payload: JwtPayload): void {
    // Verificar campos obrigatórios
    if (!payload.sub || !payload.email || !payload.username) {
      this.logger.warn(
        `Payload inválido - campos obrigatórios ausentes: sub=${payload.sub}, email=${payload.email}, username=${payload.username}`,
      );
      throw new UnauthorizedException('Payload do token inválido');
    }

    // Verificar expiração (redundante, mas adiciona log)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      this.logger.warn(`Token expirado: exp=${payload.exp}, now=${now}`);
      throw new UnauthorizedException('Token expirado');
    }

    // Verificar se o token não foi emitido no futuro
    if (payload.iat && payload.iat > now + 60) {
      // 60 segundos de tolerância
      this.logger.warn(
        `Token emitido no futuro: iat=${payload.iat}, now=${now}`,
      );
      throw new UnauthorizedException('Token inválido');
    }

    // Verificar se o usuário existe (validação básica do ID)
    if (typeof payload.sub !== 'string' || payload.sub.trim().length === 0) {
      this.logger.warn(`ID de usuário inválido: ${payload.sub}`);
      throw new UnauthorizedException('ID de usuário inválido');
    }

    // Validar formato do email
    if (payload.name && typeof payload.name !== 'string') {
      this.logger.warn(`Nome de usuário inválido: ${payload.name}`);
      throw new UnauthorizedException('Nome de usuário inválido');
    }
  }
}
