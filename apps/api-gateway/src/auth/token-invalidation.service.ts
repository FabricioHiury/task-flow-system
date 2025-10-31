import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenInvalidationService {
  private readonly logger = new Logger(TokenInvalidationService.name);
  private readonly invalidatedTokens = new Set<string>();
  private readonly tokenExpirations = new Map<string, number>();

  constructor(private readonly jwtService: JwtService) {
    // Limpar tokens expirados a cada 5 minutos
    setInterval(
      () => {
        this.cleanupExpiredTokens();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Invalida um token específico
   */
  invalidateToken(token: string): void {
    try {
      // Decodificar o token para obter a data de expiração
      const decoded = this.jwtService.decode(token);

      if (decoded && decoded.exp) {
        const expirationTime = decoded.exp * 1000; // Converter para milliseconds

        // Adicionar token à lista de invalidados
        this.invalidatedTokens.add(token);
        this.tokenExpirations.set(token, expirationTime);

        this.logger.log(`Token invalidado: ${token.substring(0, 20)}...`);
      }
    } catch (error) {
      this.logger.error(`Erro ao invalidar token: ${error.message}`);
    }
  }

  /**
   * Verifica se um token foi invalidado
   */
  isTokenInvalidated(token: string): boolean {
    return this.invalidatedTokens.has(token);
  }

  /**
   * Invalida todos os tokens de um usuário específico
   */
  invalidateAllUserTokens(userId: string): void {
    const tokensToInvalidate: string[] = [];

    // Encontrar todos os tokens do usuário
    for (const token of this.invalidatedTokens) {
      try {
        const decoded = this.jwtService.decode(token);
        if (decoded && decoded.sub === userId) {
          tokensToInvalidate.push(token);
        }
      } catch (error) {
        // Token inválido, remover da lista
        tokensToInvalidate.push(token);
      }
    }

    // Invalidar tokens encontrados
    tokensToInvalidate.forEach((token) => {
      this.invalidateToken(token);
    });

    this.logger.log(
      `Invalidados ${tokensToInvalidate.length} tokens do usuário: ${userId}`,
    );
  }

  /**
   * Remove tokens expirados da memória
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    const expiredTokens: string[] = [];

    // Encontrar tokens expirados
    for (const [token, expiration] of this.tokenExpirations.entries()) {
      if (expiration < now) {
        expiredTokens.push(token);
      }
    }

    // Remover tokens expirados
    expiredTokens.forEach((token) => {
      this.invalidatedTokens.delete(token);
      this.tokenExpirations.delete(token);
    });

    if (expiredTokens.length > 0) {
      this.logger.log(
        `Removidos ${expiredTokens.length} tokens expirados da memória`,
      );
    }
  }

  /**
   * Obtém estatísticas dos tokens invalidados
   */
  getStats(): { invalidatedCount: number; activeCount: number } {
    this.cleanupExpiredTokens(); // Limpar antes de contar

    return {
      invalidatedCount: this.invalidatedTokens.size,
      activeCount: this.tokenExpirations.size,
    };
  }
}
