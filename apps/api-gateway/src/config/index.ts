// Exportações centralizadas das configurações

// Validação de ambiente com Zod
export { environmentSchema, validate } from './env.validation';
export type { EnvironmentVariables } from './env.validation';

// Configuração singleton type-safe
export { envConfig } from './env.config';

// Configurações do NestJS
export { configuration, databaseConfig, jwtConfig } from './configuration';