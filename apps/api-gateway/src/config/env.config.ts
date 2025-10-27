import { config } from 'dotenv';
import { z } from 'zod';
import { environmentSchema, type EnvironmentVariables } from './env.validation';

config();

/**
 * Configuração centralizada de variáveis de ambiente usando Zod
 * 
 * Este arquivo fornece uma interface type-safe para acessar variáveis de ambiente
 * validadas pelo schema Zod definido em env.validation.ts
 */

class EnvironmentConfig {
  private static instance: EnvironmentConfig;
  private config: EnvironmentVariables;

  private constructor() {
    this.config = this.validateEnvironment();
  }

  public static getInstance(): EnvironmentConfig {
    if (!EnvironmentConfig.instance) {
      EnvironmentConfig.instance = new EnvironmentConfig();
    }
    return EnvironmentConfig.instance;
  }

  private validateEnvironment(): EnvironmentVariables {
    try {
      return environmentSchema.parse(process.env);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join('\n');
        
        console.error('❌ Environment validation failed:');
        console.error(errorMessages);
        process.exit(1);
      }
      throw error;
    }
  }

  // Getters para acessar as variáveis de ambiente de forma type-safe
  get nodeEnv(): EnvironmentVariables['NODE_ENV'] {
    return this.config.NODE_ENV;
  }

  get port(): number {
    return this.config.API_GATEWAY_PORT;
  }

  get databaseUrl(): string {
    return this.config.DATABASE_URL;
  }

  get jwtSecret(): string {
    return this.config.JWT_SECRET;
  }

  get jwtRefreshSecret(): string {
    return this.config.JWT_REFRESH_SECRET;
  }

  get rateLimitTtl(): number {
    return this.config.RATE_LIMIT_TTL;
  }

  get rateLimitLimit(): number {
    return this.config.RATE_LIMIT_LIMIT;
  }

  get corsOrigins(): string[] {
    return this.config.CORS_ORIGINS.split(',').map(origin => origin.trim());
  }

  // Método para verificar se estamos em desenvolvimento
  get isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  // Método para verificar se estamos em produção
  get isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  // Método para verificar se estamos em teste
  get isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  // Método para obter toda a configuração (útil para debugging)
  get all(): EnvironmentVariables {
    return { ...this.config };
  }
}

// Exporta uma instância singleton
export const envConfig = EnvironmentConfig.getInstance();

// Exporta o tipo para uso em outros arquivos
export type { EnvironmentVariables };