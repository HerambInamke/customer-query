/**
 * Auth Integration Tests
 * Run: npm test
 * Requires: MongoDB connection (set TEST_MONGO_URI in .env)
 */

import request from 'supertest';
import app from '../src/app.js';

describe('Auth Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should return 422 when required fields are missing', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({});
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for invalid email', async () => {
      const res = await request(app).post('/api/v1/auth/register').send({
        name: 'Test User',
        email: 'not-an-email',
        password: 'Password1',
      });
      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return 422 when credentials are missing', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({});
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('should return health check', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
