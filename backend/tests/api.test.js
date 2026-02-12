const request = require('supertest');
const app = require('./src/app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Health Check', () => {
  test('GET /health should return server status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Server is healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
  });
});

describe('Auth Routes', () => {
  test('POST /api/v1/auth/register should validate input', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        userType: 'job_seeker'
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('User registered successfully. Please check your email for verification.');
  });

  test('POST /api/v1/auth/login should validate input', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'john.doe@example.com',
        password: 'password123'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('data');
  });
});

describe('Jobs Routes', () => {
  test('GET /api/v1/jobs should return jobs list', async () => {
    const response = await request(app)
      .get('/api/v1/jobs')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe('Companies Routes', () => {
  test('GET /api/v1/companies should return companies list', async () => {
    const response = await request(app)
      .get('/api/v1/companies')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe('404 Handler', () => {
  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('not found');
  });
});