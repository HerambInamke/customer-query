import { StatusCodes } from 'http-status-codes';
import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY, errors);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, StatusCodes.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, StatusCodes.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, StatusCodes.FORBIDDEN);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, StatusCodes.CONFLICT);
    this.name = 'ConflictError';
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, StatusCodes.BAD_REQUEST);
    this.name = 'BadRequestError';
  }
}
export { AppError };
