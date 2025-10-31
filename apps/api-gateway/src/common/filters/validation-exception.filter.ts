import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse() as any;

    // Se for um erro de validação do class-validator
    if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
      const validationErrors = exceptionResponse.message;

      // Formatando os erros de validação
      const formattedErrors = validationErrors.map((error: string) => ({
        field: this.extractFieldFromError(error),
        message: error,
      }));

      return response.status(status).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados inválidos fornecidos',
          details: formattedErrors,
        },
      });
    }

    // Para outros tipos de BadRequestException
    return response.status(status).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: exceptionResponse.message || 'Requisição inválida',
      },
    });
  }

  private extractFieldFromError(error: string): string {
    if (error.includes('Senha')) return 'password';
    if (error.includes('Nome de usuário')) return 'username';
    if (error.includes('Email')) return 'email';
    if (error.includes('Nome completo')) return 'fullName';

    return 'unknown';
  }
}
