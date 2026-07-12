import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDatabase } from '../src/config/database.js';

describe('CRUD & API Integration Tests', () => {
  let userCookie;
  let supportCookie;
  let adminCookie;
  let queryId;
  let supportAgentId;

  beforeAll(async () => {
    await connectDatabase();

    // Log in as admin to retrieve support agent id
    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@cqms.com',
        password: 'Admin@1234',
      });
    console.log('adminLogin status:', adminLogin.status);
    console.log('adminLogin body:', adminLogin.body);
    adminCookie = adminLogin.headers['set-cookie'];

    // Retrieve agents list to get a support agent's ID
    const agentsRes = await request(app)
      .get('/api/v1/users/agents')
      .set('Cookie', adminCookie);
    console.log('agentsRes status:', agentsRes.status);
    console.log('agentsRes body:', agentsRes.body);
    
    // Find Sarah's ID
    const sarah = agentsRes.body.data && agentsRes.body.data.agents && agentsRes.body.data.agents.find(a => a.email === 'sarah@cqms.com');
    supportAgentId = sarah ? sarah._id : null;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('User Logins (Roles Validation)', () => {
    it('should successfully log in john@example.com (User)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'User@1234',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      userCookie = res.headers['set-cookie'];
    });

    it('should successfully log in sarah@cqms.com (Support)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'sarah@cqms.com',
          password: 'Support@1234',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      supportCookie = res.headers['set-cookie'];
    });
  });

  describe('Customer Query CRUD Operations', () => {
    it('should create a new customer query as a regular user', async () => {
      const res = await request(app)
        .post('/api/v1/queries')
        .set('Cookie', userCookie)
        .send({
          customerName: 'John Tester',
          customerEmail: 'john@example.com',
          subject: 'Test query subject',
          description: 'This is a test query description of sufficient length.',
          category: 'Technical',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.query).toBeDefined();
      expect(res.body.data.query.subject).toBe('Test query subject');
      queryId = res.body.data.query._id;
    });

    it('should retrieve all queries', async () => {
      const res = await request(app)
        .get('/api/v1/queries')
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.queries)).toBe(true);
    });

    it('should retrieve a query by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/queries/${queryId}`)
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.query._id).toBe(queryId);
    });

    it('should update the query as the owner (User)', async () => {
      const res = await request(app)
        .patch(`/api/v1/queries/${queryId}`)
        .set('Cookie', userCookie)
        .send({
          subject: 'Updated test query subject by owner',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.query.subject).toBe('Updated test query subject by owner');
    });

    it('should fail to update the query when unauthorized (different User)', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'jane@example.com',
          password: 'User@1234',
        });
      const janeCookie = loginRes.headers['set-cookie'];

      const res = await request(app)
        .patch(`/api/v1/queries/${queryId}`)
        .set('Cookie', janeCookie)
        .send({
          subject: 'Jane trying to hijack update',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('You do not have permission to update this query');
    });
  });

  describe('Queries Stats, Priority, Assignment, & Delete', () => {
    it('should fetch statistics of all queries', async () => {
      const res = await request(app)
        .get('/api/v1/queries/stats')
        .set('Cookie', userCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stats).toBeDefined();
      expect(res.body.data.stats.total).toBeDefined();
    });

    it('should fail to update priority as a regular user', async () => {
      const res = await request(app)
        .patch(`/api/v1/queries/${queryId}/priority`)
        .set('Cookie', userCookie)
        .send({
          priority: 'Urgent',
        });
      expect(res.status).toBe(403);
    });

    it('should update priority as a support agent', async () => {
      const res = await request(app)
        .patch(`/api/v1/queries/${queryId}/priority`)
        .set('Cookie', supportCookie)
        .send({
          priority: 'Urgent',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.query.priority).toBe('Urgent');
    });

    it('should fail to assign agent as a regular user', async () => {
      const res = await request(app)
        .patch(`/api/v1/queries/${queryId}/assign`)
        .set('Cookie', userCookie)
        .send({
          assignedTo: supportAgentId,
        });
      expect(res.status).toBe(403);
    });

    it('should assign support agent to query as support agent', async () => {
      if (!supportAgentId) return;
      const res = await request(app)
        .patch(`/api/v1/queries/${queryId}/assign`)
        .set('Cookie', supportCookie)
        .send({
          assignedTo: supportAgentId,
        });
      expect(res.status).toBe(200);
      expect(res.body.data.query.assignedTo).toBeDefined();
    });

    it('should fail to update status as a regular user', async () => {
      const res = await request(app)
        .patch(`/api/v1/queries/${queryId}/status`)
        .set('Cookie', userCookie)
        .send({
          status: 'Resolved',
        });
      expect(res.status).toBe(403);
    });

    it('should update status as a support agent', async () => {
      const res = await request(app)
        .patch(`/api/v1/queries/${queryId}/status`)
        .set('Cookie', supportCookie)
        .send({
          status: 'Resolved',
        });
      expect(res.status).toBe(200);
      expect(res.body.data.query.status).toBe('Resolved');
    });

    it('should allow support agent to soft delete query', async () => {
      const deleteRes = await request(app)
        .delete(`/api/v1/queries/${queryId}`)
        .set('Cookie', supportCookie);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });

    it('should deny query restoration to support agent', async () => {
      const res = await request(app)
        .patch(`/api/v1/queries/${queryId}/restore`)
        .set('Cookie', supportCookie);
      expect(res.status).toBe(403);
    });

    it('should allow admin to restore query', async () => {
      const res = await request(app)
        .patch(`/api/v1/queries/${queryId}/restore`)
        .set('Cookie', adminCookie);
      expect(res.status).toBe(200);
      expect(res.body.data.query.deleted).toBe(false);
    });
  });
});
