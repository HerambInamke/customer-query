import { StatusCodes } from 'http-status-codes';

export const sendSuccess = (res, { message = 'Success', data = {}, meta = {}, statusCode = StatusCodes.OK } = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta,
  });
};

export const sendCreated = (res, { message = 'Resource created successfully', data = {}, meta = {} } = {}) => {
  return sendSuccess(res, { message, data, meta, statusCode: StatusCodes.CREATED });
};

export const sendError = (res, { message = 'Something went wrong', errors = [], statusCode = StatusCodes.INTERNAL_SERVER_ERROR, stack } = {}) => {
  const payload = {
    success: false,
    message,
    errors,
  };

  if (process.env.NODE_ENV !== 'production' && stack) {
    payload.stack = stack;
  }

  return res.status(statusCode).json(payload);
};
