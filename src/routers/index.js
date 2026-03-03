import express from 'express';

import moviesRouter from './movies.router.js';
import usersRouter from './users.router.js';
import authRouter from './auth.js';

const router = express.Router();

router.use('/movies', moviesRouter);
router.use('/api/movies', moviesRouter);
router.use('/users', usersRouter);
router.use('/auth', authRouter);

export default router;
