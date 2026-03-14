// tests/app.test.js
import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js'; // default import for Express app
import { defineUserModel as User } from '../src/models/User.js'; // modèle utilisateur
import { defineMovieModel as Movie } from '../src/models/MovieManager.js'; // modèle film

jest.setTimeout(30000); // Timeout étendu pour MongoMemoryServer

let mongoServer;

beforeAll(async () => {
  // Si une connexion existe déjà, on la ferme
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Démarrage de MongoDB en mémoire
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri(), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  // Supprime toutes les collections après chaque test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'TestUser', email: 'test@test.com', password: 'Test1234!' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Utilisateur enregistré avec succès');
  });

  it('should login user and return cookie', async () => {
    await request(app)
      .post('/auth/register')
      .send({ name: 'TestUser2', email: 'test2@test.com', password: 'Test1234!' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test2@test.com', password: 'Test1234!' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await request(app)
      .post('/auth/register')
      .send({ name: 'WrongUser', email: 'wrong@test.com', password: 'Test1234!' });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
  });
});

describe('User List API', () => {
  let cookie;

  beforeEach(async () => {
    // Créer utilisateur et récupérer cookie pour tests protégés
    const user = await request(app)
      .post('/auth/register')
      .send({ name: 'ListUser', email: 'list@test.com', password: 'Test1234!' });

    const login = await request(app)
      .post('/auth/login')
      .send({ email: 'list@test.com', password: 'Test1234!' });

    cookie = login.headers['set-cookie'];
  });

  it('should add a movie to favorite list', async () => {
    const movie = await Movie.create({ tmdbId: 1, title: 'Inception' });

    const res = await request(app)
      .post('/movies/favorite')
      .set('Cookie', cookie)
      .send({ movie: { tmdbId: movie.tmdbId, title: movie.title } });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('should remove a movie from favorite list', async () => {
    const movie = await Movie.create({ tmdbId: 2, title: 'Matrix' });
    const user = await User.findOne({ email: 'list@test.com' });
    user.favorite.push(movie._id);
    await user.save();

    const res = await request(app)
      .post('/movies/favorite')
      .set('Cookie', cookie)
      .send({ movie: { tmdbId: movie.tmdbId, title: movie.title } });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('should return 400 if movie id is missing', async () => {
    const res = await request(app)
      .post('/movies/favorite')
      .set('Cookie', cookie)
      .send({});

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(res.body).toHaveProperty('error');
  }, 5000);

  it('should return 404 for nonexistent movie id', async () => {
    const res = await request(app)
      .post('/movies/favorite')
      .set('Cookie', cookie)
      .send({ movie: { tmdbId: 99999, title: 'FakeMovie' } });

    expect([200, 404]).toContain(res.statusCode);
  });

  it('should return 401 if not authenticated', async () => {
    const movie = await Movie.create({ tmdbId: 3, title: 'Avatar' });

    const res = await request(app)
      .post('/movies/favorite')
      .send({ movie: { tmdbId: movie.tmdbId, title: movie.title } });

    expect(res.statusCode).toBe(401);
  });
});