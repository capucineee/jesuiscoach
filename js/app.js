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

  var MEAL_SLOTS = [
    { id: 'petit-dej', label: 'Petit-déjeuner' },
    { id: 'dejeuner',  label: 'Déjeuner' },
    { id: 'diner',     label: 'Dîner' },
    { id: 'collation', label: 'Collations' }
  ];

  var MEAL_STATUS_META = {
    ok:    { icon: '✓', label: 'Respecté' },
    ecart: { icon: '~',      label: 'Petit écart' },
    'raté': { icon: '✕', label: 'Pas respecté' }
  };
  var MEAL_STATUS_ORDER = ['ok', 'ecart', 'raté'];

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
      profile: { name: '', weeklyGoal: 4 },
      sessions: [],
      meals: [],
      weights: []
    };
  }

  var TOKEN_KEY = 'jsc.token';
  var EMAIL_KEY = 'jsc.email';
  var CACHE_KEY = 'jsc.cache';

  var state = defaultState();
  var auth = { token: null, email: '' };
  var ui = { tab: 'jour', weekOffset: 0, period: '7', customStart: '', customEnd: '', sheet: null, draft: {}, authTab: 'login', authBusy: false };

  function loadCachedState() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      var d = defaultState();
      return {
        profile: Object.assign({}, d.profile, parsed.profile || {}),
        sessions: parsed.sessions || [],
        meals: parsed.meals || [],
        weights: parsed.weights || []
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

  function mealsInRange(startISO, endISO) {
    return state.meals.filter(function (m) { return m.date >= startISO && m.date <= endISO; });
  }

  function mealStatus(dateISO, slotId) {
    for (var i = 0; i < state.meals.length; i++) {
      var m = state.meals[i];
      if (m.date === dateISO && m.slot === slotId) return m;
    }
    return null;
  }

  function setMealStatus(dateISO, slotId, status) {
    var existing = mealStatus(dateISO, slotId);
    if (existing && existing.status === status) {
      return apiFetch('/api/meals/' + existing.id, { method: 'DELETE' }).then(function () {
        state.meals = state.meals.filter(function (m) { return m.id !== existing.id; });
        cacheStateLocally();
      });
    }
    return apiFetch('/api/meals', { method: 'PUT', body: JSON.stringify({ date: dateISO, slot: slotId, status: status }) }).then(function (row) {
      if (existing) existing.status = row.status;
      else state.meals.push(row);
      cacheStateLocally();
    });
  }

  function addSession(obj) {
    return apiFetch('/api/sessions', { method: 'POST', body: JSON.stringify({
      date: obj.date, typeId: obj.typeId, duration: obj.duration, intensity: obj.intensity,
      note: obj.note || '', exercises: obj.exercises || []
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
    return apiFetch('/api/weights', { method: 'PUT', body: JSON.stringify({ date: dateISO, kg: kg }) }).then(function (row) {
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

  function adherenceRate(meals) {
    if (!meals.length) return null;
    var ok = meals.filter(function (m) { return m.status === 'ok'; }).length;
    return Math.round((ok / meals.length) * 100);
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
    var titles = { jour: "Aujourd'hui", semaine: 'Semaine', evolution: 'Évolution', historique: 'Historique' };
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
      '<button class="btn-check' + (s.done ? ' done' : '') + '" data-action="toggle-session" data-id="' + s.id + '" aria-label="Marquer fait">✓</button>' +
      '<button class="btn-del" data-action="delete-session" data-id="' + s.id + '" aria-label="Supprimer">✕</button>' +
      '</div></div>' +
      (exercises.length ? renderExerciseSummary(exercises) : '') +
      '</div>';
  }

  /* ==========================================================================
     Vue Jour
     ========================================================================== */

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

    html += '<div class="motivation-card">' +
      '<div class="quote-mark">“</div>' +
      '<p>' + esc(quote) + '</p>' +
      '<div class="signature">Message du jour</div>' +
      '</div>';

    html += '<div class="stat-row">' +
      '<div class="stat-tile"><div class="value accent">' + doneThisWeek + '/' + state.profile.weeklyGoal + '</div><div class="label">séances<br/>objectif semaine</div></div>' +
      '<div class="stat-tile"><div class="value">' + streak + ' 🔥</div><div class="label">jours de suite</div></div>' +
      '<div class="stat-tile"><div class="value good">' + (adherenceRate(mealsInRange(iso, iso)) === null ? '–' : adherenceRate(mealsInRange(iso, iso)) + '%') + '</div><div class="label">diète du jour</div></div>' +
      '</div>';

    html += '<div class="card">';
    html += '<div class="card-title">Séance du jour</div>';
    if (todays.length === 0) {
      html += '<div class="empty-state">Aucune séance enregistrée aujourd’hui.</div>';
    } else {
      todays.forEach(function (s) { html += sessionCardHTML(s); });
    }
    html += '<button class="btn-add-inline" data-action="open-sheet" data-sheet="session" style="margin-top:4px;">+ Ajouter une séance</button>';
    html += '</div>';

    html += '<div class="card">';
    html += '<div class="card-title">Diète du jour <span class="sub">tape pour valider chaque repas</span></div>';
    MEAL_SLOTS.forEach(function (slot) {
      var m = mealStatus(iso, slot.id);
      html += '<div class="meal-row"><div class="m-name">' + esc(slot.label) + '</div><div class="meal-status-group">';
      MEAL_STATUS_ORDER.forEach(function (st) {
        html += '<button class="meal-status-btn" data-action="meal-status" data-date="' + iso + '" data-slot="' + slot.id + '" data-status="' + st + '" aria-label="' + esc(MEAL_STATUS_META[st].label) + '">' + MEAL_STATUS_META[st].icon + '</button>';
      });
      html += '</div></div>';
    });
    html += '</div>';

    var view = document.getElementById('view');
    view.innerHTML = html;

    // fix active class on meal buttons (attribute duplication workaround above)
    MEAL_SLOTS.forEach(function (slot) {
      var m = mealStatus(iso, slot.id);
      if (!m) return;
      var btn = view.querySelector('.meal-status-btn[data-slot="' + slot.id + '"][data-status="' + m.status + '"]');
      if (btn) btn.classList.add('active');
    });
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
    var weekMeals = mealsInRange(startISO, endISO);

    var dayLabels = days.map(function (d) {
      return { label: fmtShortWeekday(d), isToday: isSameDate(d, new Date()) };
    });
    var dayValues = days.map(function (d) {
      var iso = isoFromDate(d);
      return weekSessions.filter(function (s) { return s.date === iso; }).reduce(function (a, s) { return a + (s.duration || 0); }, 0);
    });

    var totalMinutes = weekSessions.reduce(function (a, s) { return a + (s.duration || 0); }, 0);
    var doneCount = weekSessions.filter(function (s) { return s.done; }).length;
    var adherence = adherenceRate(weekMeals);
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
      '<div class="stat-tile"><div class="value good">' + (adherence === null ? '–' : adherence + '%') + '</div><div class="label">diète<br/>respectée</div></div>' +
      '</div>';

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
    var meals = mealsInRange(range.start, range.end);
    var weights = state.weights.filter(function (w) { return w.date >= range.start && w.date <= range.end; });
    var dist = typeDistribution(sessions);
    var totalMinutes = sessions.reduce(function (a, s) { return a + (s.duration || 0); }, 0);
    var days = Math.max(1, Math.round((parseISO(range.end) - parseISO(range.start)) / 86400000) + 1);
    var avgPerWeek = (sessions.length / (days / 7)).toFixed(1);
    var adherence = adherenceRate(meals);

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

    html += '<div class="card"><div class="card-title">Diète <span class="sub">taux de repas respectés</span></div>';
    html += meterHTML(meals.filter(function (m) { return m.status === 'ok'; }).length, meals.length || 1, 'var(--status-good)');
    if (!meals.length) html += '<div class="empty-state">Pas encore de repas enregistrés.</div>';
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

  function openSheet(name) {
    ui.sheet = name;
    ui.draft = name === 'session' ? { date: todayISO(), typeId: 'muscu', duration: 45, intensity: 3, note: '', exercises: [] }
      : name === 'weight' ? { date: todayISO(), kg: '' }
      : name === 'settings' ? { name: state.profile.name, weeklyGoal: state.profile.weeklyGoal }
      : {};
    renderSheet();
    document.getElementById('sheetOverlay').classList.add('open');
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
      htmlNew += '<div class="whats-new-item"><span class="wn-icon">🕰️</span><div><b>Onglet Historique</b><span>Retrouve toutes tes séances passées, groupées par date, en bas de l’app.</span></div></div>';
      htmlNew += '<div class="whats-new-item"><span class="wn-icon">📅</span><div><b>Séance oubliée ?</b><span>Dans « + Ajouter une séance », change simplement le champ <b>Date</b> pour le jour passé — elle apparaîtra dans Historique.</span></div></div>';
      htmlNew += '<div class="whats-new-item"><span class="wn-icon">🏋️</span><div><b>Exercices détaillés</b><span>Ajoute tes exercices avec séries, répétitions et charges (kg) à chaque séance.</span></div></div>';
      htmlNew += '<div class="whats-new-item"><span class="wn-icon">📈</span><div><b>Progression des charges</b><span>Dans l’onglet Évolution, vois en un coup d’œil si tu augmentes tes charges, exercice par exercice.</span></div></div>';
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
      html3 += '<div class="field"><label>Objectif de séances / semaine</label><div class="stepper">' +
        '<button data-action="draft-goal" data-delta="-1">−</button>' +
        '<span class="val">' + d3.weeklyGoal + '</span>' +
        '<button data-action="draft-goal" data-delta="1">+</button>' +
        '</div></div>';
      html3 += '<button class="btn-primary" data-action="save-settings">Enregistrer</button>';
      html3 += '<div class="settings-row" style="margin-top:14px;"><div class="l">Connecté avec<span class="s">' + esc(auth.email) + '</span></div>' +
        '<button class="btn-add-inline" data-action="logout" style="width:auto;padding:8px 16px;">Déconnexion</button></div>';
      c.innerHTML = html3;
      document.getElementById('profileName').addEventListener('input', function (e) { ui.draft.name = e.target.value; });
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
    document.getElementById('appShell').hidden = true;
    renderAuthForm();
  }

  function showApp() {
    document.getElementById('authScreen').hidden = true;
    document.getElementById('appShell').hidden = false;
  }

  function renderAuthForm() {
    var isRegister = ui.authTab === 'register';
    document.querySelectorAll('.auth-tab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-auth-tab') === ui.authTab);
    });
    document.getElementById('authNameField').hidden = !isRegister;
    document.getElementById('authPassword').setAttribute('autocomplete', isRegister ? 'new-password' : 'current-password');
    document.getElementById('authSubmit').textContent = isRegister ? 'Créer mon compte' : 'Se connecter';
    document.getElementById('authError').hidden = true;
  }

  function setAuthError(msg) {
    var el = document.getElementById('authError');
    el.textContent = msg;
    el.hidden = false;
  }

  function bootAfterAuth() {
    var cached = loadCachedState();
    if (cached) state = cached;
    showApp();
    render();
    apiFetch('/api/state').then(function (data) {
      state = data;
      cacheStateLocally();
      render();
    }).catch(function (err) {
      if (err.status === 401) { logout(); toast('Session expirée, reconnecte-toi — tes données sont toujours là.'); return; }
      if (!cached) toast('Impossible de charger tes données (hors-ligne ?)');
      else toast('Hors-ligne — dernières données enregistrées');
    });
    maybeShowWhatsNew();
  }

  var NOTICE_VERSION = 'historique-2026-09';
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
    state = defaultState();
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
    var body = isRegister ? { email: email, password: password, name: name } : { email: email, password: password };

    ui.authBusy = true;
    var btn = document.getElementById('authSubmit');
    btn.disabled = true;
    apiFetch(path, { method: 'POST', body: JSON.stringify(body) }).then(function (data) {
      auth.token = data.token;
      auth.email = data.user.email;
      try { localStorage.setItem(TOKEN_KEY, data.token); localStorage.setItem(EMAIL_KEY, data.user.email); } catch (err) {}
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
  });

  /* ==========================================================================
     Rendu principal + routage
     ========================================================================== */

  function render() {
    renderHeader();
    if (ui.tab === 'jour') renderDay();
    else if (ui.tab === 'semaine') renderWeek();
    else if (ui.tab === 'historique') renderHistorique();
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
    if (action === 'meal-status') {
      setMealStatus(el.getAttribute('data-date'), el.getAttribute('data-slot'), el.getAttribute('data-status'))
        .then(render).catch(function (err) { toast(err.message); });
      return;
    }
    if (action === 'logout') { logout(); return; }
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
      apiFetch('/api/me', { method: 'PUT', body: JSON.stringify({ name: newName, weeklyGoal: newGoal }) }).then(function (profile) {
        state.profile = profile;
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
