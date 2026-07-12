import request from 'supertest';
import app from '../src/app.js';

describe('Standardized Endpoints & Validators', () => {
  describe('GET /', () => {
    it('should return health and metadata in standard success format', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Hello from backend!');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.version).toBe('1.0.0');
    });
  });

  describe('GET /api/v1', () => {
    it('should return endpoints list in standard success format', async () => {
      const res = await request(app).get('/api/v1');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.endpoints).toBeDefined();
    });
  });

  describe('GET /health', () => {
    it('should return server health status in standard success format', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.environment).toBeDefined();
    });
  });

  describe('GET /api/v1/users', () => {
    it('should return 401 Unauthorized because user is not authenticated', async () => {
      const res = await request(app).get('/api/v1/users');
      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/v1/queries/:id', () => {
    it('should return 401 Unauthorized for unauthenticated queries update', async () => {
      const res = await request(app).patch('/api/v1/queries/666666666666666666666666').send({
        subject: 'New Subject'
      });
      expect(res.status).toBe(401);
    });
  });
});
