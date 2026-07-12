import { body, param, query } from 'express-validator';
import { USER_ROLES } from '../constants/index.js';

export const updateUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),

  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('role')
    .optional()
    .isIn(Object.values(USER_ROLES))
    .withMessage(`Role must be one of: ${Object.values(USER_ROLES).join(', ')}`),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const userIdValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

export const listUsersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(Object.values(USER_ROLES)).withMessage('Invalid role value'),
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be a boolean value (true or false)'),
];
