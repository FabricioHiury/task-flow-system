import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    path: string;
    requestId?: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = request['requestId'];
    const timestamp = new Date().toISOString();
    const path = request.url;

    let status: number;
    let code: string;
    let message: string;
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        code = responseObj.error || exception.constructor.name;
        message = responseObj.message || exception.message;
        details = responseObj.details;
      } else {
        code = exception.constructor.name;
        message = exception.message;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'DATABASE_ERROR';
      message = 'Database operation failed';
      details = process.env.NODE_ENV === 'development' ? exception.message : undefined;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'INTERNAL_SERVER_ERROR';
      message = process.env.NODE_ENV === 'development' 
        ? exception.message 
        : 'Internal server error occurred';
      details = process.env.NODE_ENV === 'development' ? exception.stack : undefined;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = 'UNKNOWN_ERROR';
      message = 'An unexpected error occurred';
    }

    const errorResponse: ErrorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp,
        path,
        requestId,
      },
    };

    // Log do erro
    this.logger.error({
      message: 'Exception caught',
      requestId,
      path,
      method: request.method,
      statusCode: status,
      error: {
        name: exception instanceof Error ? exception.constructor.name : 'Unknown',
        message: exception instanceof Error ? exception.message : 'Unknown error',
        stack: exception instanceof Error ? exception.stack : undefined,
      },
      timestamp,
    });

    response.status(status).json(errorResponse);
  }
}