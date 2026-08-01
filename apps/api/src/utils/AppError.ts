import { ErrorCode } from '@certifychain/shared';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode = 400,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.fieldErrors = fieldErrors;
  }

  static notFound(message = 'Resource not found') {
    return new AppError(ErrorCode.NOT_FOUND, message, 404);
  }
  static unauthorized(message = 'Authentication required') {
    return new AppError(ErrorCode.UNAUTHORIZED, message, 401);
  }
  static forbidden(message = 'You do not have permission to do this') {
    return new AppError(ErrorCode.FORBIDDEN, message, 403);
  }
  static validation(message: string, fieldErrors?: Record<string, string[]>) {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, 422, fieldErrors);
  }
}
