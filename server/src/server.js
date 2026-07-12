import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

const startServer = async () => {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.info(`Server running in ${env.nodeEnv} mode on port ${env.port}`);
    console.info(`API Base URL: http://localhost:${env.port}/api/v1`);
    console.info(`Swagger Docs: http://localhost:${env.port}/api-docs`);
    console.info(`Health Check: http://localhost:${env.port}/health`);
  });

  const gracefulShutdown = (signal) => {
    console.info(`Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      console.info('HTTP server closed.');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Promise Rejection:', reason);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
};

startServer();
