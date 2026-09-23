const express = require('express');
const { pool } = require('../db');
const { hashPassword, verifyPassword, signToken } = require('../auth');

const router = express.Router();

function publicUser(row) {
  return { name: row.name, weeklyGoal: row.weekly_goal, email: row.email };
}

router.post('/register', async function (req, res) {
  var email = String((req.body && req.body.email) || '').trim().toLowerCase();
  var password = String((req.body && req.body.password) || '');
  var name = String((req.body && req.body.name) || '').trim();

  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Adresse email invalide.' });
  if (password.length < 6) return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });

  var existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length) return res.status(409).json({ error: 'Un compte existe déjà avec cet email.' });

  var hash = await hashPassword(password);
  var result = await pool.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
    [email, hash, name]
  );
  var user = result.rows[0];
  res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
});

router.post('/login', async function (req, res) {
  var email = String((req.body && req.body.email) || '').trim().toLowerCase();
  var password = String((req.body && req.body.password) || '');

  var result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  var user = result.rows[0];
  if (!user) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });

  var valid = await verifyPassword(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });

  res.json({ token: signToken(user.id), user: publicUser(user) });
});

module.exports = router;
