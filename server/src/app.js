import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import xssClean from 'xss-clean';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env.js';
import { requestLogger, errorLogger } from './config/logger.js';
import { globalRateLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';
import { swaggerSpec } from './docs/swagger.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import { sendSuccess } from './responses/index.js';

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const ALLOWED_ORIGINS = [
  'https://customer-query.vercel.app',
  ...env.clientUrl
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) {
        return callback(null, true);
      }
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      console.warn(`CORS Blocked: '${origin}' not allowed`);
      return callback(null, false);
    },
    credentials: true,                // required for cookies to be sent cross-origin
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  })
);

app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(xssClean());
app.use(hpp());

app.use(requestLogger);
app.use(errorLogger);

app.use(globalRateLimiter);

app.get('/', (_req, res) => {
  return sendSuccess(res, {
    message: 'Hello from backend!',
    data: {
      version: '1.0.0',
      docs: '/api-docs',
      health: '/health',
    },
  });
});

app.get('/api/v1', (_req, res) => {
  return sendSuccess(res, {
    message: 'Customer Query Management System API v1',
    data: {
      version: '1.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        queries: '/api/v1/queries',
        users: '/api/v1/users',
      },
      docs: '/api-docs',
      health: '/health',
    },
  });
});

app.get('/health', (_req, res) => {
  return sendSuccess(res, {
    message: 'Server is running',
    data: {
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
    },
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/queries', queryRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
