import { StatusCodes } from 'http-status-codes';
import { AppError } from '../errors/index.js';
import { sendError } from '../responses/index.js';
import { env } from '../config/env.js';

const handleCastError = (error) => {
  return new AppError(`Invalid value for field: ${error.path}`, StatusCodes.BAD_REQUEST);
};

const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  return new AppError(`${field} already exists`, StatusCodes.CONFLICT);
};

const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  return new AppError('Validation failed', StatusCodes.UNPROCESSABLE_ENTITY, errors);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', StatusCodes.UNAUTHORIZED);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', StatusCodes.UNAUTHORIZED);
};

export const errorHandler = (error, _req, res, _next) => {
  let err = { ...error, message: error.message };

  if (error.name === 'CastError') {
    err = handleCastError(error);
  } else if (error.code === 11000) {
    err = handleDuplicateKeyError(error);
  } else if (error.name === 'ValidationError') {
    err = handleValidationError(error);
  } else if (error.name === 'JsonWebTokenError') {
    err = handleJWTError();
  } else if (error.name === 'TokenExpiredError') {
    err = handleJWTExpiredError();
  }

  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  return sendError(res, {
    message,
    errors,
    statusCode,
    stack: env.isDevelopment ? error.stack : undefined,
  });
};
