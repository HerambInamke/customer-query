import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer Query Management System API',
      version: '1.0.0',
      description:
        'Production-ready REST API for managing customer support queries. Built with Node.js, Express, and MongoDB.',
      contact: {
        name: 'API Support',
        email: 'support@customerquery.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        CreateQuery: {
          type: 'object',
          required: ['customerName', 'customerEmail', 'subject', 'description', 'category'],
          properties: {
            customerName: { type: 'string', minLength: 2, maxLength: 150 },
            customerEmail: { type: 'string', format: 'email' },
            customerPhone: { type: 'string' },
            subject: { type: 'string', minLength: 5, maxLength: 255 },
            description: { type: 'string', minLength: 10, maxLength: 5000 },
            priority: {
              type: 'string',
              enum: ['Low', 'Medium', 'High', 'Urgent'],
              default: 'Medium',
            },
            category: {
              type: 'string',
              enum: ['Technical', 'Billing', 'Sales', 'General', 'Complaint', 'Other'],
            },
            assignedTo: { type: 'string', description: 'MongoDB ObjectId of support agent' },
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
            meta: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
