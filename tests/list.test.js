import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';

let mongoServer;
let cookie;
const movieId = '550';
const fakeMovieId = '999999999999999999999999';
const listType = 'favorite';

describe('User List API', () => {
  const newUser = {
    name: 'Jane Doe',
    email: `testMovie${Date.now()}@example.com`,
    password: 'Password123!',
  };

  beforeAll(async () => {
    // MongoDB en mémoire
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {});

    // Créer utilisateur + récupérer cookie
    await request(app).post('/auth/register').send(newUser);
    const loginRes = await request(app).post('/auth/login').send({
      email: newUser.email,
      password: newUser.password,
    });
    cookie = loginRes.headers['set-cookie'];
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('should add a movie to favorite list', async () => {
    const res = await request(app)
      .post('/movies/favorite')
      .set('Cookie', cookie)
      .send({ movie: { tmdbId: movieId } });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should remove a movie from favorite list', async () => {
    const res = await request(app)
      .delete('/users/removeFromList')
      .set('Cookie', cookie)
      .send({ idMovieToRemove: movieId, listType });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
    it('should return 400 if movie id is missing (error)', async () => {
    const res = await request(app)
      .delete('/users/removeFromList')
      .set('Cookie', cookie)
      .send({ listType });
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(`Impossible de retirer de ${listType}`);
  });
  it('should return 404 for nonexistent movie id (error)', async () => {
    const res = await request(app)
      .delete('/users/removeFromList')
      .set('Cookie', cookie)
      .send({ idMovieToRemove: fakeMovieId, listType });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 if not authenticated', async () => {
    const res = await request(app)
      .delete('/users/removeFromList')
      .send({ idMovieToRemove: movieId, listType });
    expect(res.status).toBe(401);
  });
});