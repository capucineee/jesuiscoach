const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL manquant — ajoute un plugin PostgreSQL sur Railway (ou lance un Postgres local et exporte la variable).');
}

const useSSL = /railway\.app|render\.com|amazonaws\.com/.test(process.env.DATABASE_URL) || process.env.PGSSL === 'true';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      weekly_goal INTEGER NOT NULL DEFAULT 4,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      type_id TEXT NOT NULL,
      duration INTEGER NOT NULL DEFAULT 0,
      intensity INTEGER NOT NULL DEFAULT 3,
      note TEXT NOT NULL DEFAULT '',
      done BOOLEAN NOT NULL DEFAULT true,
      exercises JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS sessions_user_date_idx ON sessions(user_id, date);

    CREATE TABLE IF NOT EXISTS meals (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      slot TEXT NOT NULL,
      status TEXT NOT NULL,
      UNIQUE(user_id, date, slot)
    );
    CREATE INDEX IF NOT EXISTS meals_user_date_idx ON meals(user_id, date);

    CREATE TABLE IF NOT EXISTS weights (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      kg NUMERIC(5,1) NOT NULL,
      UNIQUE(user_id, date)
    );
    CREATE INDEX IF NOT EXISTS weights_user_date_idx ON weights(user_id, date);
  `);
}

module.exports = { pool, initSchema };
