import fs from 'node:fs';
import dotenv from 'dotenv';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './mongoose.js';
import api from './routers/index.js';

const app = express();

app.use(express.json());

dotenv.config();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(cookieParser());
app.use('/', api);

app.use(express.static(path.join(process.cwd(), 'public')));

const reactIndexFile = path.join(
  process.cwd(),
  'frontend',
  'dist',
  'index.html'
);

if (fs.existsSync(reactIndexFile)) {
  app.use(express.static(path.join(process.cwd(), 'frontend', 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(reactIndexFile);
  });
}

connectDB().catch((err) => console.error('❌ DB connection failed:', err));

export default app;
