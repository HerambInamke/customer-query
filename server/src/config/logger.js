import morgan from 'morgan';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.resolve(__dirname, '../../src/logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), {
  flags: 'a',
});

const errorLogStream = fs.createWriteStream(path.join(logsDir, 'error.log'), {
  flags: 'a',
});

export const requestLogger = morgan(env.isDevelopment ? 'dev' : 'combined', {
  stream: env.isDevelopment ? process.stdout : accessLogStream,
  skip: (_req, res) => res.statusCode >= 400,
});

export const errorLogger = morgan('combined', {
  stream: errorLogStream,
  skip: (_req, res) => res.statusCode < 400,
});
