import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';

describe('Auth API', () => {
  const newUser = {
    name: 'John Doe',
    email: `test${Date.now()}@example.com`,
    password: 'Password123!',
  };

  it('devrait enregistrer un nouvel utilisateur', async () => {
    const res = await request(app).post(`/auth/register`).send(newUser);
    if (res.status !== 201) {
      console.info('erreur 400:', res.body);
    }
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Utilisateur enregistré avec succès');

    expect(res.headers['set-cookie']).toBeDefined();
  });

  it("devrait connecter l'utilisateur et renvoyer un cookie", async () => {
    const res = await request(app).post(`/auth/login`).send({
      email: newUser.email,
      password: newUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Connexion réussie');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('devrait refuser la connexion avec un wrong password', async () => {
    const res = await request(app).post(`/auth/login`).send({
      email: newUser.email,
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Échec de l'authentification");
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
