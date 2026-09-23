const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET manquant — définis cette variable d’environnement avant de démarrer le serveur.');
}

function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function signToken(userId) {
  return jwt.sign({ uid: userId }, JWT_SECRET, { expiresIn: '180d' });
}

function requireAuth(req, res, next) {
  var header = req.headers.authorization || '';
  var token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Non authentifié.' });
  try {
    var payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.uid;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Session expirée, reconnecte-toi.' });
  }
}

module.exports = { hashPassword, verifyPassword, signToken, requireAuth };
