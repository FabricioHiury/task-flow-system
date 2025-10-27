import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params, headers } = request;
    
    // Gerar ID único para rastreamento da requisição
    const requestId = uuidv4();
    request['requestId'] = requestId;
    response.setHeader('X-Request-ID', requestId);

    const userAgent = headers['user-agent'] || '';
    const ip = request.ip || request.connection.remoteAddress;
    
    const startTime = Date.now();

    // Log da requisição
    this.logger.log({
      message: 'Incoming request',
      requestId,
      method,
      url,
      userAgent,
      ip,
      body: this.sanitizeBody(body),
      query,
      params,
      timestamp: new Date().toISOString(),
    });

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Log da resposta bem-sucedida
        this.logger.log({
          message: 'Request completed',
          requestId,
          method,
          url,
          statusCode: response.statusCode,
          duration: `${duration}ms`,
          responseSize: JSON.stringify(data).length,
          timestamp: new Date().toISOString(),
        });
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        // Log do erro
        this.logger.error({
          message: 'Request failed',
          requestId,
          method,
          url,
          error: error.message,
          stack: error.stack,
          statusCode: error.status || 500,
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        });

        throw error;
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
    const sanitized = { ...body };

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }
}