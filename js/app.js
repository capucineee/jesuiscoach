(function () {
  'use strict';

  /* ==========================================================================
     Constantes & données de référence
     ========================================================================== */

  var SESSION_TYPES = [
    { id: 'muscu',   label: 'Musculation', icon: '🏋️', color: '#2a78d6' },
    { id: 'pilates', label: 'Pilates',     icon: '🧘',  color: '#eb6834' },
    { id: 'cardio',  label: 'Cardio',      icon: '🔥',  color: '#1baf7a' },
    { id: 'autre',   label: 'Autres',      icon: '⭐',  color: '#eda100' }
  ];

  var CHECKLIST_CATEGORIES = [
    { id: 'supplement', label: 'Compléments', icon: '💊' },
    { id: 'medication', label: 'Médicaments', icon: '🩺' }
  ];

  // Plan alimentaire de Killian (homme). Voir DIET_PLAN_WOMAN pour celui de Capucine —
  // le plan actif dépend du sexe renseigné sur le profil (voir activeDietPlan()).
  var DIET_PLAN_MAN = {
    breakfast: [
      { id: 'B1', name: 'Œufs, courgettes et tartine', kcal: 460, p: 29, g: 27, l: 25 },
      { id: 'B2', name: 'Bol de skyr', kcal: 450, p: 32, g: 34, l: 20 },
      { id: 'B3', name: 'Pancakes à l’avoine', kcal: 460, p: 32, g: 33, l: 21 }
    ],
    mainMeal: [
      { id: 'P1', name: 'Poulet et pâtes complètes', kcal: 590, p: 55, g: 56, l: 14 },
      { id: 'P2', name: 'Dinde et riz', kcal: 595, p: 52, g: 61, l: 14 },
      { id: 'P3', name: 'Steak haché 5 % et pommes de terre', kcal: 600, p: 55, g: 56, l: 16 },
      { id: 'P4', name: 'Poisson blanc et riz', kcal: 605, p: 54, g: 61, l: 13 },
      { id: 'P5', name: 'Saumon, pâtes et sauce au skyr', kcal: 605, p: 51, g: 52, l: 19 },
      { id: 'P6', name: 'Tofu et lentilles', kcal: 600, p: 48, g: 57, l: 16 },
      { id: 'P7', name: 'Bavette grillée et pommes de terre', kcal: 605, p: 54, g: 61, l: 15 }
    ],
    // Sources de protéines et féculents du repas, pour composer un déjeuner/dîner
    // qui ne correspond pas exactement à une des 7 lignes ci-dessus (ex: poulet +
    // pommes de terre). Valeurs estimées à partir des grammages du plan ; les
    // féculents incluent l'accompagnement légumes + huile habituel.
    protein: [
      { id: 'POULET', name: 'Poulet', kcal: 200, p: 41, g: 0, l: 3 },
      { id: 'DINDE', name: 'Dinde', kcal: 190, p: 43, g: 0, l: 2 },
      { id: 'STEAK', name: 'Steak haché 5 %', kcal: 240, p: 42, g: 0, l: 10 },
      { id: 'POISSON', name: 'Poisson blanc', kcal: 205, p: 45, g: 0, l: 2 },
      { id: 'SAUMON', name: 'Saumon', kcal: 215, p: 24, g: 0, l: 13 },
      { id: 'TOFU', name: 'Tofu ferme', kcal: 220, p: 23, g: 3, l: 14 },
      { id: 'BAVETTE', name: 'Bavette', kcal: 250, p: 42, g: 0, l: 9 }
    ],
    carb: [
      { id: 'PATES', name: 'Pâtes complètes (+ légumes)', kcal: 390, p: 13, g: 61, l: 10 },
      { id: 'RIZ', name: 'Riz (+ légumes)', kcal: 400, p: 9, g: 62, l: 12 },
      { id: 'PDT', name: 'Pommes de terre (+ légumes)', kcal: 360, p: 13, g: 57, l: 6 },
      { id: 'LENTILLES', name: 'Lentilles (+ légumes)', kcal: 360, p: 22, g: 55, l: 2 }
    ],
    snack: [
      { id: 'C1', name: 'Skyr, banane et Kinder', kcal: 340, p: 23, g: 40, l: 10 },
      { id: 'C2', name: 'Fromage blanc, banane et amandes', kcal: 355, p: 24, g: 37, l: 12 },
      { id: 'C3', name: 'Tartine et chocolat', kcal: 330, p: 25, g: 35, l: 9 }
    ],
    dessert: [
      { id: 'S1', name: 'Fromage blanc et pomme', kcal: 220, p: 23, g: 31, l: 1 },
      { id: 'S2', name: 'Skyr et banane', kcal: 220, p: 24, g: 29, l: 1 }
    ]
  };
  var DIET_TARGETS_MAN = { kcal: 2200, protein: 180 };

  // Plan alimentaire de Capucine (femme), basé sur son plan plaisir à choix équivalents.
  var DIET_PLAN_WOMAN = {
    breakfast: [
      { id: 'B1', name: 'Bol banane et Kinder Bueno', kcal: 495, p: 21, g: 67, l: 17 },
      { id: 'B2', name: 'Bol skyr, avoine et banane', kcal: 490, p: 28, g: 68, l: 12 },
      { id: 'B3', name: 'Œuf, tartine, skyr et banane', kcal: 485, p: 27, g: 61, l: 16 }
    ],
    mainMeal: [
      { id: 'P1', name: 'Poulet et pâtes complètes', kcal: 620, p: 29, g: 83, l: 19 },
      { id: 'P2', name: 'Dinde et riz', kcal: 600, p: 25, g: 87, l: 17 },
      { id: 'P3', name: 'Steak haché 5 % et pommes de terre', kcal: 600, p: 27, g: 77, l: 19 },
      { id: 'P4', name: 'Poisson blanc et riz', kcal: 615, p: 25, g: 91, l: 17 },
      { id: 'P5', name: 'Saumon, pâtes et sauce au skyr', kcal: 545, p: 32, g: 80, l: 10 },
      { id: 'P6', name: 'Tofu et lentilles', kcal: 595, p: 33, g: 77, l: 18 },
      { id: 'P7', name: 'Bavette grillée et pommes de terre', kcal: 600, p: 26, g: 79, l: 20 }
    ],
    // Sources de protéines et féculents du repas, décomposées à partir des 7 lignes
    // ci-dessus pour permettre de composer un déjeuner/dîner sur-mesure (ex: poulet +
    // pommes de terre plutôt que poulet + pâtes). Valeurs estimées, approximatives.
    protein: [
      { id: 'POULET', name: 'Poulet', kcal: 80, p: 16, g: 0, l: 2 },
      { id: 'DINDE', name: 'Dinde', kcal: 75, p: 17, g: 0, l: 1 },
      { id: 'STEAK', name: 'Steak haché 5 %', kcal: 95, p: 15, g: 0, l: 4 },
      { id: 'POISSON', name: 'Poisson blanc', kcal: 57, p: 13, g: 0, l: 1 },
      { id: 'SAUMON', name: 'Saumon (+ sauce skyr)', kcal: 145, p: 15, g: 1, l: 8 },
      { id: 'TOFU', name: 'Tofu ferme', kcal: 116, p: 12, g: 2, l: 7 },
      { id: 'BAVETTE', name: 'Bavette', kcal: 90, p: 13, g: 0, l: 4 }
    ],
    carb: [
      { id: 'PATES', name: 'Pâtes complètes (+ légumes)', kcal: 546, p: 16, g: 76, l: 18 },
      { id: 'RIZ', name: 'Riz (+ légumes)', kcal: 546, p: 10, g: 87, l: 16 },
      { id: 'PDT', name: 'Pommes de terre (+ légumes)', kcal: 490, p: 11, g: 75, l: 15 },
      { id: 'LENTILLES', name: 'Lentilles et pâtes (+ légumes)', kcal: 483, p: 21, g: 70, l: 13 }
    ],
    snack: [
      { id: 'C1', name: 'Skyr, banane et Kinder Bueno', kcal: 300, p: 15, g: 39, l: 11 },
      { id: 'C2', name: 'Fromage blanc, banane et amandes', kcal: 295, p: 18, g: 38, l: 11 },
      { id: 'C3', name: 'Tartine chocolat noir et pomme', kcal: 315, p: 15, g: 47, l: 8 }
    ],
    dessert: [
      { id: 'S1', name: 'Skyr, fraises et Schoko-Bons', kcal: 160, p: 12, g: 18, l: 5 },
      { id: 'S2', name: 'Skyr et chocolat noir', kcal: 150, p: 12, g: 11, l: 7 },
      { id: 'S3', name: 'Fromage blanc et pomme', kcal: 150, p: 12, g: 27, l: 1 }
    ]
  };
  var DIET_TARGETS_WOMAN = { kcal: 1800, protein: 100 };

  // Blocs simples (une seule option à choisir) : petit-déjeuner, goûter, dessert.
  // Le déjeuner et le dîner ont leur propre logique (protéine + féculent) gérée à part.
  var DIET_SLOTS = [
    { field: 'breakfast', label: 'Petit-déjeuner', category: 'breakfast' },
    { field: 'snack', label: 'Goûter', category: 'snack' },
    { field: 'dessert', label: 'Dessert du soir', category: 'dessert' }
  ];
  var DIET_MEALS = [
    { field: 'lunch', label: 'Déjeuner' },
    { field: 'dinner', label: 'Dîner', allowRestaurant: true }
  ];

  function activeDietPlan() { return (state.profile && state.profile.sex === 'f') ? DIET_PLAN_WOMAN : DIET_PLAN_MAN; }
  function activeDietTargets() { return (state.profile && state.profile.sex === 'f') ? DIET_TARGETS_WOMAN : DIET_TARGETS_MAN; }

  var QUOTES = [
    "Chaque séance compte, {name}. Un pas de plus vers l'objectif.",
    "La discipline d'aujourd'hui, c'est le résultat de demain.",
    "T'as pas besoin d'être motivé tous les jours, juste régulier.",
    "Un bon repas, une bonne séance : la routine qui paie.",
    "{name}, ton seul adversaire aujourd'hui c'est toi d'hier.",
    "Les progrès sont silencieux avant d'être visibles. Continue.",
    "Pas besoin d'une séance parfaite, juste d'une séance faite.",
    "La régularité bat l'intensité sur la durée.",
    "Ton corps peut. C'est ta tête qu'il faut convaincre aujourd'hui.",
    "Un jour difficile est un jour qui te rend plus fort, {name}.",
    "On ne voit pas les efforts, on voit les résultats. Fais les efforts.",
    "Manger propre, s'entraîner dur, rester patient.",
    "Le meilleur moment pour s'entraîner, c'est maintenant.",
    "Chaque répétition te rapproche de la version que tu veux devenir.",
    "La fatigue est temporaire, l'abandon est définitif. Vas-y doucement mais vas-y.",
    "{name}, une petite victoire aujourd'hui vaut mieux qu'un grand projet jamais commencé.",
    "Ton futur toi te remerciera pour la séance d'aujourd'hui.",
    "La différence entre essayer et réussir, c'est la constance.",
    "Pas de journée parfaite nécessaire, juste une journée où tu ne lâches rien.",
    "Respire, concentre-toi, donne ce que tu as aujourd'hui.",
    "Ce n'est pas facile, mais ça en vaut la peine, {name}.",
    "Un aliment à la fois, une séance à la fois.",
    "La motivation te lance, l'habitude te fait continuer.",
    "Aujourd'hui est une nouvelle occasion de progresser.",
    "Sois fier du chemin parcouru, même les jours calmes comptent.",
    "{name}, la version de toi de dans 3 mois te regarde. Fais un truc pour elle.",
    "L'effort ne trompe jamais sur le long terme.",
    "Un pas en arrière n'efface pas tous ceux en avant.",
    "Le corps atteint ce que l'esprit croit possible.",
    "Petit déjeuner solide, journée solide.",
    "Tu n'as pas à être extraordinaire, juste à te présenter.",
    "La progression, c'est 1% chaque jour, pas 100% un seul jour.",
    "{name}, transforme la fatigue du jour en force de demain.",
    "Bouge aujourd'hui, même un peu. Ça compte toujours.",
    "La meilleure séance est celle que tu fais vraiment.",
    "Reste patient : les résultats arrivent après la régularité, pas avant."
  ];

  /* ==========================================================================
     Utilitaires date
     ========================================================================== */

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function isoFromDate(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function parseISO(s) {
    var parts = s.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function addDays(d, n) {
    var r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }

  function todayISO() { return isoFromDate(new Date()); }

  function startOfWeek(d) {
    var day = d.getDay();
    var diff = (day === 0 ? -6 : 1 - day);
    return addDays(d, diff);
  }

  function weekDates(mondayDate) {
    var out = [];
    for (var i = 0; i < 7; i++) out.push(addDays(mondayDate, i));
    return out;
  }

  function fmtHeaderDate(d) {
    try {
      return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
    } catch (e) { return isoFromDate(d); }
  }

  function fmtShortWeekday(d) {
    try {
      var s = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' }).format(d);
      s = s.replace('.', '');
      return s.charAt(0).toUpperCase() + s.slice(1);
    } catch (e) { return ''; }
  }

  function fmtShortDate(d) {
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1);
  }

  function fmtWeekRange(monday) {
    var sunday = addDays(monday, 6);
    return fmtShortDate(monday) + ' – ' + fmtShortDate(sunday);
  }

  function isSameDate(a, b) { return isoFromDate(a) === isoFromDate(b); }

  function hashStr(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
    return Math.abs(h);
  }

  function quoteForDate(dateISO, name) {
    var q = QUOTES[hashStr(dateISO) % QUOTES.length];
    return q.replace('{name}', name || 'champion');
  }

  function minutesToLabel(min) {
    if (min <= 0) return '0 min';
    if (min < 60) return min + ' min';
    var h = Math.floor(min / 60), m = min % 60;
    return h + 'h' + (m ? pad(m) : '');
  }

  /* ==========================================================================
     State
     ========================================================================== */

  function defaultState() {
    return {
      profiles: [],
      profile: { id: null, name: '', sex: 'h', weeklyGoal: 4 },
      sessions: [],
      meals: [],
      weights: [],
      dietDays: [],
      checklistItems: [],
      checklistLogs: []
    };
  }

  var TOKEN_KEY = 'jsc.token';
  var EMAIL_KEY = 'jsc.email';
  var CACHE_KEY = 'jsc.cache';
  var ACTIVE_PROFILE_KEY = 'jsc.activeProfile';

  var state = defaultState();
  var auth = { token: null, email: '' };
  var ui = { tab: 'jour', weekOffset: 0, period: '7', customStart: '', customEnd: '', sheet: null, draft: {}, authTab: 'login', authBusy: false, authSex: 'h', dietDate: todayISO(), activeProfileId: null };

  function loadCachedState() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      var d = defaultState();
      return {
        profiles: parsed.profiles || [],
        profile: Object.assign({}, d.profile, parsed.profile || {}),
        sessions: parsed.sessions || [],
        meals: parsed.meals || [],
        weights: parsed.weights || [],
        dietDays: parsed.dietDays || [],
        checklistItems: parsed.checklistItems || [],
        checklistLogs: parsed.checklistLogs || []
      };
    } catch (e) { return null; }
  }

  function cacheStateLocally() {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* ==========================================================================
     API
     ========================================================================== */

  function apiFetch(path, opts) {
    opts = opts || {};
    var headers = { 'Content-Type': 'application/json' };
    if (auth.token) headers.Authorization = 'Bearer ' + auth.token;
    return fetch(path, { method: opts.method || 'GET', headers: headers, body: opts.body }).then(function (res) {
      if (res.status === 204) return null;
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) {
          var err = new Error((data && data.error) || 'Erreur serveur, réessaie.');
          err.status = res.status;
          throw err;
        }
        return data;
      });
    });
  }

  /* ==========================================================================
     Data helpers
     ========================================================================== */

  function typeMeta(id) {
    for (var i = 0; i < SESSION_TYPES.length; i++) if (SESSION_TYPES[i].id === id) return SESSION_TYPES[i];
    return SESSION_TYPES[SESSION_TYPES.length - 1];
  }

  function sessionsOn(dateISO) {
    return state.sessions.filter(function (s) { return s.date === dateISO; });
  }

  function sessionsInRange(startISO, endISO) {
    return state.sessions.filter(function (s) { return s.date >= startISO && s.date <= endISO; });
  }

  function findDietOption(category, id) {
    if (!id) return null;
    var list = activeDietPlan()[category] || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function dietDayFor(dateISO) {
    for (var i = 0; i < state.dietDays.length; i++) {
      if (state.dietDays[i].date === dateISO) return state.dietDays[i];
    }
    return null;
  }

  function dietDaysInRange(startISO, endISO) {
    return state.dietDays.filter(function (d) { return d.date >= startISO && d.date <= endISO; });
  }

  function dietTotalsForDay(d) {
    var total = { kcal: 0, p: 0, g: 0, l: 0 };
    if (!d) return total;
    function add(opt) {
      if (!opt) return;
      total.kcal += opt.kcal; total.p += opt.p; total.g += opt.g; total.l += opt.l;
    }
    function addCustom(field) {
      var cm = d.customMeals && d.customMeals[field];
      if (cm) { total.kcal += cm.kcal || 0; total.p += cm.p || 0; }
    }
    function addSlot(field, category) {
      if (d[field] === 'CUSTOM') addCustom(field);
      else add(findDietOption(category, d[field]));
    }
    function addMeal(field) {
      var proteinField = field + '_protein', carbField = field + '_carb';
      var hasNew = !!(d[proteinField] || d[carbField]);
      // Rétrocompatibilité : un ancien choix (plat complet ou repas personnalisé global)
      // reste compté tel quel tant qu'aucune protéine/féculent séparé n'a été choisi.
      if (!hasNew && d[field] === 'CUSTOM') { addCustom(field); return; }
      if (!hasNew && d[field] && findDietOption('mainMeal', d[field])) { add(findDietOption('mainMeal', d[field])); return; }
      // Nouveau mode : protéine + féculent choisis séparément.
      if (d[proteinField] === 'CUSTOM') addCustom(proteinField);
      else add(findDietOption('protein', d[proteinField]));
      if (d[carbField] === 'CUSTOM') addCustom(carbField);
      else add(findDietOption('carb', d[carbField]));
    }

    addSlot('breakfast', 'breakfast');
    addMeal('lunch');
    addSlot('snack', 'snack');
    if (d.dinner === 'RESTAURANT') {
      total.kcal += d.restaurantKcal || 0;
    } else {
      addMeal('dinner');
      addSlot('dessert', 'dessert');
    }
    return total;
  }

  function applyDietRow(dateISO, row) {
    var existing = dietDayFor(dateISO);
    if (existing) {
      existing.breakfast = row.breakfast; existing.lunch = row.lunch; existing.snack = row.snack;
      existing.dinner = row.dinner; existing.dessert = row.dessert; existing.restaurantKcal = row.restaurantKcal;
      existing.customMeals = row.customMeals;
      existing.lunch_protein = row.lunch_protein; existing.lunch_carb = row.lunch_carb;
      existing.dinner_protein = row.dinner_protein; existing.dinner_carb = row.dinner_carb;
    } else {
      state.dietDays.push(row);
    }
    cacheStateLocally();
  }

  function pickDietOption(dateISO, field, value) {
    var existing = dietDayFor(dateISO);
    var toggleable = field !== 'restaurantKcal';
    var newValue = (toggleable && existing && existing[field] === value) ? null : value;
    return apiFetch('/api/diet', { method: 'PUT', body: JSON.stringify({ date: dateISO, field: field, value: newValue, profileId: state.profile.id }) }).then(function (row) {
      applyDietRow(dateISO, row);
    });
  }

  function saveCustomMeal(field) {
    var nameInput = document.getElementById('customName-' + field);
    var kcalInput = document.getElementById('customKcal-' + field);
    var proteinInput = document.getElementById('customProtein-' + field);
    var kcal = kcalInput ? parseInt(kcalInput.value, 10) : NaN;
    if (isNaN(kcal) || kcal <= 0) return null;
    var name = nameInput ? nameInput.value.trim() : '';
    var protein = proteinInput ? parseInt(proteinInput.value, 10) : NaN;
    if (isNaN(protein) || protein < 0) protein = 0;
    return apiFetch('/api/diet', {
      method: 'PUT',
      body: JSON.stringify({ date: ui.dietDate, field: field, value: 'CUSTOM', customMeal: { name: name, kcal: kcal, p: protein }, profileId: state.profile.id })
    }).then(function (row) {
      applyDietRow(ui.dietDate, row);
    });
  }

  function addSession(obj) {
    return apiFetch('/api/sessions', { method: 'POST', body: JSON.stringify({
      date: obj.date, typeId: obj.typeId, duration: obj.duration, intensity: obj.intensity,
      note: obj.note || '', exercises: obj.exercises || [], profileId: state.profile.id
    }) }).then(function (row) {
      state.sessions.push(row);
      cacheStateLocally();
    });
  }

  function toggleSessionDone(id) {
    var s = state.sessions.filter(function (x) { return x.id === id; })[0];
    if (!s) return Promise.resolve();
    return apiFetch('/api/sessions/' + id, { method: 'PATCH', body: JSON.stringify({ done: !s.done }) }).then(function (row) {
      s.done = row.done;
      cacheStateLocally();
    });
  }

  function deleteSession(id) {
    return apiFetch('/api/sessions/' + id, { method: 'DELETE' }).then(function () {
      state.sessions = state.sessions.filter(function (s) { return s.id !== id; });
      cacheStateLocally();
    });
  }

  function addWeight(dateISO, kg) {
    return apiFetch('/api/weights', { method: 'PUT', body: JSON.stringify({ date: dateISO, kg: kg, profileId: state.profile.id }) }).then(function (row) {
      var existing = state.weights.filter(function (w) { return w.date === dateISO; })[0];
      if (existing) existing.kg = row.kg;
      else state.weights.push(row);
      state.weights.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      cacheStateLocally();
    });
  }

  function deleteWeight(id) {
    return apiFetch('/api/weights/' + id, { method: 'DELETE' }).then(function () {
      state.weights = state.weights.filter(function (w) { return w.id !== id; });
      cacheStateLocally();
    });
  }

  /* ==========================================================================
     Compléments & médicaments
     ========================================================================== */

  function checklistItemsByCategory(category) {
    return state.checklistItems.filter(function (it) { return it.category === category; });
  }

  function isChecklistDone(itemId, dateISO) {
    return state.checklistLogs.some(function (l) { return l.itemId === itemId && l.date === dateISO; });
  }

  function addChecklistItem(category, title) {
    return apiFetch('/api/checklist-items', { method: 'POST', body: JSON.stringify({ category: category, title: title, profileId: state.profile.id }) }).then(function (item) {
      state.checklistItems.push(item);
      cacheStateLocally();
    });
  }

  function deleteChecklistItem(id) {
    return apiFetch('/api/checklist-items/' + id, { method: 'DELETE' }).then(function () {
      state.checklistItems = state.checklistItems.filter(function (it) { return it.id !== id; });
      state.checklistLogs = state.checklistLogs.filter(function (l) { return l.itemId !== id; });
      cacheStateLocally();
    });
  }

  function toggleChecklistItem(itemId, dateISO) {
    var done = !isChecklistDone(itemId, dateISO);
    return apiFetch('/api/checklist-logs', { method: 'PUT', body: JSON.stringify({ itemId: itemId, date: dateISO, done: done }) }).then(function () {
      if (done) state.checklistLogs.push({ itemId: itemId, date: dateISO });
      else state.checklistLogs = state.checklistLogs.filter(function (l) { return !(l.itemId === itemId && l.date === dateISO); });
      cacheStateLocally();
    });
  }

  function currentStreak() {
    var streak = 0;
    var cursor = new Date();
    for (var i = 0; i < 365; i++) {
      var iso = isoFromDate(cursor);
      var hasDone = state.sessions.some(function (s) { return s.date === iso && s.done; });
      if (hasDone) { streak++; cursor = addDays(cursor, -1); }
      else if (iso === todayISO()) { cursor = addDays(cursor, -1); continue; }
      else break;
    }
    return streak;
  }

  function typeDistribution(sessions) {
    var map = {};
    SESSION_TYPES.forEach(function (t) { map[t.id] = { type: t, count: 0, minutes: 0 }; });
    sessions.forEach(function (s) {
      if (!map[s.typeId]) return;
      map[s.typeId].count++;
      map[s.typeId].minutes += (s.duration || 0);
    });
    return SESSION_TYPES.map(function (t) { return map[t.id]; }).filter(function (e) { return e.count > 0; });
  }

  function exerciseProgression() {
    var map = {};
    var sorted = state.sessions.slice().sort(function (a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
    sorted.forEach(function (s) {
      (s.exercises || []).forEach(function (ex) {
        if (!ex.sets || !ex.sets.length) return;
        var key = ex.name.trim().toLowerCase();
        var maxWeight = ex.sets.reduce(function (m, st) { return Math.max(m, st.weight || 0); }, 0);
        if (!map[key]) map[key] = { name: ex.name.trim(), occurrences: [] };
        map[key].name = ex.name.trim();
        map[key].occurrences.push({ date: s.date, weight: maxWeight });
      });
    });
    return Object.keys(map).map(function (k) { return map[k]; }).sort(function (a, b) {
      var la = a.occurrences[a.occurrences.length - 1].date;
      var lb = b.occurrences[b.occurrences.length - 1].date;
      return la < lb ? 1 : (la > lb ? -1 : 0);
    });
  }

  function progressionRowHTML(e) {
    var n = e.occurrences.length;
    var last = e.occurrences[n - 1];
    var prev = n >= 2 ? e.occurrences[n - 2] : null;
    var trendHTML;
    if (!prev) {
      trendHTML = '<span class="progress-trend new">Nouveau</span>';
    } else {
      var delta = Math.round((last.weight - prev.weight) * 10) / 10;
      if (delta > 0) trendHTML = '<span class="progress-trend up">▲ +' + delta + ' kg</span>';
      else if (delta < 0) trendHTML = '<span class="progress-trend down">▼ ' + delta + ' kg</span>';
      else trendHTML = '<span class="progress-trend stable">— stable</span>';
    }
    return '<div class="progress-row">' +
      '<div class="progress-info"><div class="pr-name">' + esc(e.name) + '</div><div class="pr-sub">' + last.weight + ' kg · ' + esc(fmtShortDate(parseISO(last.date))) + '</div></div>' +
      trendHTML +
      '</div>';
  }

  /* ==========================================================================
     Petits composants SVG (mark specs: barres <=24px, coins 4px, gap 2px)
     ========================================================================== */

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function svgOpen(w, h) {
    return '<svg class="chart-svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="xMidYMid meet" role="img">';
  }

  function barChartWeek(days, values, maxOverride) {
    var w = 320, h = 150, padL = 6, padR = 6, padB = 22, padT = 18;
    var plotW = w - padL - padR, plotH = h - padB - padT;
    var n = values.length;
    var slot = plotW / n;
    var barW = Math.min(24, slot * 0.55);
    var max = maxOverride || Math.max.apply(null, values.concat([1]));
    var svg = svgOpen(w, h);
    svg += '<line class="baseline" x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (w - padR) + '" y2="' + (padT + plotH) + '"/>';
    for (var i = 0; i < n; i++) {
      var cx = padL + slot * i + slot / 2;
      var v = values[i];
      var bh = max > 0 ? (v / max) * (plotH - 14) : 0;
      var x = cx - barW / 2;
      var y = padT + plotH - bh;
      var isToday = (days[i].isToday);
      var color = isToday ? 'var(--series-1)' : 'var(--seq-300)';
      if (bh > 0.5) {
        svg += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + barW.toFixed(1) + '" height="' + Math.max(bh, 2).toFixed(1) + '" rx="4" fill="' + color + '"><title>' + esc(days[i].label) + ': ' + esc(minutesToLabel(v)) + '</title></rect>';
        svg += '<text class="value-label" x="' + cx.toFixed(1) + '" y="' + (y - 6).toFixed(1) + '" text-anchor="middle">' + (v >= 60 ? minutesToLabel(v) : v) + '</text>';
      } else {
        svg += '<rect x="' + x.toFixed(1) + '" y="' + (padT + plotH - 2).toFixed(1) + '" width="' + barW.toFixed(1) + '" height="2" rx="1" fill="var(--surface-3)"/>';
      }
      svg += '<text class="axis-label" x="' + cx.toFixed(1) + '" y="' + (h - 6).toFixed(1) + '" text-anchor="middle">' + esc(days[i].label) + '</text>';
    }
    svg += '</svg>';
    return svg;
  }

  function stackedBarDistribution(entries, totalCount) {
    var w = 320, h = 40;
    var total = entries.reduce(function (a, e) { return a + e.count; }, 0) || 1;
    var svg = svgOpen(w, h);
    var x = 0;
    var gap = 2;
    var usableW = w - (entries.length - 1) * gap;
    entries.forEach(function (e, idx) {
      var segW = (e.count / total) * usableW;
      var rx = 4;
      svg += '<rect x="' + x.toFixed(1) + '" y="0" width="' + Math.max(segW, 1).toFixed(1) + '" height="' + h + '" rx="' + rx + '" fill="' + e.type.color + '"><title>' + esc(e.type.label) + ': ' + e.count + ' séance(s) • ' + esc(minutesToLabel(e.minutes)) + '</title></rect>';
      x += segW + gap;
    });
    svg += '</svg>';
    return svg;
  }

  function lineChartSeries(points, color, labelFmt) {
    var w = 320, h = 130, padL = 8, padR = 8, padT = 16, padB = 20;
    var plotW = w - padL - padR, plotH = h - padT - padB;
    var n = points.length;
    if (n < 2) {
      return '<div class="empty-state">Pas encore assez de données sur cette période.</div>';
    }
    var max = Math.max.apply(null, points.map(function (p) { return p.v; }).concat([1]));
    var min = 0;
    var stepX = plotW / (n - 1);
    var coords = points.map(function (p, i) {
      var x = padL + stepX * i;
      var y = padT + (max > min ? (1 - (p.v - min) / (max - min)) : 0) * plotH;
      return { x: x, y: y, v: p.v };
    });
    var pathD = coords.map(function (c, i) { return (i === 0 ? 'M' : 'L') + c.x.toFixed(1) + ',' + c.y.toFixed(1); }).join(' ');
    var areaD = pathD + ' L' + coords[coords.length - 1].x.toFixed(1) + ',' + (padT + plotH) + ' L' + coords[0].x.toFixed(1) + ',' + (padT + plotH) + ' Z';
    var svg = svgOpen(w, h);
    svg += '<line class="baseline" x1="' + padL + '" y1="' + (padT + plotH) + '" x2="' + (w - padR) + '" y2="' + (padT + plotH) + '"/>';
    svg += '<path d="' + areaD + '" fill="' + color + '" opacity="0.1" stroke="none"/>';
    svg += '<path d="' + pathD + '" fill="none" stroke="' + color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    coords.forEach(function (c, i) {
      if (i === coords.length - 1 || i === 0 || points[i].v === max) {
        svg += '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="4" fill="' + color + '" stroke="var(--surface-1)" stroke-width="2"><title>' + esc(points[i].label) + ': ' + esc(labelFmt(points[i].v)) + '</title></circle>';
      } else {
        svg += '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="7" fill="transparent"><title>' + esc(points[i].label) + ': ' + esc(labelFmt(points[i].v)) + '</title></circle>';
      }
    });
    var last = coords[coords.length - 1];
    svg += '<text class="value-label" x="' + Math.min(last.x, w - 26).toFixed(1) + '" y="' + Math.max(last.y - 10, 12).toFixed(1) + '" text-anchor="middle">' + esc(labelFmt(points[points.length - 1].v)) + '</text>';
    [0, n - 1, Math.floor((n - 1) / 2)].forEach(function (i) {
      svg += '<text class="axis-label" x="' + coords[i].x.toFixed(1) + '" y="' + (h - 4) + '" text-anchor="middle">' + esc(points[i].label) + '</text>';
    });
    svg += '</svg>';
    return svg;
  }

  function meterHTML(value, max, colorVar) {
    var pct = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;
    return '<div class="meter-wrap"><div class="meter-track"><div class="meter-fill" style="width:' + pct + '%;' + (colorVar ? 'background:' + colorVar + ';' : '') + '"></div></div><div class="meter-value">' + pct + '%</div></div>';
  }

  function legendHTML(entries) {
    return '<div class="legend">' + entries.map(function (e) {
      return '<span class="legend-item"><span class="legend-swatch" style="background:' + e.type.color + '"></span>' + esc(e.type.label) + ' · ' + e.count + '</span>';
    }).join('') + '</div>';
  }

  function tableToggle(id, rowsHTML, headers) {
    return '<details class="table-toggle"><summary style="cursor:pointer;color:var(--text-muted);font-size:12px;margin-top:10px;">Voir en tableau</summary>' +
      '<table style="width:100%;margin-top:8px;font-size:12px;border-collapse:collapse;">' +
      '<thead><tr>' + headers.map(function (h) { return '<th style="text-align:left;padding:4px 6px;color:var(--text-muted);border-bottom:1px solid var(--border);">' + esc(h) + '</th>'; }).join('') + '</tr></thead>' +
      '<tbody>' + rowsHTML + '</tbody></table></details>';
  }

  /* ==========================================================================
     Rendu — en-tête
     ========================================================================== */

  function renderHeader() {
    var titles = { jour: "Aujourd'hui", semaine: 'Semaine', evolution: 'Évolution', historique: 'Historique', diete: 'Diète' };
    document.getElementById('headerTitle').textContent = titles[ui.tab];
    document.getElementById('headerDate').textContent = fmtHeaderDate(new Date());
    document.querySelectorAll('.tab-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab') === ui.tab);
    });
  }

  function renderExerciseSummary(exercises) {
    var totalSets = exercises.reduce(function (a, ex) { return a + ex.sets.length; }, 0);
    var html = '<details class="exercise-details"><summary>' + exercises.length + ' exercice' + (exercises.length > 1 ? 's' : '') + ' · ' + totalSets + ' série' + (totalSets > 1 ? 's' : '') + '</summary>';
    html += '<div class="exercise-summary-list">';
    exercises.forEach(function (ex) {
      html += '<div class="exercise-summary-row"><b>' + esc(ex.name) + '</b>' +
        (ex.sets.length ? ' ' + ex.sets.map(function (s) { return s.weight + 'kg×' + s.reps; }).join(', ') : ' —') +
        '</div>';
    });
    html += '</div></details>';
    return html;
  }

  function sessionCardHTML(s) {
    var t = typeMeta(s.typeId);
    var exercises = s.exercises || [];
    var totalSets = exercises.reduce(function (a, ex) { return a + ex.sets.length; }, 0);
    return '<div class="session-card" style="margin-bottom:10px;">' +
      '<div class="session-row">' +
      '<div class="session-dot" style="background:' + t.color + '1a;border-color:' + t.color + '55;">' + t.icon + '</div>' +
      '<div class="session-info"><div class="t">' + esc(t.label) + '</div><div class="d">' + minutesToLabel(s.duration) + ' • intensité ' + s.intensity + '/5' + (totalSets ? ' • ' + totalSets + ' séries' : '') + (s.note ? ' • ' + esc(s.note) : '') + '</div></div>' +
      '<div class="session-actions">' +
      '<button class="btn-dup" data-action="duplicate-session" data-id="' + s.id + '" aria-label="Dupliquer la séance"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>' +
      '<button class="btn-check' + (s.done ? ' done' : '') + '" data-action="toggle-session" data-id="' + s.id + '" aria-label="Marquer fait">✓</button>' +
      '<button class="btn-del" data-action="delete-session" data-id="' + s.id + '" aria-label="Supprimer">✕</button>' +
      '</div></div>' +
      (exercises.length ? renderExerciseSummary(exercises) : '') +
      '</div>';
  }

  var GOAL_MESSAGES = [
    function (n, s, name) { return { title: '🔥 Objectif explosé !', body: n + ' séance' + s + ' cette semaine' + name + '. T’es sur une autre planète.' }; },
    function (n, s, name) { return { title: '🏆 Mission accomplie !', body: n + ' séance' + s + ' bouclée' + s + name + '. Cette semaine restera dans les annales.' }; },
    function (n, s, name) { return { title: '💥 Et voilà, c’est fait !', body: n + ' séance' + s + name + '. Le repos est mérité, la machine tourne.' }; },
    function (n, s, name) { return { title: '🎯 Dans le mille !', body: 'Objectif rempli avec ' + n + ' séance' + s + name + '. Une habitude qui s’installe.' }; },
    function (n, s, name) { return { title: '👑 Semaine de champion !', body: n + ' séance' + s + name + '. Reste plus qu’à la battre la semaine prochaine.' }; },
    function (n, s, name) { return { title: '⚡ Objectif smashé !', body: n + ' séance' + s + ' cette semaine' + name + '. Ambition validée.' }; },
    function (n, s, name) { return { title: '🚀 Tu l’as fait !', body: n + ' séance' + s + name + '. La régularité, c’est ça le vrai talent.' }; },
    function (n, s, name) { return { title: '🌟 Objectif atteint, haut la main !', body: n + ' séance' + s + ' cette semaine' + name + '. Ce niveau-là, tu le gardes.' }; }
  ];

  function goalBannerHTML(doneCount, weeklyGoal, isCurrentWeek, weekStartISO) {
    if (!isCurrentWeek || doneCount < weeklyGoal) return '';
    var s = doneCount > 1 ? 's' : '';
    var name = state.profile.name ? ', ' + esc(state.profile.name) : '';
    var msg = GOAL_MESSAGES[hashStr(weekStartISO) % GOAL_MESSAGES.length](doneCount, s, name);
    return '<div class="goal-banner">' +
      '<div class="gb-title">' + msg.title + '</div>' +
      '<div class="gb-sub">' + msg.body + ' Ça repart à zéro lundi.</div>' +
      '</div>';
  }


  /* ==========================================================================
     Vue Jour
     ========================================================================== */

  function profileSwitcherHTML() {
    if (!state.profiles || state.profiles.length < 2) return '';
    var pills = state.profiles.map(function (p) {
      var active = p.id === state.profile.id;
      return '<button type="button" class="profile-pill' + (active ? ' active' : '') + '" data-action="pick-profile" data-id="' + p.id + '">' + esc(p.name || '?') + '</button>';
    }).join('');
    return '<div class="profile-switcher">' + pills + '</div>';
  }

  function renderDay() {
    var iso = todayISO();
    var todays = sessionsOn(iso);
    var weekMonday = startOfWeek(new Date());
    var weekEnd = addDays(weekMonday, 6);
    var weekSessions = sessionsInRange(isoFromDate(weekMonday), isoFromDate(weekEnd));
    var doneThisWeek = weekSessions.filter(function (s) { return s.done; }).length;
    var streak = currentStreak();
    var quote = quoteForDate(iso, state.profile.name);

    var html = '';

    html += profileSwitcherHTML();

    html += '<div class="motivation-card">' +
      '<div class="quote-mark">“</div>' +
      '<p>' + esc(quote) + '</p>' +
      '<div class="signature">Message du jour</div>' +
      '</div>';

    var todayKcal = dietTotalsForDay(dietDayFor(iso)).kcal;

    html += '<div class="stat-row">' +
      '<div class="stat-tile"><div class="value accent">' + doneThisWeek + '/' + state.profile.weeklyGoal + '</div><div class="label">séances<br/>objectif semaine</div></div>' +
      '<div class="stat-tile"><div class="value">' + streak + ' 🔥</div><div class="label">jours de suite</div></div>' +
      '<div class="stat-tile"><div class="value good">' + (todayKcal || '–') + '</div><div class="label">kcal du jour<br/>objectif ' + activeDietTargets().kcal + '</div></div>' +
      '</div>';

    html += goalBannerHTML(doneThisWeek, state.profile.weeklyGoal, true, isoFromDate(weekMonday));

    html += '<div class="card">';
    html += '<div class="card-title">Séance du jour</div>';
    if (todays.length === 0) {
      html += '<div class="empty-state">Aucune séance enregistrée aujourd’hui.</div>';
    } else {
      todays.forEach(function (s) { html += sessionCardHTML(s); });
    }
    html += '<button class="btn-add-inline" data-action="open-sheet" data-sheet="session" style="margin-top:4px;">+ Ajouter une séance</button>';
    html += '</div>';

    html += checklistCardHTML(iso);

    html += '<button class="btn-add-inline" data-action="switch-tab" data-tab="diete">🍽️ Remplir ma diète du jour</button>';

    document.getElementById('view').innerHTML = html;
  }

  function checklistCardHTML(dateISO) {
    if (!state.checklistItems.length) return '';
    var html = '<div class="card"><div class="card-title">À prendre aujourd’hui</div>';
    CHECKLIST_CATEGORIES.forEach(function (cat) {
      var items = checklistItemsByCategory(cat.id);
      if (!items.length) return;
      html += '<div class="diet-subheading">' + cat.icon + ' ' + esc(cat.label) + '</div>';
      html += '<div class="checklist-list">';
      items.forEach(function (it) {
        var done = isChecklistDone(it.id, dateISO);
        html += '<div class="checklist-row">' +
          '<button class="btn-check' + (done ? ' done' : '') + '" data-action="toggle-checklist" data-id="' + it.id + '" aria-label="Valider">✓</button>' +
          '<span class="checklist-title' + (done ? ' done' : '') + '">' + esc(it.title) + '</span>' +
          '</div>';
      });
      html += '</div>';
    });
    html += '</div>';
    return html;
  }

  /* ==========================================================================
     Vue Historique
     ========================================================================== */

  function renderHistorique() {
    var byDate = {};
    state.sessions.forEach(function (s) {
      if (!byDate[s.date]) byDate[s.date] = [];
      byDate[s.date].push(s);
    });
    var dates = Object.keys(byDate).sort(function (a, b) { return a < b ? 1 : (a > b ? -1 : 0); });

    var html = '';
    html += '<button class="btn-add-inline" data-action="open-sheet" data-sheet="session">+ Ajouter une séance</button>';

    if (dates.length === 0) {
      html += '<div class="card"><div class="empty-state">Aucune séance enregistrée pour l’instant.</div></div>';
    } else {
      dates.forEach(function (dateISO) {
        var daySessions = byDate[dateISO];
        html += '<div class="card">';
        html += '<div class="card-title">' + esc(fmtHeaderDate(parseISO(dateISO))) + '</div>';
        daySessions.forEach(function (s) { html += sessionCardHTML(s); });
        html += '</div>';
      });
    }

    document.getElementById('view').innerHTML = html;
  }

  /* ==========================================================================
     Vue Semaine
     ========================================================================== */

  function renderWeek() {
    var monday = addDays(startOfWeek(new Date()), ui.weekOffset * 7);
    var days = weekDates(monday);
    var startISO = isoFromDate(days[0]), endISO = isoFromDate(days[6]);
    var weekSessions = sessionsInRange(startISO, endISO);
    var weekDiet = dietDaysInRange(startISO, endISO);

    var dayLabels = days.map(function (d) {
      return { label: fmtShortWeekday(d), isToday: isSameDate(d, new Date()) };
    });
    var dayValues = days.map(function (d) {
      var iso = isoFromDate(d);
      return weekSessions.filter(function (s) { return s.date === iso; }).reduce(function (a, s) { return a + (s.duration || 0); }, 0);
    });

    var totalMinutes = weekSessions.reduce(function (a, s) { return a + (s.duration || 0); }, 0);
    var doneCount = weekSessions.filter(function (s) { return s.done; }).length;
    var weekKcalTotals = weekDiet.map(function (d) { return dietTotalsForDay(d).kcal; }).filter(function (k) { return k > 0; });
    var avgKcal = weekKcalTotals.length ? Math.round(weekKcalTotals.reduce(function (a, k) { return a + k; }, 0) / weekKcalTotals.length) : null;
    var dist = typeDistribution(weekSessions);

    var html = '';

    html += '<div class="card"><div class="week-nav">' +
      '<button class="icon-btn" data-action="week-nav" data-dir="-1" aria-label="Semaine précédente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<div class="label">' + (ui.weekOffset === 0 ? 'Cette semaine · ' : '') + fmtWeekRange(monday) + '</div>' +
      '<button class="icon-btn" data-action="week-nav" data-dir="1" aria-label="Semaine suivante" ' + (ui.weekOffset >= 0 ? 'disabled style="opacity:.35"' : '') + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button>' +
      '</div></div>';

    html += '<div class="stat-row">' +
      '<div class="stat-tile"><div class="value accent">' + doneCount + '/' + state.profile.weeklyGoal + '</div><div class="label">séances<br/>vs objectif</div></div>' +
      '<div class="stat-tile"><div class="value">' + minutesToLabel(totalMinutes) + '</div><div class="label">temps total</div></div>' +
      '<div class="stat-tile"><div class="value good">' + (avgKcal === null ? '–' : avgKcal) + '</div><div class="label">kcal moy.<br/>/ jour</div></div>' +
      '</div>';

    html += goalBannerHTML(doneCount, state.profile.weeklyGoal, ui.weekOffset === 0, startISO);

    html += '<div class="card"><div class="card-title">Minutes d’entraînement <span class="sub">par jour</span></div>';
    html += '<figure class="chart-figure">' + barChartWeek(dayLabels, dayValues) + '</figure>';
    html += tableToggle('week-bar', days.map(function (d, i) {
      return '<tr><td style="padding:4px 6px;">' + esc(fmtShortWeekday(d)) + '</td><td style="padding:4px 6px;">' + minutesToLabel(dayValues[i]) + '</td></tr>';
    }).join(''), ['Jour', 'Minutes']);
    html += '</div>';

    html += '<div class="card"><div class="card-title">Répartition des séances</div>';
    if (dist.length === 0) {
      html += '<div class="empty-state">Aucune séance cette semaine.</div>';
    } else {
      html += '<figure class="chart-figure">' + stackedBarDistribution(dist) + '</figure>';
      html += legendHTML(dist);
      html += tableToggle('week-dist', dist.map(function (e) {
        return '<tr><td style="padding:4px 6px;">' + esc(e.type.label) + '</td><td style="padding:4px 6px;">' + e.count + '</td><td style="padding:4px 6px;">' + minutesToLabel(e.minutes) + '</td></tr>';
      }).join(''), ['Type', 'Séances', 'Minutes']);
    }
    html += '</div>';

    document.getElementById('view').innerHTML = html;
  }

  /* ==========================================================================
     Vue Évolution
     ========================================================================== */

  function periodRange() {
    var end = new Date();
    var start;
    if (ui.period === 'custom') {
      if (ui.customStart && ui.customEnd) return { start: ui.customStart, end: ui.customEnd };
      start = addDays(end, -6);
      return { start: isoFromDate(start), end: isoFromDate(end) };
    }
    start = addDays(end, -(parseInt(ui.period, 10) - 1));
    return { start: isoFromDate(start), end: isoFromDate(end) };
  }

  function renderEvolution() {
    var range = periodRange();
    var sessions = sessionsInRange(range.start, range.end);
    var dietDays = dietDaysInRange(range.start, range.end);
    var weights = state.weights.filter(function (w) { return w.date >= range.start && w.date <= range.end; });
    var dist = typeDistribution(sessions);
    var totalMinutes = sessions.reduce(function (a, s) { return a + (s.duration || 0); }, 0);
    var days = Math.max(1, Math.round((parseISO(range.end) - parseISO(range.start)) / 86400000) + 1);
    var avgPerWeek = (sessions.length / (days / 7)).toFixed(1);

    var html = '';

    html += '<div class="card"><div class="chip-row">';
    [['7', '7 jours'], ['30', '30 jours'], ['90', '90 jours'], ['custom', 'Personnalisé']].forEach(function (p) {
      html += '<button class="chip' + (ui.period === p[0] ? ' active' : '') + '" data-action="period-chip" data-period="' + p[0] + '">' + p[1] + '</button>';
    });
    html += '</div>';
    if (ui.period === 'custom') {
      html += '<div class="custom-range">' +
        '<input type="date" id="customStartInput" value="' + (ui.customStart || range.start) + '" data-action="custom-range" data-which="start"/>' +
        '<input type="date" id="customEndInput" value="' + (ui.customEnd || range.end) + '" data-action="custom-range" data-which="end"/>' +
        '</div>';
    }
    html += '</div>';

    html += '<div class="stat-row">' +
      '<div class="stat-tile"><div class="value accent">' + sessions.length + '</div><div class="label">séances</div></div>' +
      '<div class="stat-tile"><div class="value">' + minutesToLabel(totalMinutes) + '</div><div class="label">temps total</div></div>' +
      '<div class="stat-tile"><div class="value">' + avgPerWeek + '</div><div class="label">séances<br/>/ semaine</div></div>' +
      '</div>';

    html += '<div class="card"><div class="card-title">Répartition par type</div>';
    if (dist.length === 0) {
      html += '<div class="empty-state">Aucune séance sur cette période.</div>';
    } else {
      html += '<figure class="chart-figure">' + stackedBarDistribution(dist) + '</figure>';
      html += legendHTML(dist);
      html += tableToggle('evo-dist', dist.map(function (e) {
        return '<tr><td style="padding:4px 6px;">' + esc(e.type.label) + '</td><td style="padding:4px 6px;">' + e.count + '</td><td style="padding:4px 6px;">' + minutesToLabel(e.minutes) + '</td></tr>';
      }).join(''), ['Type', 'Séances', 'Minutes']);
    }
    html += '</div>';

    html += '<div class="card"><div class="card-title">Progression des charges <span class="sub">vs séance précédente</span></div>';
    var progression = exerciseProgression();
    if (progression.length === 0) {
      html += '<div class="empty-state">Ajoute des séries à tes séances pour suivre ta progression.</div>';
    } else {
      var shownProgression = progression.slice(0, 6);
      var restProgression = progression.slice(6);
      html += '<div class="progress-list">' + shownProgression.map(progressionRowHTML).join('') + '</div>';
      if (restProgression.length) {
        html += '<details class="table-toggle"><summary style="cursor:pointer;color:var(--text-muted);font-size:12px;margin-top:10px;">+' + restProgression.length + ' autre' + (restProgression.length > 1 ? 's' : '') + '</summary><div class="progress-list" style="margin-top:10px;">' + restProgression.map(progressionRowHTML).join('') + '</div></details>';
      }
    }
    html += '</div>';

    html += '<div class="card"><div class="card-title">Diète <span class="sub">kcal par jour · objectif ' + activeDietTargets().kcal + '</span></div>';
    if (!dietDays.length) {
      html += '<div class="empty-state">Pas encore de diète enregistrée sur cette période.</div>';
    } else {
      var kcalPoints = [];
      var kcalCursor = parseISO(range.start);
      while (isoFromDate(kcalCursor) <= range.end) {
        kcalPoints.push({ label: fmtShortDate(kcalCursor), v: dietTotalsForDay(dietDayFor(isoFromDate(kcalCursor))).kcal });
        kcalCursor = addDays(kcalCursor, 1);
      }
      html += '<figure class="chart-figure">' + lineChartSeries(kcalPoints, 'var(--series-3)', function (v) { return v + ' kcal'; }) + '</figure>';
      var proteinVals = dietDays.map(function (d) { return dietTotalsForDay(d).p; }).filter(function (p) { return p > 0; });
      var avgProtein = proteinVals.length ? Math.round(proteinVals.reduce(function (a, p) { return a + p; }, 0) / proteinVals.length) : 0;
      html += '<div class="card-title" style="margin-top:16px;">Protéines <span class="sub">moyenne / objectif ' + activeDietTargets().protein + ' g</span></div>';
      html += meterHTML(avgProtein, activeDietTargets().protein, 'var(--status-good)');
    }
    html += '</div>';

    html += '<div class="card"><div class="card-title">Poids <span class="sub">évolution</span></div>';
    if (weights.length >= 2) {
      var wPoints = weights.map(function (w) { return { label: fmtShortDate(parseISO(w.date)), v: w.kg }; });
      html += '<figure class="chart-figure">' + lineChartSeries(wPoints, 'var(--series-4)', function (v) { return v + ' kg'; }) + '</figure>';
    } else {
      html += '<div class="empty-state">Ajoute au moins deux pesées pour voir la courbe.</div>';
    }
    html += '<button class="btn-add-inline" data-action="open-sheet" data-sheet="weight" style="margin-top:12px;">+ Enregistrer un poids</button>';
    html += '</div>';

    document.getElementById('view').innerHTML = html;

    var s = document.getElementById('customStartInput');
    var e = document.getElementById('customEndInput');
    if (s) s.addEventListener('change', function () { ui.customStart = s.value; render(); });
    if (e) e.addEventListener('change', function () { ui.customEnd = e.value; render(); });
  }

  /* ==========================================================================
     Vue Diète
     ========================================================================== */

  function renderDiet() {
    var dateISO = ui.dietDate;
    var d = dietDayFor(dateISO);
    var totals = dietTotalsForDay(d);
    var isRestaurant = !!(d && d.dinner === 'RESTAURANT');
    var isToday = dateISO === todayISO();

    var html = '';

    html += '<div class="card"><div class="week-nav">' +
      '<button class="icon-btn" data-action="diet-day-nav" data-dir="-1" aria-label="Jour précédent"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
      '<div class="label">' + (isToday ? 'Aujourd’hui · ' : '') + esc(fmtHeaderDate(parseISO(dateISO))) + '</div>' +
      '<button class="icon-btn" data-action="diet-day-nav" data-dir="1" aria-label="Jour suivant" ' + (isToday ? 'disabled style="opacity:.35"' : '') + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg></button>' +
      '</div></div>';

    html += '<div class="stat-row">' +
      '<div class="stat-tile"><div class="value accent">' + totals.kcal + '</div><div class="label">kcal<br/>objectif ' + activeDietTargets().kcal + '</div></div>' +
      '<div class="stat-tile"><div class="value">' + totals.p + ' g</div><div class="label">protéines<br/>objectif ' + activeDietTargets().protein + 'g</div></div>' +
      '<div class="stat-tile"><div class="value good">' + (totals.kcal ? Math.round(totals.kcal / activeDietTargets().kcal * 100) + '%' : '–') + '</div><div class="label">de l’objectif<br/>kcal</div></div>' +
      '</div>';

    function optionRowHTML(field, opt, activeValue) {
      var active = activeValue === opt.id;
      return '<div class="diet-option-row' + (active ? ' active' : '') + '" data-action="pick-diet" data-field="' + field + '" data-value="' + opt.id + '">' +
        '<div class="dor-name">' + esc(opt.name) + '</div>' +
        '<div class="dor-kcal">' + opt.kcal + ' kcal</div>' +
        '</div>';
    }

    function customRowHTML(field, activeValue, label) {
      var customData = (d && d.customMeals && d.customMeals[field]) || null;
      var active = activeValue === 'CUSTOM';
      var sub = customData && customData.kcal ? (customData.kcal + ' kcal' + (customData.p ? ' · ' + customData.p + ' g prot' : '')) : '?';
      return '<div class="diet-option-row' + (active ? ' active' : '') + '" data-action="pick-diet" data-field="' + field + '" data-value="CUSTOM">' +
        '<div class="dor-name">✏️ ' + esc(label) + '</div>' +
        '<div class="dor-kcal">' + sub + '</div>' +
        '</div>';
    }

    function customInputsHTML(field) {
      var customData = (d && d.customMeals && d.customMeals[field]) || null;
      return '<div class="field" style="margin-top:14px;"><label>Nom (optionnel)</label>' +
        '<input type="text" id="customName-' + field + '" placeholder="Ex: Sandwich jambon" value="' + esc((customData && customData.name) || '') + '"/></div>' +
        '<div class="field"><label>Calories (kcal)</label>' +
        '<input type="number" id="customKcal-' + field + '" placeholder="Ex: 450" value="' + ((customData && customData.kcal) || '') + '"/></div>' +
        '<div class="field"><label>Protéines (g, optionnel)</label>' +
        '<input type="number" id="customProtein-' + field + '" placeholder="Ex: 25" value="' + ((customData && customData.p) || '') + '"/></div>';
    }

    DIET_SLOTS.forEach(function (slot) {
      if (slot.field === 'dessert' && isRestaurant) return;
      var currentValue = d ? d[slot.field] : null;
      html += '<div class="card"><div class="card-title">' + esc(slot.label) + '</div><div class="diet-option-list">';
      activeDietPlan()[slot.category].forEach(function (opt) { html += optionRowHTML(slot.field, opt, currentValue); });
      html += customRowHTML(slot.field, currentValue, 'Repas personnalisé');
      html += '</div>';
      if (currentValue === 'CUSTOM') html += customInputsHTML(slot.field);
      html += '</div>';
    });

    DIET_MEALS.forEach(function (meal) {
      var field = meal.field;
      var mealIsRestaurant = !!(meal.allowRestaurant && isRestaurant);
      html += '<div class="card"><div class="card-title">' + esc(meal.label) + '</div>';

      if (meal.allowRestaurant) {
        html += '<div class="diet-option-list"><div class="diet-option-row' + (mealIsRestaurant ? ' active' : '') + '" data-action="pick-diet" data-field="dinner" data-value="RESTAURANT">' +
          '<div class="dor-name">🍽️ Restaurant <span class="dor-note">remplace dîner + dessert</span></div>' +
          '<div class="dor-kcal">' + (mealIsRestaurant && d.restaurantKcal ? d.restaurantKcal + ' kcal' : '?') + '</div>' +
          '</div></div>';
        if (mealIsRestaurant) {
          html += '<div class="field" style="margin-top:14px;"><label>Estimation du repas restaurant (kcal)</label>' +
            '<input type="number" id="restaurantKcalInput" placeholder="Ex: 900" value="' + (d.restaurantKcal || '') + '"/></div>';
        }
      }

      if (!mealIsRestaurant) {
        var proteinField = field + '_protein', carbField = field + '_carb';
        var proteinVal = d ? d[proteinField] : null;
        var carbVal = d ? d[carbField] : null;
        var legacyOpt = (d && !proteinVal && !carbVal && d[field] && d[field] !== 'CUSTOM') ? findDietOption('mainMeal', d[field]) : null;

        if (legacyOpt) {
          html += '<div class="dor-note" style="margin:12px 2px 14px;">Ancienne sélection : ' + esc(legacyOpt.name) + ' (' + legacyOpt.kcal + ' kcal). Choisis une protéine et un féculent ci-dessous pour la remplacer.</div>';
        }

        html += '<div class="diet-subheading">Source de protéines</div><div class="diet-option-list">';
        activeDietPlan().protein.forEach(function (opt) { html += optionRowHTML(proteinField, opt, proteinVal); });
        html += customRowHTML(proteinField, proteinVal, 'Protéine personnalisée');
        html += '</div>';
        if (proteinVal === 'CUSTOM') html += customInputsHTML(proteinField);

        html += '<div class="diet-subheading">Féculent / glucides</div><div class="diet-option-list">';
        activeDietPlan().carb.forEach(function (opt) { html += optionRowHTML(carbField, opt, carbVal); });
        html += customRowHTML(carbField, carbVal, 'Féculent personnalisé');
        html += '</div>';
        if (carbVal === 'CUSTOM') html += customInputsHTML(carbField);

        html += '<div class="diet-subheading">Autre</div><div class="diet-option-list">';
        html += customRowHTML(field, (!proteinVal && !carbVal) ? d && d[field] : null, 'Repas personnalisé (plat complet)');
        html += '</div>';
        if (!proteinVal && !carbVal && d && d[field] === 'CUSTOM') html += customInputsHTML(field);
      }

      html += '</div>';
    });

    document.getElementById('view').innerHTML = html;

    var restInput = document.getElementById('restaurantKcalInput');
    if (restInput) {
      restInput.addEventListener('change', function () {
        var val = parseInt(restInput.value, 10);
        pickDietOption(ui.dietDate, 'restaurantKcal', isNaN(val) ? null : val).then(render);
      });
    }
    var customCapableFields = DIET_SLOTS.map(function (slot) { return slot.field; });
    DIET_MEALS.forEach(function (meal) {
      customCapableFields.push(meal.field, meal.field + '_protein', meal.field + '_carb');
    });
    customCapableFields.forEach(function (field) {
      var nameInput = document.getElementById('customName-' + field);
      var kcalInput = document.getElementById('customKcal-' + field);
      var proteinInput = document.getElementById('customProtein-' + field);
      if (!kcalInput) return;
      var handler = function () {
        var p = saveCustomMeal(field);
        if (p) p.then(render);
      };
      nameInput.addEventListener('change', handler);
      kcalInput.addEventListener('change', handler);
      proteinInput.addEventListener('change', handler);
    });
  }

  function renderExerciseBlock(ex) {
    var html = '<div class="exercise-block">';
    html += '<div class="exercise-head"><span class="exercise-name">' + esc(ex.name) + '</span>' +
      '<button class="btn-del-mini" data-action="remove-exercise" data-exercise-id="' + ex.id + '" aria-label="Supprimer l’exercice">✕</button></div>';
    if (ex.sets.length) {
      html += '<div class="set-list">';
      ex.sets.forEach(function (s, i) {
        html += '<div class="set-row"><span>Série ' + (i + 1) + '</span><span>' + s.weight + ' kg × ' + s.reps + '</span>' +
          '<button class="btn-del-mini" data-action="remove-set" data-exercise-id="' + ex.id + '" data-set-index="' + i + '" aria-label="Supprimer la série">✕</button></div>';
      });
      html += '</div>';
    }
    html += '<div class="set-add-row">' +
      '<input type="number" inputmode="decimal" step="0.5" min="0" placeholder="kg" id="w-' + ex.id + '"/>' +
      '<input type="number" inputmode="numeric" min="1" placeholder="reps" id="r-' + ex.id + '"/>' +
      '<button class="btn-add-set" data-action="add-set" data-exercise-id="' + ex.id + '">+ série</button>' +
      '</div>';
    html += '</div>';
    return html;
  }

  /* ==========================================================================
     Sheets (formulaires)
     ========================================================================== */

  function openSheet(name, draftOverride) {
    ui.sheet = name;
    ui.draft = draftOverride || (name === 'session' ? { date: todayISO(), typeId: 'muscu', duration: 45, intensity: 3, note: '', exercises: [] }
      : name === 'weight' ? { date: todayISO(), kg: '' }
      : name === 'settings' ? { name: state.profile.name, sex: state.profile.sex || 'h', weeklyGoal: state.profile.weeklyGoal }
      : name === 'addProfile' ? { name: '', sex: 'h', weeklyGoal: 4 }
      : {});
    renderSheet();
    document.getElementById('sheetOverlay').classList.add('open');
  }

  function duplicateSession(id) {
    var s = state.sessions.filter(function (x) { return x.id === id; })[0];
    if (!s) return;
    var clonedExercises = (s.exercises || []).map(function (ex) {
      return { id: uid(), name: ex.name, sets: ex.sets.map(function (st) { return { weight: st.weight, reps: st.reps }; }) };
    });
    openSheet('session', {
      date: todayISO(),
      typeId: s.typeId,
      duration: s.duration,
      intensity: s.intensity,
      note: s.note || '',
      exercises: clonedExercises
    });
    toast('Séance dupliquée — vérifie et enregistre 👍');
  }

  function closeSheet() {
    document.getElementById('sheetOverlay').classList.remove('open');
    ui.sheet = null;
  }

  function renderSheet() {
    var c = document.getElementById('sheetContent');
    if (ui.sheet === 'whatsnew') {
      var htmlNew = '<div class="sheet-handle"></div><h2>Quoi de neuf 🎉</h2>';
      htmlNew += '<div class="whats-new-list">';
      htmlNew += '<div class="whats-new-item"><span class="wn-icon">👥</span><div><b>Profils multiples</b><span>Un même compte peut gérer plusieurs profils (toi, ton copain...). Change de profil d’un tap en haut de l’onglet Aujourd’hui, ou dans Réglages.</span></div></div>';
      htmlNew += '<div class="whats-new-item"><span class="wn-icon">🥗</span><div><b>Plan alimentaire selon le profil</b><span>Le plan nutritionnel et l’objectif de calories s’adaptent automatiquement selon le sexe renseigné pour chaque profil (dans Réglages).</span></div></div>';
      htmlNew += '<div class="whats-new-item"><span class="wn-icon">🍗</span><div><b>Déjeuner et dîner en 2 choix</b><span>Choisis séparément ta source de protéines et ton féculent (ex: poulet + pommes de terre), au lieu d’un plat complet imposé.</span></div></div>';
      htmlNew += '<div class="whats-new-item"><span class="wn-icon">✏️</span><div><b>Repas personnalisé</b><span>Aucune option ne convient ? Ajoute un repas avec son nom et ses calories, pour n’importe quel créneau de la Diète.</span></div></div>';
      htmlNew += '</div>';
      htmlNew += '<button class="btn-primary" data-action="close-whatsnew">Compris !</button>';
      c.innerHTML = htmlNew;
    } else if (ui.sheet === 'session') {
      var d = ui.draft;
      var html = '<div class="sheet-handle"></div><h2>Ajouter une séance</h2>';
      html += '<div class="field"><label>Type de séance</label><div class="type-grid">';
      SESSION_TYPES.forEach(function (t) {
        html += '<div class="type-chip' + (d.typeId === t.id ? ' active' : '') + '" style="--type-color:' + t.color + '" data-action="draft-type" data-type="' + t.id + '"><span>' + t.icon + '</span><span>' + esc(t.label) + '</span></div>';
      });
      html += '</div></div>';
      html += '<div class="field"><label>Durée</label><div class="stepper">' +
        '<button data-action="draft-duration" data-delta="-5">−</button>' +
        '<span class="val">' + minutesToLabel(d.duration) + '</span>' +
        '<button data-action="draft-duration" data-delta="5">+</button>' +
        '</div></div>';
      html += '<div class="field"><label>Intensité ressentie</label><div class="dots-row">';
      for (var i = 1; i <= 5; i++) html += '<button class="dot-btn' + (d.intensity === i ? ' active' : '') + '" data-action="draft-intensity" data-val="' + i + '">' + i + '</button>';
      html += '</div></div>';
      html += '<div class="field"><label>Exercices (optionnel)</label>';
      html += '<div class="exercise-list">' + (d.exercises || []).map(renderExerciseBlock).join('') + '</div>';
      html += '<div class="exercise-add-row">' +
        '<input type="text" id="newExerciseName" placeholder="Nom de l’exercice (ex: Développé couché)"/>' +
        '<button class="btn-add-exercise" data-action="add-exercise" aria-label="Ajouter l’exercice">+</button>' +
        '</div></div>';
      html += '<div class="field"><label>Date</label><input type="date" id="sessionDate" value="' + d.date + '"/></div>';
      html += '<div class="field"><label>Note (optionnel)</label><textarea id="sessionNote" placeholder="Ex: leg day, 5km en 24min...">' + esc(d.note) + '</textarea></div>';
      html += '<button class="btn-primary" data-action="save-session">Enregistrer la séance</button>';
      c.innerHTML = html;
      var dateInput = document.getElementById('sessionDate');
      dateInput.addEventListener('change', function () { ui.draft.date = dateInput.value; });
      var noteInput = document.getElementById('sessionNote');
      noteInput.addEventListener('input', function () { ui.draft.note = noteInput.value; });
    } else if (ui.sheet === 'weight') {
      var d2 = ui.draft;
      var html2 = '<div class="sheet-handle"></div><h2>Enregistrer un poids</h2>';
      html2 += '<div class="field"><label>Poids (kg)</label><input type="number" step="0.1" id="weightInput" value="' + esc(d2.kg) + '" placeholder="Ex: 78.5"/></div>';
      html2 += '<div class="field"><label>Date</label><input type="date" id="weightDate" value="' + d2.date + '"/></div>';
      html2 += '<button class="btn-primary" data-action="save-weight">Enregistrer</button>';
      if (state.weights.length) {
        html2 += '<div style="margin-top:18px;">' + state.weights.slice().reverse().slice(0, 5).map(function (w) {
          return '<div class="settings-row"><div class="l">' + esc(fmtShortDate(parseISO(w.date))) + '</div><div style="display:flex;align-items:center;gap:10px;"><b>' + w.kg + ' kg</b><button class="btn-del" data-action="delete-weight" data-id="' + w.id + '" style="width:30px;height:30px;">✕</button></div></div>';
        }).join('') + '</div>';
      }
      c.innerHTML = html2;
      document.getElementById('weightInput').addEventListener('input', function (e) { ui.draft.kg = e.target.value; });
      document.getElementById('weightDate').addEventListener('change', function (e) { ui.draft.date = e.target.value; });
    } else if (ui.sheet === 'settings') {
      var d3 = ui.draft;
      var html3 = '<div class="sheet-handle"></div><h2>Réglages</h2>';
      html3 += '<div class="field"><label>Prénom</label><input type="text" id="profileName" value="' + esc(d3.name) + '" placeholder="Ex: Lucas"/></div>';
      html3 += '<div class="field"><label>Sexe <span class="dor-note" style="display:inline;">(détermine le plan alimentaire)</span></label><div class="auth-tabs">' +
        '<button type="button" class="auth-tab sex-btn' + (d3.sex === 'h' ? ' active' : '') + '" data-action="draft-sex" data-sex="h">Homme</button>' +
        '<button type="button" class="auth-tab sex-btn' + (d3.sex === 'f' ? ' active' : '') + '" data-action="draft-sex" data-sex="f">Femme</button>' +
        '</div></div>';
      html3 += '<div class="field"><label>Objectif de séances / semaine</label><div class="stepper">' +
        '<button data-action="draft-goal" data-delta="-1">−</button>' +
        '<span class="val">' + d3.weeklyGoal + '</span>' +
        '<button data-action="draft-goal" data-delta="1">+</button>' +
        '</div></div>';
      html3 += '<button class="btn-primary" data-action="save-settings">Enregistrer</button>';

      CHECKLIST_CATEGORIES.forEach(function (cat) {
        html3 += '<div class="field" style="margin-top:22px;"><label>' + cat.icon + ' ' + esc(cat.label) + '</label></div>';
        var items = checklistItemsByCategory(cat.id);
        if (items.length) {
          items.forEach(function (it) {
            html3 += '<div class="settings-row"><div class="l">' + esc(it.title) + '</div>' +
              '<button class="btn-del-mini" data-action="delete-checklist-item" data-id="' + it.id + '" aria-label="Supprimer">✕</button></div>';
          });
        } else {
          html3 += '<div class="dor-note" style="margin-bottom:8px;">Aucun ' + (cat.id === 'supplement' ? 'complément' : 'médicament') + ' pour l’instant.</div>';
        }
        html3 += '<div class="exercise-add-row" style="margin-top:8px;">' +
          '<input type="text" id="newChecklistItem-' + cat.id + '" placeholder="Ex: ' + (cat.id === 'supplement' ? 'Vitamine D' : 'Doliprane') + '"/>' +
          '<button class="btn-add-exercise" data-action="add-checklist-item" data-category="' + cat.id + '" aria-label="Ajouter">+</button>' +
          '</div>';
      });

      if (state.profiles && state.profiles.length) {
        html3 += '<div class="field" style="margin-top:22px;"><label>Profils du compte</label></div>';
        state.profiles.forEach(function (p) {
          var isActive = p.id === state.profile.id;
          html3 += '<div class="settings-row"><div class="l">' + esc(p.name || 'Sans nom') + (isActive ? ' <span class="s">profil actif</span>' : '') + '</div>' +
            (isActive ? '' : '<button class="btn-add-inline" data-action="pick-profile" data-id="' + p.id + '" style="width:auto;padding:8px 16px;">Changer</button>') +
            '</div>';
        });
        html3 += '<button class="btn-add-inline" data-action="open-add-profile" style="margin-top:10px;">+ Ajouter un profil</button>';
      }

      html3 += '<div class="settings-row" style="margin-top:14px;"><div class="l">Connecté avec<span class="s">' + esc(auth.email) + '</span></div>' +
        '<button class="btn-add-inline" data-action="logout" style="width:auto;padding:8px 16px;">Déconnexion</button></div>';
      c.innerHTML = html3;
      document.getElementById('profileName').addEventListener('input', function (e) { ui.draft.name = e.target.value; });
    } else if (ui.sheet === 'addProfile') {
      var d5 = ui.draft;
      var html5 = '<div class="sheet-handle"></div><h2>Nouveau profil</h2>';
      html5 += '<div class="field"><label>Prénom</label><input type="text" id="newProfileName" value="' + esc(d5.name) + '" placeholder="Ex: Killian"/></div>';
      html5 += '<div class="field"><label>Sexe <span class="dor-note" style="display:inline;">(détermine le plan alimentaire)</span></label><div class="auth-tabs">' +
        '<button type="button" class="auth-tab sex-btn' + (d5.sex === 'h' ? ' active' : '') + '" data-action="draft-sex" data-sex="h">Homme</button>' +
        '<button type="button" class="auth-tab sex-btn' + (d5.sex === 'f' ? ' active' : '') + '" data-action="draft-sex" data-sex="f">Femme</button>' +
        '</div></div>';
      html5 += '<div class="field"><label>Objectif de séances / semaine</label><div class="stepper">' +
        '<button data-action="draft-goal" data-delta="-1">−</button>' +
        '<span class="val">' + d5.weeklyGoal + '</span>' +
        '<button data-action="draft-goal" data-delta="1">+</button>' +
        '</div></div>';
      html5 += '<button class="btn-primary" data-action="save-new-profile">Créer le profil</button>';
      c.innerHTML = html5;
      document.getElementById('newProfileName').addEventListener('input', function (e) { ui.draft.name = e.target.value; });
    } else {
      var html4 = '<div class="sheet-handle"></div><h2>Ajouter</h2>';
      html4 += '<div class="quick-action" data-action="open-sheet" data-sheet="session"><div class="qi">🏋️</div><div><div class="qt">Séance de sport</div><div class="qs">Type, durée, intensité</div></div></div>';
      html4 += '<div class="quick-action" data-action="open-sheet" data-sheet="weight"><div class="qi">⚖️</div><div><div class="qt">Peser</div><div class="qs">Suivre l’évolution du poids</div></div></div>';
      c.innerHTML = html4;
    }
  }

  /* ==========================================================================
     Toast
     ========================================================================== */

  var toastTimer = null;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  /* ==========================================================================
     Authentification
     ========================================================================== */

  function showAuthScreen() {
    document.getElementById('authScreen').hidden = false;
    document.getElementById('profileScreen').hidden = true;
    document.getElementById('appShell').hidden = true;
    renderAuthForm();
  }

  function showProfileScreen() {
    document.getElementById('authScreen').hidden = true;
    document.getElementById('profileScreen').hidden = false;
    document.getElementById('appShell').hidden = true;
    renderProfileScreen();
  }

  function showApp() {
    document.getElementById('authScreen').hidden = true;
    document.getElementById('profileScreen').hidden = true;
    document.getElementById('appShell').hidden = false;
  }

  function renderAuthForm() {
    var isRegister = ui.authTab === 'register';
    document.querySelectorAll('.auth-tab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-auth-tab') === ui.authTab);
    });
    document.getElementById('authNameField').hidden = !isRegister;
    document.getElementById('authSexField').hidden = !isRegister;
    document.querySelectorAll('#authSexField .sex-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-sex') === ui.authSex);
    });
    document.getElementById('authPassword').setAttribute('autocomplete', isRegister ? 'new-password' : 'current-password');
    document.getElementById('authSubmit').textContent = isRegister ? 'Créer mon compte' : 'Se connecter';
    document.getElementById('authError').hidden = true;
  }

  function setAuthError(msg) {
    var el = document.getElementById('authError');
    el.textContent = msg;
    el.hidden = false;
  }

  function renderProfileScreen() {
    var list = document.getElementById('profileList');
    var html = state.profiles.map(function (p) {
      var initial = (p.name || '?').trim().charAt(0).toUpperCase() || '?';
      return '<button type="button" class="profile-item" data-action="pick-profile" data-id="' + p.id + '">' +
        '<span class="profile-avatar">' + esc(initial) + '</span>' +
        '<span class="profile-item-name">' + esc(p.name || 'Sans nom') + '</span>' +
        '</button>';
    }).join('');
    list.innerHTML = html;
  }

  function selectProfile(pid) {
    closeSheet();
    ui.activeProfileId = pid;
    try { localStorage.setItem(ACTIVE_PROFILE_KEY, pid); } catch (e) {}
    return apiFetch('/api/state?profileId=' + encodeURIComponent(pid)).then(function (data) {
      state = data;
      cacheStateLocally();
      ui.tab = 'jour';
      showApp();
      render();
      maybeShowWhatsNew();
    }).catch(function (err) { toast(err.message || 'Impossible de charger ce profil.'); });
  }

  function bootAfterAuth() {
    var cached = loadCachedState();
    if (cached) state = cached;
    var storedProfileId = null;
    try { storedProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY); } catch (e) {}
    ui.activeProfileId = storedProfileId;

    if (cached && storedProfileId) { showApp(); render(); }

    var qs = storedProfileId ? ('?profileId=' + encodeURIComponent(storedProfileId)) : '';
    apiFetch('/api/state' + qs).then(function (data) {
      state = data;
      cacheStateLocally();
      ui.activeProfileId = data.profile.id;
      try { localStorage.setItem(ACTIVE_PROFILE_KEY, data.profile.id); } catch (e) {}
      if (!storedProfileId && data.profiles.length > 1) {
        showProfileScreen();
      } else {
        showApp();
        render();
        maybeShowWhatsNew();
      }
    }).catch(function (err) {
      if (err.status === 401) { logout(); toast('Session expirée, reconnecte-toi — tes données sont toujours là.'); return; }
      if (cached && storedProfileId) { toast('Hors-ligne — dernières données enregistrées'); }
      else toast('Impossible de charger tes données (hors-ligne ?)');
    });
  }

  var NOTICE_VERSION = 'profils-2026-10';
  var NOTICE_KEY = 'jsc.notice.seen';

  function maybeShowWhatsNew() {
    var seen = null;
    try { seen = localStorage.getItem(NOTICE_KEY); } catch (e) {}
    if (seen === NOTICE_VERSION) return;
    openSheet('whatsnew');
  }

  function dismissWhatsNew() {
    try { localStorage.setItem(NOTICE_KEY, NOTICE_VERSION); } catch (e) {}
    closeSheet();
  }

  function logout() {
    closeSheet();
    auth.token = null;
    auth.email = '';
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) {}
    try { localStorage.removeItem(EMAIL_KEY); } catch (e) {}
    try { localStorage.removeItem(CACHE_KEY); } catch (e) {}
    try { localStorage.removeItem(ACTIVE_PROFILE_KEY); } catch (e) {}
    state = defaultState();
    ui.activeProfileId = null;
    showAuthScreen();
  }

  function boot() {
    var token = null, email = '';
    try { token = localStorage.getItem(TOKEN_KEY); email = localStorage.getItem(EMAIL_KEY) || ''; } catch (e) {}
    if (!token) { showAuthScreen(); return; }
    auth.token = token;
    auth.email = email;
    bootAfterAuth();
  }

  document.getElementById('authForm').addEventListener('submit', function (e) {
    e.preventDefault();
    if (ui.authBusy) return;
    var isRegister = ui.authTab === 'register';
    var email = document.getElementById('authEmail').value.trim();
    var password = document.getElementById('authPassword').value;
    var name = document.getElementById('authName').value.trim();
    var path = isRegister ? '/api/auth/register' : '/api/auth/login';
    var body = isRegister ? { email: email, password: password, name: name, sex: ui.authSex } : { email: email, password: password };

    ui.authBusy = true;
    var btn = document.getElementById('authSubmit');
    btn.disabled = true;
    apiFetch(path, { method: 'POST', body: JSON.stringify(body) }).then(function (data) {
      auth.token = data.token;
      auth.email = data.user.email;
      try { localStorage.setItem(TOKEN_KEY, data.token); localStorage.setItem(EMAIL_KEY, data.user.email); } catch (err) {}
      if (data.profileId) {
        try { localStorage.setItem(ACTIVE_PROFILE_KEY, data.profileId); } catch (err) {}
      }
      bootAfterAuth();
    }).catch(function (err) {
      setAuthError(err.message || 'Une erreur est survenue.');
    }).then(function () {
      ui.authBusy = false;
      btn.disabled = false;
    });
  });

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action="auth-tab"]');
    if (el) { ui.authTab = el.getAttribute('data-auth-tab'); renderAuthForm(); }
    var sexEl = e.target.closest('[data-action="auth-sex"]');
    if (sexEl) { ui.authSex = sexEl.getAttribute('data-sex'); renderAuthForm(); }
  });

  /* ==========================================================================
     Rendu principal + routage
     ========================================================================== */

  function render() {
    renderHeader();
    if (ui.tab === 'jour') renderDay();
    else if (ui.tab === 'semaine') renderWeek();
    else if (ui.tab === 'historique') renderHistorique();
    else if (ui.tab === 'diete') renderDiet();
    else renderEvolution();
  }

  /* ==========================================================================
     Événements
     ========================================================================== */

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]');
    if (!el) {
      if (e.target.id === 'sheetOverlay') closeSheet();
      return;
    }
    var action = el.getAttribute('data-action');

    if (action === 'switch-tab' || el.classList.contains('tab-btn')) {
      var tabName = el.getAttribute('data-tab');
      if (tabName) { ui.tab = tabName; render(); }
      return;
    }
    if (action === 'toggle-session') {
      toggleSessionDone(el.getAttribute('data-id')).then(render).catch(function (err) { toast(err.message); });
      return;
    }
    if (action === 'delete-session') {
      deleteSession(el.getAttribute('data-id')).then(render).catch(function (err) { toast(err.message); });
      return;
    }
    if (action === 'duplicate-session') { duplicateSession(el.getAttribute('data-id')); return; }
    if (action === 'logout') { logout(); return; }
    if (action === 'toggle-checklist') {
      toggleChecklistItem(el.getAttribute('data-id'), todayISO()).then(render).catch(function (err) { toast(err.message); });
      return;
    }
    if (action === 'delete-checklist-item') {
      deleteChecklistItem(el.getAttribute('data-id')).then(function () { renderSheet(); render(); }).catch(function (err) { toast(err.message); });
      return;
    }
    if (action === 'add-checklist-item') {
      var clCategory = el.getAttribute('data-category');
      var clInput = document.getElementById('newChecklistItem-' + clCategory);
      var clTitle = (clInput.value || '').trim();
      if (!clTitle) { toast('Indique un titre'); return; }
      addChecklistItem(clCategory, clTitle).then(function () {
        clInput.value = '';
        renderSheet();
        render();
      }).catch(function (err) { toast(err.message); });
      return;
    }
    if (action === 'diet-day-nav') {
      var dietDir = parseInt(el.getAttribute('data-dir'), 10);
      ui.dietDate = isoFromDate(addDays(parseISO(ui.dietDate), dietDir));
      render();
      return;
    }
    if (action === 'pick-diet') {
      var dField = el.getAttribute('data-field');
      var dValue = el.getAttribute('data-value');
      pickDietOption(ui.dietDate, dField, dValue).then(render).catch(function (err) { toast(err.message); });
      return;
    }
    if (action === 'week-nav') {
      var dir = parseInt(el.getAttribute('data-dir'), 10);
      ui.weekOffset = Math.min(0, ui.weekOffset + dir);
      render();
      return;
    }
    if (action === 'period-chip') { ui.period = el.getAttribute('data-period'); render(); return; }
    if (action === 'open-sheet') { openSheet(el.getAttribute('data-sheet')); return; }
    if (action === 'close-sheet') { closeSheet(); return; }
    if (action === 'close-whatsnew') { dismissWhatsNew(); return; }
    if (action === 'draft-type') { ui.draft.typeId = el.getAttribute('data-type'); renderSheet(); return; }
    if (action === 'draft-duration') {
      var delta = parseInt(el.getAttribute('data-delta'), 10);
      ui.draft.duration = Math.max(5, (ui.draft.duration || 0) + delta);
      renderSheet();
      return;
    }
    if (action === 'draft-intensity') { ui.draft.intensity = parseInt(el.getAttribute('data-val'), 10); renderSheet(); return; }
    if (action === 'draft-goal') {
      var gd = parseInt(el.getAttribute('data-delta'), 10);
      ui.draft.weeklyGoal = Math.max(1, (ui.draft.weeklyGoal || 1) + gd);
      renderSheet();
      return;
    }
    if (action === 'draft-sex') { ui.draft.sex = el.getAttribute('data-sex'); renderSheet(); return; }
    if (action === 'open-add-profile') { openSheet('addProfile'); return; }
    if (action === 'pick-profile') { selectProfile(el.getAttribute('data-id')); return; }
    if (action === 'save-new-profile') {
      var pname = (ui.draft.name || '').trim();
      if (!pname) { toast('Indique un prénom'); return; }
      apiFetch('/api/profiles', { method: 'POST', body: JSON.stringify({ name: pname, sex: ui.draft.sex, weeklyGoal: ui.draft.weeklyGoal }) }).then(function (profile) {
        toast('Profil créé 👋');
        return selectProfile(profile.id);
      }).catch(function (err) { toast(err.message); });
      return;
    }
    if (action === 'add-exercise') {
      var nameInput = document.getElementById('newExerciseName');
      var name = (nameInput.value || '').trim();
      if (!name) { toast('Indique un nom d’exercice'); return; }
      if (!ui.draft.exercises) ui.draft.exercises = [];
      ui.draft.exercises.push({ id: uid(), name: name, sets: [] });
      renderSheet();
      return;
    }
    if (action === 'remove-exercise') {
      var exId = el.getAttribute('data-exercise-id');
      ui.draft.exercises = (ui.draft.exercises || []).filter(function (ex) { return ex.id !== exId; });
      renderSheet();
      return;
    }
    if (action === 'add-set') {
      var targetId = el.getAttribute('data-exercise-id');
      var wInput = document.getElementById('w-' + targetId);
      var rInput = document.getElementById('r-' + targetId);
      var weight = wInput.value === '' ? 0 : parseFloat(wInput.value);
      var reps = parseInt(rInput.value, 10);
      if (!reps || reps <= 0) { toast('Indique le nombre de répétitions'); return; }
      var ex = (ui.draft.exercises || []).filter(function (x) { return x.id === targetId; })[0];
      if (ex) ex.sets.push({ weight: weight, reps: reps });
      renderSheet();
      return;
    }
    if (action === 'remove-set') {
      var exId2 = el.getAttribute('data-exercise-id');
      var setIdx = parseInt(el.getAttribute('data-set-index'), 10);
      var ex2 = (ui.draft.exercises || []).filter(function (x) { return x.id === exId2; })[0];
      if (ex2) ex2.sets.splice(setIdx, 1);
      renderSheet();
      return;
    }
    if (action === 'save-session') {
      if (!ui.draft.date) ui.draft.date = todayISO();
      addSession(ui.draft).then(function () {
        closeSheet();
        render();
        toast('Séance enregistrée 💪');
      }).catch(function (err) { toast(err.message); });
      return;
    }
    if (action === 'save-weight') {
      var kg = parseFloat(ui.draft.kg);
      if (!kg || kg <= 0) { toast('Indique un poids valide'); return; }
      addWeight(ui.draft.date || todayISO(), kg).then(function () {
        closeSheet();
        render();
        toast('Poids enregistré');
      }).catch(function (err) { toast(err.message); });
      return;
    }
    if (action === 'delete-weight') {
      deleteWeight(el.getAttribute('data-id')).then(function () { renderSheet(); render(); }).catch(function (err) { toast(err.message); });
      return;
    }
    if (action === 'save-settings') {
      var newName = (ui.draft.name || '').trim();
      var newGoal = ui.draft.weeklyGoal || 4;
      var newSex = ui.draft.sex || 'h';
      apiFetch('/api/profiles/' + state.profile.id, { method: 'PUT', body: JSON.stringify({ name: newName, sex: newSex, weeklyGoal: newGoal }) }).then(function (profile) {
        state.profile = profile;
        var idx = -1;
        state.profiles.forEach(function (p, i) { if (p.id === profile.id) idx = i; });
        if (idx !== -1) state.profiles[idx] = profile; else state.profiles.push(profile);
        cacheStateLocally();
        closeSheet();
        render();
        toast('Préférences enregistrées');
      }).catch(function (err) { toast(err.message); });
      return;
    }
  });

  document.getElementById('fabAdd').addEventListener('click', function () { openSheet(null); });
  document.getElementById('settingsBtn').addEventListener('click', function () { openSheet('settings'); });
  document.getElementById('sheetOverlay').addEventListener('click', function (e) {
    if (e.target.id === 'sheetOverlay') closeSheet();
  });

  /* ==========================================================================
     Init
     ========================================================================== */

  boot();
})();
