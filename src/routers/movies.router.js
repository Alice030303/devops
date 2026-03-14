import express from 'express';
import * as movieControllers from '../controllers/movieControllers.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.get('/', async function listMovies(req, res) {
  res.send(
    await movieControllers.list({
      page: req.query.page,
    })
  );
});
router.get('/search', async function searchMovies(req, res) {
  res.send(await movieControllers.search(req.query.search, req.query.page));
});

router.get('/:id/details', async function movieDetails(req, res) {
  res.send(await movieControllers.watchDetails(req.params.id));
});

router.post('/favorite', auth, async function addToFavorite(req, res) {
  
  if (!req.body.movie || !req.body.movie.tmdbId) {
    return res.status(400).json({ error: 'movie object with tmdbId required' });
  }
  try {
    const result = await movieControllers.addToFavorite(req.body.movie, req.user.userId);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/wishlist', auth, async function addToWishlist(req, res) {
  if (!req.body.movie || !req.body.movie.tmdbId) {
    return res.status(400).json({ error: 'movie object with tmdbId required' });
  }
  try {
    const result = await movieControllers.addToWishlist(req.body.movie, req.user.userId);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/watched', auth, async function addToWatched(req, res) {
  if (!req.body.movie || !req.body.movie.tmdbId) {
    return res.status(400).json({ error: 'movie object with tmdbId required' });
  }
  try {
    const result = await movieControllers.addToWatched(req.body.movie, req.user.userId);
    res.send(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/findMovies', auth, async function findMoviesByIds(req, res) {
  res.send(await movieControllers.findMoviesByIds(req.body.ids));
});

router.post(
  '/recommendations',
  auth,
  async function getRecommendations(req, res) {
    const { favorites } = req.body;
    if (!Array.isArray(favorites) || favorites.length === 0) {
      throw new Error('Aucun favori fourni pour générer des recommandations');
    }
    res.send(await movieControllers.getRecommendationsFromFavorites(favorites));
  }
);

export default router;
