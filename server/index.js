require('express-async-errors');
const path = require('path');
const express = require('express');
const { types } = require('pg');

// Les colonnes DATE de Postgres restent des chaînes "YYYY-MM-DD" (pas de
// conversion en objet Date / fuseau horaire) — c'est le format attendu
// partout côté frontend.
types.setTypeParser(1082, function (val) { return val; });

const { initSchema } = require('./db');
const { requireAuth } = require('./auth');
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', requireAuth, dataRoutes);

// Fichiers statiques (index.html, css/, js/) à la racine du dépôt
app.use(express.static(path.join(__dirname, '..')));

app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ error: 'Erreur serveur.' });
});

const PORT = process.env.PORT || 3000;

initSchema()
  .then(function () {
    app.listen(PORT, function () {
      console.log('JeSuisCoach en écoute sur le port ' + PORT);
    });
  })
  .catch(function (err) {
    console.error('Échec d’initialisation de la base de données :', err);
    process.exit(1);
  });
