import express from 'express';
import * as userControllers from '../controllers/userControllers.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.get('/profile', auth, async function getProfile(req, res) {
  return res.send(await userControllers.getProfile(req.user.userId));
});

router.put('/settings', auth, async function updateSettings(req, res) {
  const { userId } = req.user;
  const { name, email, password, newPassword } = req.body;
  return res.send(
    await userControllers.updateSettings(
      userId,
      name,
      email,
      password,
      newPassword
    )
  );
});

router.get('/search', auth, async function searchUsers(req, res) {
  return res.send(await userControllers.searchUsers(req.query.search));
});

router.delete('/removeFromList', auth, async function removeFromList(req, res) {
  const { idMovieToRemove, listType } = req.body;
  try {
    const result = await userControllers.removeFromList(
      idMovieToRemove,
      req.user.userId,
      listType
    );
    return res.status(200).json(result);
  } catch (e) {
    return res
      .status(500)
      .send({ error: e.message || 'Erreur lors du retrait' });
  }
});
export default router;
