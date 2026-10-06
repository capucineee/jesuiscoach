const express = require('express');
const { pool } = require('../db');

const router = express.Router();

function mapSession(row) {
  return {
    id: String(row.id),
    date: row.date,
    typeId: row.type_id,
    duration: row.duration,
    intensity: row.intensity,
    note: row.note,
    done: row.done,
    exercises: row.exercises || []
  };
}

function mapWeight(row) {
  return { id: String(row.id), date: row.date, kg: parseFloat(row.kg) };
}

function mapDietDay(row) {
  return {
    id: String(row.id),
    date: row.date,
    breakfast: row.breakfast,
    lunch: row.lunch,
    snack: row.snack,
    dinner: row.dinner,
    dessert: row.dessert,
    restaurantKcal: row.restaurant_kcal,
    customMeals: row.custom_meals || {},
    lunch_protein: row.lunch_protein,
    lunch_carb: row.lunch_carb,
    dinner_protein: row.dinner_protein,
    dinner_carb: row.dinner_carb
  };
}

function mapProfile(row) {
  return { id: String(row.id), name: row.name, sex: row.sex, weeklyGoal: row.weekly_goal };
}

function mapChecklistItem(row) {
  return { id: String(row.id), category: row.category, title: row.title };
}

function mapChecklistLog(row) {
  return { itemId: String(row.item_id), date: row.date };
}

// Résout le profil actif pour ce compte : celui demandé (s'il appartient bien au
// compte) sinon le plus ancien profil du compte. Chaque compte a toujours au moins
// un profil (créé à l'inscription, ou lors de la migration pour les anciens comptes).
async function resolveProfile(userId, requestedId) {
  var all = await pool.query('SELECT * FROM profiles WHERE user_id = $1 ORDER BY id ASC', [userId]);
  if (!all.rows.length) return null;
  if (requestedId) {
    var match = all.rows.filter(function (p) { return String(p.id) === String(requestedId); })[0];
    if (match) return { profile: match, all: all.rows };
  }
  return { profile: all.rows[0], all: all.rows };
}

// ---------- Profils ----------

router.get('/profiles', async function (req, res) {
  var result = await pool.query('SELECT * FROM profiles WHERE user_id = $1 ORDER BY id ASC', [req.userId]);
  res.json(result.rows.map(mapProfile));
});

router.post('/profiles', async function (req, res) {
  var b = req.body || {};
  var name = String(b.name || '').trim().slice(0, 60);
  var sex = b.sex === 'f' ? 'f' : 'h';
  var weeklyGoal = Math.max(1, Math.min(14, parseInt(b.weeklyGoal, 10) || 4));
  if (!name) return res.status(400).json({ error: 'Indique un prénom.' });
  var result = await pool.query(
    'INSERT INTO profiles (user_id, name, sex, weekly_goal) VALUES ($1,$2,$3,$4) RETURNING *',
    [req.userId, name, sex, weeklyGoal]
  );
  res.status(201).json(mapProfile(result.rows[0]));
});

