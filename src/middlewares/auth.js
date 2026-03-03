import jwt from 'jsonwebtoken';

function auth(req, res, next) {
  let token = null;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const [, extractedToken] = authHeader.split(' ');
      token = extractedToken;
    }
  }
  if (!token) {
    console.warn('Aucun token trouvé dans le cookie ni dans Authorization');
    res.status(401).json({ error: 'Token manquant' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.warn('Token invalide ou expiré:', err.message);
    res.status(403).json({ error: 'Token invalide ou expiré' });
  }
}
export default auth;
