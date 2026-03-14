import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';

let mongoServer;

describe('Auth API', () => {
  const newUser = {
    name: 'John Doe',
    email: `test${Date.now()}@example.com`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {});
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('should register a new user', async () => {
    const res = await request(app).post('/auth/register').send(newUser);
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Utilisateur enregistré avec succès');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should login user and return cookie', async () => {
    const res = await request(app).post('/auth/login').send({
      email: newUser.email,
      password: newUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Connexion réussie');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/auth/login').send({
      email: newUser.email,
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
  });
});