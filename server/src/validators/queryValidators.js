import { body, param, query } from 'express-validator';
import { QUERY_STATUS, QUERY_PRIORITY, QUERY_CATEGORY } from '../constants/index.js';

export const createQueryValidator = [
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Customer name must be between 2 and 150 characters'),

  body('customerEmail')
    .trim()
    .notEmpty()
    .withMessage('Customer email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('customerPhone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+]?[\d\s\-().]{7,20}$/)
    .withMessage('Please provide a valid phone number'),

  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 5, max: 255 })
    .withMessage('Subject must be between 5 and 255 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),

  body('priority')
    .optional()
    .isIn(Object.values(QUERY_PRIORITY))
    .withMessage(`Priority must be one of: ${Object.values(QUERY_PRIORITY).join(', ')}`),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(Object.values(QUERY_CATEGORY))
    .withMessage(`Category must be one of: ${Object.values(QUERY_CATEGORY).join(', ')}`),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom((tags) => tags.every((tag) => typeof tag === 'string' && tag.length <= 50))
    .withMessage('Each tag must be a string with max 50 characters'),

  body('assignedTo')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('assignedTo must be a valid user ID'),
];

export const updateQueryValidator = [
  param('id').isMongoId().withMessage('Invalid query ID'),

  body('customerName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('Customer name must be between 2 and 150 characters'),

  body('customerEmail')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('customerPhone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[+]?[\d\s\-().]{7,20}$/)
    .withMessage('Please provide a valid phone number'),

  body('subject')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Subject must be between 5 and 255 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),

  body('status')
    .optional()
    .isIn(Object.values(QUERY_STATUS))
    .withMessage(`Status must be one of: ${Object.values(QUERY_STATUS).join(', ')}`),

  body('priority')
    .optional()
    .isIn(Object.values(QUERY_PRIORITY))
    .withMessage(`Priority must be one of: ${Object.values(QUERY_PRIORITY).join(', ')}`),

  body('category')
    .optional()
    .isIn(Object.values(QUERY_CATEGORY))
    .withMessage(`Category must be one of: ${Object.values(QUERY_CATEGORY).join(', ')}`),

  body('assignedTo')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('assignedTo must be a valid user ID'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

export const queryIdValidator = [
  param('id').isMongoId().withMessage('Invalid query ID'),
];

export const listQueriesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(Object.values(QUERY_STATUS)).withMessage(`Invalid status value`),
  query('priority').optional().isIn(Object.values(QUERY_PRIORITY)).withMessage(`Invalid priority value`),
  query('category').optional().isIn(Object.values(QUERY_CATEGORY)).withMessage(`Invalid category value`),
  query('startDate').optional().isISO8601().withMessage('startDate must be a valid ISO 8601 date'),
  query('endDate').optional().isISO8601().withMessage('endDate must be a valid ISO 8601 date'),
  query('assignedTo').optional().isMongoId().withMessage('assignedTo must be a valid user ID'),
];

export const bulkActionValidator = [
  body('ids')
    .notEmpty()
    .withMessage('IDs array is required')
    .isArray({ min: 1 })
    .withMessage('IDs must be a non-empty array')
    .custom((ids) => ids.every((id) => /^[a-fA-F0-9]{24}$/.test(id)))
    .withMessage('All IDs must be valid MongoDB ObjectIDs'),
];

export const updateStatusValidator = [
  param('id').isMongoId().withMessage('Invalid query ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(Object.values(QUERY_STATUS))
    .withMessage(`Status must be one of: ${Object.values(QUERY_STATUS).join(', ')}`),
];

export const updatePriorityValidator = [
  param('id').isMongoId().withMessage('Invalid query ID'),
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(Object.values(QUERY_PRIORITY))
    .withMessage(`Priority must be one of: ${Object.values(QUERY_PRIORITY).join(', ')}`),
];

export const assignAgentValidator = [
  param('id').isMongoId().withMessage('Invalid query ID'),
  body('assignedTo')
    .notEmpty()
    .withMessage('assignedTo is required')
    .isMongoId()
    .withMessage('assignedTo must be a valid user ID'),
];
