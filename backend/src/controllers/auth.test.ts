import supertest from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import authRouter from '../routes/auth';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

const prisma = new PrismaClient();

// Clean up the database before each test
beforeEach(async () => {
  await prisma.user.deleteMany({});
});

describe('Auth Controller', () => {
  it('should register a new user', async () => {
    const response = await supertest(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
  });

  it('should not register a user with an existing email', async () => {
    // First, register a user
    await supertest(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
      });

    // Then, try to register another user with the same email
    const response = await supertest(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password456',
        firstName: 'Another',
        lastName: 'User',
        username: 'anotheruser',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Email already registered');
  });

  it('should log in an existing user', async () => {
    // First, register a user
    await supertest(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
      });

    // Then, log in with the same credentials
    const response = await supertest(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('test@example.com');
    expect(response.body.data.token).toBeDefined();
  });

  it('should not log in with an incorrect password', async () => {
    // First, register a user
    await supertest(app)
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
      });

    // Then, try to log in with an incorrect password
    const response = await supertest(app)
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Invalid email or password');
  });
});
