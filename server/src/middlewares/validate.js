import { validationResult } from 'express-validator';
import { ValidationError } from '../errors/index.js';

export const validate = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    throw new ValidationError('Validation failed', formattedErrors);
  }

  next();
};
