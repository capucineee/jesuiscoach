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

function mapMeal(row) {
  return { id: String(row.id), date: row.date, slot: row.slot, status: row.status };
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

router.get('/state', async function (req, res) {
  var uid = req.userId;
  var userRes = await pool.query('SELECT name, weekly_goal FROM users WHERE id = $1', [uid]);
  var sessionsRes = await pool.query('SELECT * FROM sessions WHERE user_id = $1 ORDER BY date DESC, id DESC', [uid]);
  var mealsRes = await pool.query('SELECT * FROM meals WHERE user_id = $1', [uid]);
  var weightsRes = await pool.query('SELECT * FROM weights WHERE user_id = $1 ORDER BY date ASC', [uid]);
  var dietRes = await pool.query('SELECT * FROM diet_days WHERE user_id = $1', [uid]);

  res.json({
    profile: { name: userRes.rows[0].name, weeklyGoal: userRes.rows[0].weekly_goal },
    sessions: sessionsRes.rows.map(mapSession),
    meals: mealsRes.rows.map(mapMeal),
    weights: weightsRes.rows.map(mapWeight),
    dietDays: dietRes.rows.map(mapDietDay)
  });
});

router.put('/me', async function (req, res) {
  var name = String((req.body && req.body.name) || '').trim().slice(0, 60);
  var weeklyGoal = Math.max(1, Math.min(14, parseInt((req.body && req.body.weeklyGoal) || 4, 10) || 4));
  var result = await pool.query(
    'UPDATE users SET name = $1, weekly_goal = $2 WHERE id = $3 RETURNING name, weekly_goal',
    [name, weeklyGoal, req.userId]
  );
  res.json({ name: result.rows[0].name, weeklyGoal: result.rows[0].weekly_goal });
});

// ---------- Séances ----------

router.post('/sessions', async function (req, res) {
  var b = req.body || {};
  var result = await pool.query(
    'INSERT INTO sessions (user_id, date, type_id, duration, intensity, note, exercises, done) VALUES ($1,$2,$3,$4,$5,$6,$7,true) RETURNING *',
    [req.userId, b.date, b.typeId, b.duration || 0, b.intensity || 3, b.note || '', JSON.stringify(b.exercises || [])]
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

// ---------- Repas ----------

router.put('/meals', async function (req, res) {
  var b = req.body || {};
  var result = await pool.query(
    'INSERT INTO meals (user_id, date, slot, status) VALUES ($1,$2,$3,$4) ' +
    'ON CONFLICT (user_id, date, slot) DO UPDATE SET status = excluded.status RETURNING *',
    [req.userId, b.date, b.slot, b.status]
  );
  res.json(mapMeal(result.rows[0]));
});

router.delete('/meals/:id', async function (req, res) {
  await pool.query('DELETE FROM meals WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  res.status(204).end();
});

// ---------- Poids ----------

router.put('/weights', async function (req, res) {
  var b = req.body || {};
  var result = await pool.query(
    'INSERT INTO weights (user_id, date, kg) VALUES ($1,$2,$3) ' +
    'ON CONFLICT (user_id, date) DO UPDATE SET kg = excluded.kg RETURNING *',
    [req.userId, b.date, b.kg]
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
  var value = b.value === undefined ? null : b.value;
  var isSlot = DIET_SLOT_FIELDS.indexOf(b.field) !== -1;

  var existing = await pool.query('SELECT custom_meals FROM diet_days WHERE user_id = $1 AND date = $2', [req.userId, b.date]);
  var customMeals = (existing.rows[0] && existing.rows[0].custom_meals) || {};

  if (isSlot) {
    if (value === 'CUSTOM') {
      var cm = b.customMeal || {};
      customMeals = Object.assign({}, customMeals);
      customMeals[b.field] = {
        name: String(cm.name || '').trim().slice(0, 80),
        kcal: Math.max(0, parseInt(cm.kcal, 10) || 0)
      };
    } else if (customMeals[b.field]) {
      customMeals = Object.assign({}, customMeals);
      delete customMeals[b.field];
    }
  }

  var result = await pool.query(
    'INSERT INTO diet_days (user_id, date, ' + column + ', custom_meals) VALUES ($1,$2,$3,$4) ' +
    'ON CONFLICT (user_id, date) DO UPDATE SET ' + column + ' = $3, custom_meals = $4 RETURNING *',
    [req.userId, b.date, value, JSON.stringify(customMeals)]
  );
  res.json(mapDietDay(result.rows[0]));
});

module.exports = router;
