import { registerAs } from '@nestjs/config';
import { envConfig } from './env.config';

export const configuration = registerAs('app', () => ({
  NODE_ENV: envConfig.nodeEnv,
  API_GATEWAY_PORT: envConfig.port,
  RATE_LIMIT_TTL: envConfig.rateLimitTtl,
  RATE_LIMIT_LIMIT: envConfig.rateLimitLimit,
  CORS_ORIGINS: envConfig.corsOrigins.join(','),
}));

export const databaseConfig = registerAs('database', () => ({
  type: 'postgres' as const,
  url: envConfig.databaseUrl,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: envConfig.isDevelopment, // Apenas em desenvolvimento
  logging: envConfig.isDevelopment,
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
  migrationsRun: envConfig.isProduction, // Auto-run migrations em produção
  ssl: envConfig.isProduction ? { rejectUnauthorized: false } : false,
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: envConfig.jwtSecret,
  refreshSecret: envConfig.jwtRefreshSecret,
  signOptions: {
    expiresIn: '15m', // Access token expira em 15 minutos
  },
  refreshSignOptions: {
    expiresIn: '7d', // Refresh token expira em 7 dias
  },
}));