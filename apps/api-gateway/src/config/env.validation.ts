import { z } from 'zod';

// Schema de validação com Zod
export const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  API_GATEWAY_PORT: z
    .string()
    .default('3000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(65535)),

  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid URI')
    .min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters long'),

  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters long'),

  RATE_LIMIT_TTL: z
    .string()
    .default('60')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  RATE_LIMIT_LIMIT: z
    .string()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173,http://localhost:3000'),
});

// Tipo inferido do schema
export type EnvironmentVariables = z.infer<typeof environmentSchema>;

// Função de validação
export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  try {
    return environmentSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new Error(`Environment validation failed: ${errorMessages}`);
    }
    throw error;
  }
}
