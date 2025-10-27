import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ description: 'Indicates if the operation was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response data', required: false })
  data?: T;

  @ApiProperty({ description: 'Success message', required: false })
  message?: string;

  @ApiProperty({ description: 'Error information', required: false })
  error?: {
    code: string;
    message: string;
  };
}

export class PaginatedResponseDto<T = any> extends ApiResponseDto<T> {
  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10,
    },
  })
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ErrorResponseDto {
  @ApiProperty({ description: 'Indicates the operation failed', example: false })
  success: boolean;

  @ApiProperty({
    description: 'Error details',
    example: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
    },
  })
  error: {
    code: string;
    message: string;
  };
}

export class UnauthorizedResponseDto {
  @ApiProperty({ description: 'Indicates the operation failed', example: false })
  success: boolean = false;

  @ApiProperty({
    description: 'Unauthorized error',
    example: {
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    },
  })
  error: {
    code: 'UNAUTHORIZED';
    message: string;
  };
}

export class NotFoundResponseDto {
  @ApiProperty({ description: 'Indicates the operation failed', example: false })
  success: boolean = false;

  @ApiProperty({
    description: 'Not found error',
    example: {
      code: 'NOT_FOUND',
      message: 'Resource not found',
    },
  })
  error: {
    code: 'NOT_FOUND';
    message: string;
  };
}

export class ValidationErrorResponseDto {
  @ApiProperty({ description: 'Indicates the operation failed', example: false })
  success: boolean = false;

  @ApiProperty({
    description: 'Validation error',
    example: {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
    },
  })
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
  };
}