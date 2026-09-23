# JeSuisCoach

App mobile-first pour suivre les séances de sport et la diète au quotidien.

- **Aujourd'hui** : message de motivation du jour, séance du jour (avec exercices/séries/charges), diète en tap rapide (✓ respecté / ~ écart / ✕ raté).
- **Semaine** : minutes d'entraînement par jour, répartition des séances par type, adhérence diète.
- **Évolution** : période 7j / 30j / 90j / personnalisée, répartition par type, progression des charges par exercice, poids, adhérence diète.

Chaque personne crée son compte (email + mot de passe) ; les données sont stockées dans une base PostgreSQL, accessibles depuis n'importe quel appareil une fois connecté.

## Déployer sur Railway

1. Sur [railway.app](https://railway.app), **New Project → Deploy from GitHub repo** → sélectionne `jesuiscoach`.
2. Dans le même projet, **+ New → Database → Add PostgreSQL**.
3. Sur le service de l'app (pas la base) → onglet **Variables** :
   - `DATABASE_URL` → référence la variable `DATABASE_URL` du service Postgres (Railway le propose automatiquement, sinon *Add Variable Reference*).
   - `JWT_SECRET` → une valeur aléatoire longue et privée (ex: générée avec `openssl rand -hex 32`).
4. Railway détecte le `package.json` à la racine, installe les dépendances et lance `npm start` automatiquement.
5. Une fois déployé, récupère le domaine généré par Railway (onglet **Settings → Networking → Generate Domain**) — c'est ce lien qui donne accès à l'app, avec les comptes et les données persistées.

Chaque `git push` sur `main` redéploie automatiquement.

## Développement local

```bash
npm install
cp .env.example .env   # renseigne DATABASE_URL et JWT_SECRET
npm start
```

Nécessite un PostgreSQL accessible (local ou distant) — le schéma des tables est créé automatiquement au démarrage.
