import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<SuccessResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = request['requestId'];

    return next.handle().pipe(
      map((data) => {
        // Se a resposta já está no formato padronizado, retorna como está
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        const response: SuccessResponse<T> = {
          success: true,
          data,
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
          },
        };

        // Adicionar paginação se presente nos dados
        if (data && typeof data === 'object' && 'pagination' in data) {
          response.meta!.pagination = data.pagination;
          response.data = data.data || data.items || data.results;
        }

        return response;
      }),
    );
  }
}