router.put('/profiles/:id', async function (req, res) {
  var b = req.body || {};
  var name = String(b.name || '').trim().slice(0, 60);
  var sex = b.sex === 'f' ? 'f' : 'h';
  var weeklyGoal = Math.max(1, Math.min(14, parseInt(b.weeklyGoal, 10) || 4));
  if (!name) return res.status(400).json({ error: 'Indique un prénom.' });
  var result = await pool.query(
    'UPDATE profiles SET name = $1, sex = $2, weekly_goal = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
    [name, sex, weeklyGoal, req.params.id, req.userId]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Profil introuvable.' });
  res.json(mapProfile(result.rows[0]));
});

// ---------- État combiné ----------

router.get('/state', async function (req, res) {
  var uid = req.userId;
  var resolved = await resolveProfile(uid, req.query.profileId);
  if (!resolved) return res.status(500).json({ error: 'Aucun profil pour ce compte.' });
  var pid = resolved.profile.id;

  var sessionsRes = await pool.query('SELECT * FROM sessions WHERE profile_id = $1 ORDER BY date DESC, id DESC', [pid]);
  var weightsRes = await pool.query('SELECT * FROM weights WHERE profile_id = $1 ORDER BY date ASC', [pid]);
  var dietRes = await pool.query('SELECT * FROM diet_days WHERE profile_id = $1', [pid]);
  var checklistItemsRes = await pool.query('SELECT * FROM checklist_items WHERE profile_id = $1 ORDER BY id ASC', [pid]);
  var checklistLogsRes = await pool.query(
    'SELECT cl.* FROM checklist_logs cl JOIN checklist_items ci ON ci.id = cl.item_id WHERE ci.profile_id = $1',
    [pid]
  );

  res.json({
    profiles: resolved.all.map(mapProfile),
    profile: mapProfile(resolved.profile),
    sessions: sessionsRes.rows.map(mapSession),
    meals: [],
    weights: weightsRes.rows.map(mapWeight),
    dietDays: dietRes.rows.map(mapDietDay),
    checklistItems: checklistItemsRes.rows.map(mapChecklistItem),
    checklistLogs: checklistLogsRes.rows.map(mapChecklistLog)
  });
});

// ---------- Séances ----------

router.post('/sessions', async function (req, res) {
  var b = req.body || {};
  var resolved = await resolveProfile(req.userId, b.profileId);
  if (!resolved) return res.status(400).json({ error: 'Profil invalide.' });
  var result = await pool.query(
    'INSERT INTO sessions (user_id, profile_id, date, type_id, duration, intensity, note, exercises, done) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true) RETURNING *',
    [req.userId, resolved.profile.id, b.date, b.typeId, b.duration || 0, b.intensity || 3, b.note || '', JSON.stringify(b.exercises || [])]
  );
  res.status(201).json(mapSession(result.rows[0]));
});

router.patch('/sessions/:id', async function (req, res) {
  var done = !!(req.body && req.body.done);
  var result = await pool.query(
    'UPDATE sessions SET done = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
    [done, req.params.id, req.userId]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Séance introuvable.' });
  res.json(mapSession(result.rows[0]));
});

router.delete('/sessions/:id', async function (req, res) {
  await pool.query('DELETE FROM sessions WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  res.status(204).end();
});

// ---------- Poids ----------

router.put('/weights', async function (req, res) {
  var b = req.body || {};
  var resolved = await resolveProfile(req.userId, b.profileId);
  if (!resolved) return res.status(400).json({ error: 'Profil invalide.' });
  var result = await pool.query(
    'INSERT INTO weights (user_id, profile_id, date, kg) VALUES ($1,$2,$3,$4) ' +
    'ON CONFLICT (profile_id, date) DO UPDATE SET kg = excluded.kg RETURNING *',
    [req.userId, resolved.profile.id, b.date, b.kg]
  );
  res.json(mapWeight(result.rows[0]));
});

router.delete('/weights/:id', async function (req, res) {
  await pool.query('DELETE FROM weights WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  res.status(204).end();
});

// ---------- Diète ----------

var DIET_FIELDS = {
  breakfast: 'breakfast', lunch: 'lunch', snack: 'snack', dinner: 'dinner', dessert: 'dessert',
  restaurantKcal: 'restaurant_kcal',
  lunch_protein: 'lunch_protein', lunch_carb: 'lunch_carb',
  dinner_protein: 'dinner_protein', dinner_carb: 'dinner_carb'
};
var DIET_SLOT_FIELDS = ['breakfast', 'lunch', 'snack', 'dinner', 'dessert', 'lunch_protein', 'lunch_carb', 'dinner_protein', 'dinner_carb'];

router.put('/diet', async function (req, res) {
  var b = req.body || {};
  var column = DIET_FIELDS[b.field];
  if (!column) return res.status(400).json({ error: 'Champ de diète invalide.' });
  var resolved = await resolveProfile(req.userId, b.profileId);
  if (!resolved) return res.status(400).json({ error: 'Profil invalide.' });
  var pid = resolved.profile.id;
  var value = b.value === undefined ? null : b.value;
  var isSlot = DIET_SLOT_FIELDS.indexOf(b.field) !== -1;

  var existing = await pool.query('SELECT custom_meals FROM diet_days WHERE profile_id = $1 AND date = $2', [pid, b.date]);
  var customMeals = (existing.rows[0] && existing.rows[0].custom_meals) || {};

  if (isSlot) {
    if (value === 'CUSTOM') {
      var cm = b.customMeal || {};
      customMeals = Object.assign({}, customMeals);
      customMeals[b.field] = {
        name: String(cm.name || '').trim().slice(0, 80),
        kcal: Math.max(0, parseInt(cm.kcal, 10) || 0),
        p: Math.max(0, parseInt(cm.p, 10) || 0)
      };
    } else if (customMeals[b.field]) {
      customMeals = Object.assign({}, customMeals);
      delete customMeals[b.field];
    }
  }

  var result = await pool.query(
    'INSERT INTO diet_days (user_id, profile_id, date, ' + column + ', custom_meals) VALUES ($1,$2,$3,$4,$5) ' +
    'ON CONFLICT (profile_id, date) DO UPDATE SET ' + column + ' = $4, custom_meals = $5 RETURNING *',
    [req.userId, pid, b.date, value, JSON.stringify(customMeals)]
  );
  res.json(mapDietDay(result.rows[0]));
});

// ---------- Compléments & médicaments ----------

var CHECKLIST_CATEGORIES = ['supplement', 'medication'];

router.post('/checklist-items', async function (req, res) {
  var b = req.body || {};
  var resolved = await resolveProfile(req.userId, b.profileId);
  if (!resolved) return res.status(400).json({ error: 'Profil invalide.' });
  var category = CHECKLIST_CATEGORIES.indexOf(b.category) !== -1 ? b.category : null;
  var title = String(b.title || '').trim().slice(0, 60);
  if (!category) return res.status(400).json({ error: 'Catégorie invalide.' });
  if (!title) return res.status(400).json({ error: 'Indique un titre.' });
  var result = await pool.query(
    'INSERT INTO checklist_items (profile_id, category, title) VALUES ($1,$2,$3) RETURNING *',
    [resolved.profile.id, category, title]
  );
  res.status(201).json(mapChecklistItem(result.rows[0]));
});

router.delete('/checklist-items/:id', async function (req, res) {
  await pool.query(
    'DELETE FROM checklist_items ci USING profiles p WHERE ci.id = $1 AND ci.profile_id = p.id AND p.user_id = $2',
    [req.params.id, req.userId]
  );
  res.status(204).end();
});

router.put('/checklist-logs', async function (req, res) {
  var b = req.body || {};
  var owned = await pool.query(
    'SELECT ci.id FROM checklist_items ci JOIN profiles p ON p.id = ci.profile_id WHERE ci.id = $1 AND p.user_id = $2',
    [b.itemId, req.userId]
  );
  if (!owned.rows.length) return res.status(400).json({ error: 'Élément invalide.' });

  if (b.done) {
    await pool.query(
      'INSERT INTO checklist_logs (item_id, date) VALUES ($1,$2) ON CONFLICT (item_id, date) DO NOTHING',
      [b.itemId, b.date]
    );
  } else {
    await pool.query('DELETE FROM checklist_logs WHERE item_id = $1 AND date = $2', [b.itemId, b.date]);
  }
  res.json({ itemId: String(b.itemId), date: b.date, done: !!b.done });
});

module.exports = router;
