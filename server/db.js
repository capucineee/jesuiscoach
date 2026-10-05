const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL manquant — ajoute un plugin PostgreSQL sur Railway (ou lance un Postgres local et exporte la variable).');
}

function shouldUseSSL(connectionString) {
  if (process.env.PGSSL === 'true') return true;
  if (process.env.PGSSL === 'false') return false;
  var host = '';
  try { host = new URL(connectionString).hostname; } catch (e) {}
  var isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  var isRailwayInternal = /\.railway\.internal$/.test(host);
  return !isLocal && !isRailwayInternal;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: shouldUseSSL(process.env.DATABASE_URL) ? { rejectUnauthorized: false } : false
});

function logConnectionInfo() {
  try {
    var u = new URL(process.env.DATABASE_URL);
    console.log('[db] Connexion à ' + u.hostname + ':' + (u.port || '5432') + u.pathname + ' (utilisateur: ' + u.username + ')');
  } catch (e) {
    console.log('[db] Impossible de parser DATABASE_URL pour le log de diagnostic.');
  }
}

async function initSchema() {
  logConnectionInfo();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      weekly_goal INTEGER NOT NULL DEFAULT 4,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL DEFAULT '',
      sex TEXT NOT NULL DEFAULT 'h',
      weekly_goal INTEGER NOT NULL DEFAULT 4,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS profiles_user_idx ON profiles(user_id);

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
      profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      kg NUMERIC(5,1) NOT NULL
    );
    CREATE INDEX IF NOT EXISTS weights_user_date_idx ON weights(user_id, date);

    CREATE TABLE IF NOT EXISTS diet_days (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      breakfast TEXT,
      lunch TEXT,
      snack TEXT,
      dinner TEXT,
      dessert TEXT,
      restaurant_kcal INTEGER,
      custom_meals JSONB NOT NULL DEFAULT '{}',
      lunch_protein TEXT,
      lunch_carb TEXT,
      dinner_protein TEXT,
      dinner_carb TEXT
    );
    CREATE INDEX IF NOT EXISTS diet_days_user_date_idx ON diet_days(user_id, date);
  `);

  // Migrations : colonnes ajoutées après la création initiale des tables sur certains environnements.
  await pool.query(`ALTER TABLE diet_days ADD COLUMN IF NOT EXISTS custom_meals JSONB NOT NULL DEFAULT '{}'`);
  await pool.query(`ALTER TABLE diet_days ADD COLUMN IF NOT EXISTS lunch_protein TEXT`);
  await pool.query(`ALTER TABLE diet_days ADD COLUMN IF NOT EXISTS lunch_carb TEXT`);
  await pool.query(`ALTER TABLE diet_days ADD COLUMN IF NOT EXISTS dinner_protein TEXT`);
  await pool.query(`ALTER TABLE diet_days ADD COLUMN IF NOT EXISTS dinner_carb TEXT`);
  await pool.query(`ALTER TABLE sessions ADD COLUMN IF NOT EXISTS profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE`);
  await pool.query(`ALTER TABLE weights ADD COLUMN IF NOT EXISTS profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE`);
  await pool.query(`ALTER TABLE diet_days ADD COLUMN IF NOT EXISTS profile_id INTEGER REFERENCES profiles(id) ON DELETE CASCADE`);
  await pool.query(`CREATE INDEX IF NOT EXISTS sessions_profile_date_idx ON sessions(profile_id, date)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS weights_profile_date_idx ON weights(profile_id, date)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS diet_days_profile_date_idx ON diet_days(profile_id, date)`);

  // Migration : chaque compte existant (créé avant la notion de "profil") reçoit un
  // profil par défaut repris de users.name / users.weekly_goal, afin de ne perdre
  // aucune donnée déjà enregistrée. Idempotent : ne touche pas les comptes qui ont
  // déjà au moins un profil.
  await pool.query(`
    INSERT INTO profiles (user_id, name, sex, weekly_goal)
    SELECT u.id, COALESCE(NULLIF(u.name, ''), 'Moi'), 'h', u.weekly_goal
    FROM users u
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.user_id = u.id)
  `);

  // Rattache les anciennes séances / poids / jours de diète (encore sans profile_id)
  // au premier profil (le plus ancien) du compte propriétaire.
  await pool.query(`
    UPDATE sessions s SET profile_id = (SELECT p.id FROM profiles p WHERE p.user_id = s.user_id ORDER BY p.id ASC LIMIT 1)
    WHERE s.profile_id IS NULL
  `);
  await pool.query(`
    UPDATE weights w SET profile_id = (SELECT p.id FROM profiles p WHERE p.user_id = w.user_id ORDER BY p.id ASC LIMIT 1)
    WHERE w.profile_id IS NULL
  `);
  await pool.query(`
    UPDATE diet_days d SET profile_id = (SELECT p.id FROM profiles p WHERE p.user_id = d.user_id ORDER BY p.id ASC LIMIT 1)
    WHERE d.profile_id IS NULL
  `);

  // La contrainte d'unicité "un seul enregistrement par jour" doit maintenant porter
  // sur (profil, date) et non plus (compte, date), puisque deux profils d'un même
  // compte peuvent chacun avoir leur propre poids / diète le même jour.
  await pool.query(`ALTER TABLE weights DROP CONSTRAINT IF EXISTS weights_user_id_date_key`);
  await pool.query(`ALTER TABLE diet_days DROP CONSTRAINT IF EXISTS diet_days_user_id_date_key`);
  await pool.query(`
    DO $do$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'weights_profile_id_date_key') THEN
        ALTER TABLE weights ADD CONSTRAINT weights_profile_id_date_key UNIQUE (profile_id, date);
      END IF;
    END $do$;
  `);
  await pool.query(`
    DO $do$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'diet_days_profile_id_date_key') THEN
        ALTER TABLE diet_days ADD CONSTRAINT diet_days_profile_id_date_key UNIQUE (profile_id, date);
      END IF;
    END $do$;
  `);

  var counts = await pool.query(
    'SELECT (SELECT count(*) FROM users) AS users, (SELECT count(*) FROM profiles) AS profiles, (SELECT count(*) FROM sessions) AS sessions'
  );
  console.log('[db] Schéma prêt — ' + counts.rows[0].users + ' compte(s), ' + counts.rows[0].profiles + ' profil(s), ' + counts.rows[0].sessions + ' séance(s) existantes.');
}

module.exports = { pool, initSchema };
