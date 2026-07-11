import { beforeAll, afterAll, beforeEach, describe, it, expect } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../src/app.js';

let mongod: MongoMemoryServer;
const app = createApp();

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key]?.deleteMany({});
  }
});

describe('Auth flows', () => {
  const studentPayload = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    password: 'StrongPass123',
    role: 'student',
  };

  it('registers a new student', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(studentPayload);
    expect(res.status).toBe(201);
    expect(res.body.data.user.email).toBe(studentPayload.email);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  it('rejects duplicate registration email', async () => {
    await request(app).post('/api/v1/auth/register').send(studentPayload);
    const res = await request(app).post('/api/v1/auth/register').send(studentPayload);
    expect(res.status).toBe(422);
  });

  it('logs in with correct credentials', async () => {
    await request(app).post('/api/v1/auth/register').send(studentPayload);
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: studentPayload.email, password: studentPayload.password });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeTruthy();
  });

  it('rejects login with wrong password', async () => {
    await request(app).post('/api/v1/auth/register').send(studentPayload);
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: studentPayload.email, password: 'WrongPassword1' });
    expect(res.status).toBe(401);
  });

  it('blocks protected route without a token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('allows protected route with a valid token', async () => {
    const register = await request(app).post('/api/v1/auth/register').send(studentPayload);
    const token = register.body.data.accessToken;
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(studentPayload.email);
  });
});

describe('Role authorization', () => {
  async function registerAndLogin(role: 'student' | 'institution') {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test User', email: `${role}@example.com`, password: 'StrongPass123', role });
    return res.body.data.accessToken as string;
  }

  it('blocks a student from submitting an institution application', async () => {
    const token = await registerAndLogin('student');
    const res = await request(app)
      .post('/api/v1/institutions/apply')
      .set('Authorization', `Bearer ${token}`)
      .send({
        legalName: 'Test University',
        displayName: 'Test U',
        institutionType: 'university',
        registrationNumber: 'REG-1',
        website: 'https://example.edu',
        contactEmail: 'contact@example.edu',
        description: 'A long enough description of the institution for validation purposes.',
        country: 'Testland',
        address: '123 Test Street',
      });
    expect(res.status).toBe(403);
  });

  it('allows an institution user to submit an application', async () => {
    const token = await registerAndLogin('institution');
    const res = await request(app)
      .post('/api/v1/institutions/apply')
      .set('Authorization', `Bearer ${token}`)
      .send({
        legalName: 'Test University',
        displayName: 'Test U',
        institutionType: 'university',
        registrationNumber: 'REG-1',
        website: 'https://example.edu',
        contactEmail: 'contact@example.edu',
        description: 'A long enough description of the institution for validation purposes.',
        country: 'Testland',
        address: '123 Test Street',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
  });
});

describe('Feedback', () => {
  it('accepts anonymous feedback submission', async () => {
    const res = await request(app).post('/api/v1/feedback').send({
      role: 'guest',
      rating: 5,
      usabilityRating: 4,
      trustRating: 5,
      message: 'Great platform, verification was fast and easy to trust.',
      consentToPublish: true,
    });
    expect(res.status).toBe(201);
  });

  it('rejects feedback missing required fields', async () => {
    const res = await request(app).post('/api/v1/feedback').send({ role: 'guest' });
    expect(res.status).toBe(422);
  });
});

describe('Public verification', () => {
  it('returns not_found for an unknown credential id', async () => {
    const res = await request(app).get('/api/v1/verify/does-not-exist');
    expect(res.status).toBe(200);
    expect(res.body.data.result).toBe('not_found');
  });
});

describe('Health', () => {
  it('reports readiness against the connected in-memory database', async () => {
    const res = await request(app).get('/api/v1/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.data.db).toBe('connected');
  });
});
