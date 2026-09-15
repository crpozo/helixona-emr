/* THE STAFF MODULE IS THE CLINIC'S SHEET (Cassandra, 2026-09-14), on the platform's real day.
   Three blocks, in the sheet's own words:

     CERTIFIED YES/NO          Resource (Human) × modality
     DYNAMIC SCHEDULING        "N techs certified and working today" → a 15-minute board
     SET UP PAGE BY MODALITY   Active Time Beginning · Dormant Time · Active Time End

   The appointments are NOT invented here: assets/staff-data.js is generated from
   schedule.html, so the board shows the same Tuesday, July 21 the schedule shows, and
   the techs are the nurses / medic / MA the platform already has (Nick = Nurse IV 1,
   Juan = Nurse IV 2, Bea = Medic IV, Wes = Lab). Their own IV and lab work occupies
   their hands too. New booking calls STAFF.forCol() and refuses a start nobody
   certified, working and free can open and close. */
(function () {
  'use strict';
  var D = window.STAFF_DATA || { cols: {}, names: {}, appts: [], work: {}, techCol: {} };

  /* Certified Yes/No — exactly the sheet */
  var SHEET = ['RedLight', 'Erchonia Laser', 'Nano Bath 1', 'Nano Bath 2', 'Halo Therapy',
               'Bio Charger', 'Bemer', 'Hydrogen Inhalation', 'Nano Vie', 'RIFE'];
  var PEOPLE = [
    { n: 'Nick', role: 'Nurse · IV 1', cert: { 'RedLight': 1, 'Erchonia Laser': 1, 'Nano Bath 1': 1, 'Nano Bath 2': 1, 'Halo Therapy': 1, 'Bio Charger': 1, 'Bemer': 1, 'Hydrogen Inhalation': 0, 'Nano Vie': 0, 'RIFE': 1 } },
    { n: 'Juan', role: 'Nurse · IV 2', cert: { 'RedLight': 1, 'Erchonia Laser': 1, 'Nano Bath 1': 1, 'Nano Bath 2': 1, 'Halo Therapy': 1, 'Bio Charger': 1, 'Bemer': 1, 'Hydrogen Inhalation': 0, 'Nano Vie': 0, 'RIFE': 1 } },
    { n: 'Bea',  role: 'Medic · IV',   cert: { 'RedLight': 1, 'Erchonia Laser': 1, 'Nano Bath 1': 0, 'Nano Bath 2': 0, 'Halo Therapy': 1, 'Bio Charger': 1, 'Bemer': 1, 'Hydrogen Inhalation': 1, 'Nano Vie': 1, 'RIFE': 1 } },
    { n: 'Wes',  role: 'MA · Lab',     cert: { 'RedLight': 1, 'Erchonia Laser': 1, 'Nano Bath 1': 0, 'Nano Bath 2': 0, 'Halo Therapy': 1, 'Bio Charger': 1, 'Bemer': 1, 'Hydrogen Inhalation': 1, 'Nano Vie': 1, 'RIFE': 1 } }
  ];

  /* Set Up Page by Modality — [Active Time Beginning, Dormant Time, Active Time End].
     RedLight and Erchonia are the sheet's; the rest are blank there → placeholders
     "to confirm". On a real booking the dormant time is whatever the booking lasts
     minus the two active ends, so a 45-minute Hydrogen is 5 + 35 + 5. */
  var SETUP = {
    'RedLight': [5, 50, 5], 'Erchonia Laser': [10, 15, 5],
    'Nano Bath 1': [10, 40, 10], 'Nano Bath 2': [10, 40, 10], 'Halo Therapy': [5, 50, 5],
    'Bio Charger': [5, 20, 5], 'Bemer': [5, 20, 5], 'Hydrogen Inhalation': [5, 20, 5],
    'Nano Vie': [5, 20, 5], 'RIFE': [5, 20, 5]
  };
  var ON_SHEET = { 'RedLight': true, 'Erchonia Laser': true };
  var IV_SETUP = [10, 5];   // a nurse's own infusion: hook-up, the drip runs, take-down

  /* board columns = the platform's machines, labelled with the sheet's names */
  var COLS = Object.keys(D.cols).map(function (id) { return { id: id, mod: D.cols[id], name: D.names[id] || id }; });
  var DAY0 = 360, DAY1 = 1140, STEP = 15;
  if (D.appts.length) {
    var lo = Math.min.apply(null, D.appts.map(function (a) { return a.at; }));
    var hi = Math.max.apply(null, D.appts.map(function (a) { return a.at + a.mins; }));
    DAY0 = Math.floor(lo / 60) * 60; DAY1 = Math.ceil(hi / 60) * 60;
  }
  /* working today = has something on today's schedule; the toggles can change it */
  var working = {};
  PEOPLE.forEach(function (p) { working[p.n] = !!(D.work[p.n] && D.work[p.n].length); });

  function clock(m) { var h = Math.floor(m / 60), mm = m % 60, ap = h < 12 ? 'AM' : 'PM'; h = h % 12 || 12; return h + ':' + (mm < 10 ? '0' : '') + mm + ' ' + ap; }
  function short(m) { var h = Math.floor(m / 60), mm = m % 60; return (h % 12 || 12) + ':' + (mm < 10 ? '0' : '') + mm; }
  function phasesOf(at, mins, b, e) {
    var d = Math.max(0, mins - b - e);
    if (mins <= b + e) { b = Math.min(b, mins); e = mins - b; }
    return [{ k: 'red', s: at, e: at + b }, { k: 'blue', s: at + b, e: at + b + d }, { k: 'red', s: at + b + d, e: at + mins }];
  }
  function phases(a) { var s = SETUP[a.mod]; return phasesOf(a.at, a.mins, s[0], s[2]); }

  /* Who has hands on what, per 15-minute cell — the sheet's grid. A tech has 15
     minutes of hands in every cell; each active phase spends its minutes in the
     cell(s) it falls in. So a 5-minute Red Light set-up and a 10-minute IV hook-up
     both at 10:00 fit in the same cell for the same person; a third would not.
     Pooled and greedy: the first certified tech with room in every cell of a
     treatment's two active phases gets it, and the same person opens and closes.
     The tech's own IV / lab column is spent first — it is already on the schedule. */
  function cell(t) { return Math.floor(t / STEP); }
  function spend(bag, p, s, e, item) {
    for (var t = s; t < e; t++) {
      var c = cell(t), u = bag[p][c] || (bag[p][c] = { used: 0, items: [], watch: [] });
      u.used++; if (u.items.indexOf(item) < 0) u.items.push(item);
    }
  }
  function watch(bag, p, s, e, item) {
    for (var t = s; t < e; t++) {
      var c = cell(t), u = bag[p][c] || (bag[p][c] = { used: 0, items: [], watch: [] });
      if (u.watch.indexOf(item) < 0) u.watch.push(item);
    }
  }
  function fits(bag, p, phs) {
    var need = {};
    phs.forEach(function (f) { if (f.k === 'red') for (var t = f.s; t < f.e; t++) need[cell(t)] = (need[cell(t)] || 0) + 1; });
    return Object.keys(need).every(function (c) { var u = bag[p][c]; return (u ? u.used : 0) + need[c] <= STEP; });
  }
  function build(extra) {
    var techs = PEOPLE.filter(function (p) { return working[p.n]; });
    var bag = {}; techs.forEach(function (p) { bag[p.n] = {}; });
    techs.forEach(function (p) {
      (D.work[p.n] || []).forEach(function (w) {
        phasesOf(w.at, w.mins, IV_SETUP[0], IV_SETUP[1]).forEach(function (f) {
          if (f.k === 'red') spend(bag, p.n, f.s, f.e, { own: w }); else watch(bag, p.n, f.s, f.e, w);
        });
      });
    });
    var owner = {}, unstaffed = [];
    var list = extra ? D.appts.concat([extra]) : D.appts;
    list.forEach(function (a, i) {
      var phs = phases(a);
      var who = techs.filter(function (p) { return p.cert[a.mod] && fits(bag, p.n, phs); })[0];
      if (!who) { unstaffed.push(a); return; }
      owner[i] = who.n;
      phs.forEach(function (f) { if (f.k === 'red') spend(bag, who.n, f.s, f.e, a); else watch(bag, who.n, f.s, f.e, a); });
    });
    return { techs: techs, bag: bag, owner: owner, unstaffed: unstaffed };
  }
  function used(model, p, t) { var u = model.bag[p.n][cell(t)]; return u ? u.used : 0; }
  function canStart(model, t0, mod) {
    var s = SETUP[mod];
    return model.techs.some(function (p) { return p.cert[mod] && used(model, p, t0) + s[0] <= STEP; });
  }
  function apptAt(col, t) {
    return D.appts.filter(function (x) { return x.col === col && x.at <= t && t < x.at + x.mins; })[0] || null;
  }

  /* ---------- Dynamic Scheduling ---------- */
  function renderBoard(model) {
    var g = document.getElementById('dy-grid'); if (!g) return;
    g.style.gridTemplateColumns = '64px repeat(' + COLS.length + ', minmax(104px, 1fr))';
    var out = ['<div class="h t"></div>'];
    COLS.forEach(function (c) {
      var n = model.techs.filter(function (p) { return p.cert[c.mod]; }).length;
      out.push('<div class="h">' + c.mod + '<small>' + c.name + ' · ' + (n ? n + ' certified working' : 'nobody certified working') + '</small></div>');
    });
    for (var t = DAY0; t < DAY1; t += STEP) {
      out.push('<div class="t' + (t % 60 === 0 ? ' hour' : '') + '">' + short(t) + '</div>');
      COLS.forEach(function (c) {
        var a = apptAt(c.id, t);
        if (a) {
          var red = phases(a).some(function (f) { return f.k === 'red' && f.s < t + STEP && f.e > t; });
          var who = model.owner[D.appts.indexOf(a)];
          var end = a.at + a.mins, first = a.at === t, last = t + STEP >= end;
          var phase = red ? (who ? who + (first ? ' sets up' : last ? ' finishes · ends ' + short(end) : ' hands on') : 'nobody free' + (last ? ' · ends ' + short(end) : ''))
                          : 'running · ' + (who ? who + ' free' : 'unstaffed');
          out.push('<div class="c ' + (red ? 'red' : 'blue') + (first ? ' first' : '') + (last ? ' last' : '') + (who ? '' : ' unstaffed') + '" title="'
            + a.pt + ' · ' + a.tx + ' · ' + clock(a.at) + '–' + clock(end) + ' · ' + a.id + (who ? ' · ' + who : ' · nobody free to run it')
            + '" onclick="HCOS.toast(\'' + a.id + ' · ' + a.pt + ' · ' + a.tx + ' · ' + clock(a.at) + '. Open it on the schedule.\', \'ok\')">'
            + (first ? '<span class="n">' + a.pt + '</span>' : '') + '<span class="w">' + phase + '</span></div>');
        } else {
          var ok = canStart(model, t, c.mod);
          out.push(ok
            ? '<div class="c" onclick="location.href=\'schedule.html#/l-03-new-booking\'" title="' + c.mod + ' at ' + clock(t) + ' — a certified tech is free. Click to book."></div>'
            : '<div class="c black" title="Nobody certified, working today and free at ' + clock(t) + '"></div>');
        }
      });
    }
    g.innerHTML = out.join('');
  }
  function renderPeople(model) {
    var g = document.getElementById('st-grid'); if (!g) return;
    var cols = (DAY1 - DAY0) / STEP;
    g.style.gridTemplateColumns = '190px repeat(' + cols + ', minmax(18px, 1fr))';
    var out = ['<div class="who"></div>'];
    for (var t = DAY0; t < DAY1; t += STEP) out.push('<div class="who tick">' + (t % 60 === 0 ? short(t) : '') + '</div>');
    PEOPLE.forEach(function (p) {
      var on = working[p.n], free = 0, cells = [];
      for (var t = DAY0; t < DAY1; t += STEP) {
        if (!on) { cells.push('<div class="k off"></div>'); continue; }
        var u = model.bag[p.n][cell(t)] || { used: 0, items: [], watch: [] };
        free += STEP - u.used;
        var own = u.items.some(function (x) { return x.own; });
        var names = u.items.map(function (x) { return x.own ? x.own.tx + ' (own IV/lab)' : x.mod; }).join(' + ');
        var cls = u.used >= STEP ? (own ? 'red own' : 'red') : u.used > 0 ? 'part' : u.watch.length ? 'blue' : '';
        cells.push('<div class="k ' + cls + '" title="' + short(t) + ' · ' + (u.used ? u.used + ' of 15 min hands-on: ' + names : u.watch.length ? 'running, hands free' : 'free') + '">'
          + (u.used > 0 && u.used < STEP ? '<i>' + u.used + '</i>' : '') + '</div>');
      }
      var own = (D.work[p.n] || []).length;
      out.push('<div class="who">' + p.n + '<small>' + p.role + (on ? ' · ' + own + ' on the schedule' : ' · not working today') + '</small>'
        + (on ? '<span class="free">' + Math.round(free / 60 * 10) / 10 + ' h free</span>' : '') + '</div>' + cells.join(''));
    });
    g.innerHTML = out.join('');
  }
  function renderSummary(model) {
    var el = document.getElementById('dy-sum'); if (!el) return;
    var free = 0;
    model.techs.forEach(function (p) { for (var t = DAY0; t < DAY1; t += STEP) free += STEP - used(model, p, t); });
    var dark = SHEET.filter(function (m) { return COLS.some(function (c) { return c.mod === m; }) && !model.techs.some(function (p) { return p.cert[m]; }); });
    el.innerHTML =
      '<div><b>' + model.techs.length + '</b><span>techs certified and working today</span></div>'
      + '<div><b>' + D.appts.length + '</b><span>treatments booked on these machines today, from the schedule</span></div>'
      + '<div><b>' + Math.round(free / 60) + ' h</b><span>of technician hands free ' + clock(DAY0) + ' – ' + clock(DAY1) + ', between them</span></div>'
      + '<div class="' + (model.unstaffed.length ? 'bad' : '') + '"><b>' + model.unstaffed.length + '</b><span>booked with nobody free to run them'
        + (model.unstaffed.length ? ': ' + model.unstaffed.slice(0, 4).map(function (a) { return a.pt + ' · ' + a.mod + ' ' + short(a.at); }).join(', ') + (model.unstaffed.length > 4 ? ' and ' + (model.unstaffed.length - 4) + ' more' : '') : '') + '</span></div>'
      + '<div><b>' + dark.length + '</b><span>' + (dark.length ? 'black all day — nobody certified is working: ' + dark.join(', ') : 'modalities black all day') + '</span></div>';
  }
  function renderWho() {
    var w = document.getElementById('dy-who'); if (!w) return;
    w.innerHTML = PEOPLE.map(function (p) {
      return '<label class="' + (working[p.n] ? 'on' : '') + '" title="' + p.role + '"><input type="checkbox"' + (working[p.n] ? ' checked' : '')
        + ' onchange="STAFF.toggle(\'' + p.n + '\', this.checked)">' + p.n + '</label>';
    }).join('');
    var n = document.getElementById('dy-n');
    if (n) n.textContent = PEOPLE.filter(function (p) { return working[p.n]; }).length + ' techs certified and working today';
  }
  function renderDynamic() { var model = build(); renderWho(); renderSummary(model); renderBoard(model); renderPeople(model); }

  /* ---------- Certified Yes/No ---------- */
  function renderCertified() {
    var t = document.getElementById('cert-tbl'); if (!t) return;
    t.innerHTML = '<thead><tr><th>Resource (Human)</th>' + SHEET.map(function (m) { return '<th>' + m + '</th>'; }).join('') + '</tr></thead><tbody>'
      + PEOPLE.map(function (p) {
          return '<tr><td>' + p.n + '<small>' + p.role + '</small></td>' + SHEET.map(function (m) {
            return '<td><button type="button" class="yn ' + (p.cert[m] ? 'yes' : 'no') + '" onclick="STAFF.flip(\'' + p.n + '\',\'' + m + '\')">' + (p.cert[m] ? 'Yes' : 'No') + '</button></td>';
          }).join('') + '</tr>';
        }).join('')
      + '<tr class="sum"><td>Certified</td>' + SHEET.map(function (m) {
          var n = PEOPLE.filter(function (p) { return p.cert[m]; }).length;
          return '<td class="' + (n <= 1 ? 'one' : '') + '">' + n + ' of ' + PEOPLE.length + '</td>';
        }).join('') + '</tr>'
      + '<tr class="sum"><td>On the schedule</td>' + SHEET.map(function (m) {
          var ids = COLS.filter(function (c) { return c.mod === m; }).map(function (c) { return c.name; });
          return '<td>' + (ids.join(' + ') || '—') + '</td>';
        }).join('') + '</tr></tbody>';
  }

  /* ---------- Set Up Page by Modality ---------- */
  function renderSetup() {
    var tb = document.querySelector('#setup-tbl tbody'); if (!tb) return;
    tb.innerHTML = SHEET.map(function (m) {
      var s = SETUP[m], tot = s[0] + s[1] + s[2];
      var booked = D.appts.filter(function (a) { return a.mod === m; });
      var lens = {}; booked.forEach(function (a) { lens[a.mins] = 1; });
      return '<tr><td>' + m + (ON_SHEET[m] ? '' : ' <span class="tc">to confirm</span>') + '</td>'
        + [0, 1, 2].map(function (i) { return '<td><input class="field-input" type="number" min="0" step="5" value="' + s[i] + '" onchange="STAFF.setup(\'' + m + '\',' + i + ',this.value)"> min</td>'; }).join('')
        + '<td class="num">' + tot + ' min</td><td class="num hands">' + (s[0] + s[2]) + ' min</td>'
        + '<td><div class="shape"><i class="a" style="width:' + (s[0] / tot * 100) + '%"></i><i class="d" style="width:' + (s[1] / tot * 100) + '%"></i><i class="a" style="width:' + (s[2] / tot * 100) + '%"></i></div></td>'
        + '<td class="num muted">' + (booked.length ? booked.length + ' today · ' + Object.keys(lens).sort(function (a, b) { return a - b; }).join(' / ') + ' min' : 'none today') + '</td></tr>';
    }).join('')
    + '<tr><td>Infusion chair <span class="tc">the techs&rsquo; own IV work</span></td>'
    + '<td><input class="field-input" type="number" min="0" step="5" value="' + IV_SETUP[0] + '" onchange="STAFF.setupIv(0,this.value)"> min</td>'
    + '<td class="muted">the drip, from the order</td>'
    + '<td><input class="field-input" type="number" min="0" step="5" value="' + IV_SETUP[1] + '" onchange="STAFF.setupIv(1,this.value)"> min</td>'
    + '<td class="num">—</td><td class="num hands">' + (IV_SETUP[0] + IV_SETUP[1]) + ' min</td><td></td><td class="num muted">'
    + Object.keys(D.work).reduce(function (n, k) { return n + D.work[k].length; }, 0) + ' today</td></tr>';
  }

  /* ---------- the booking gate (schedule.html → New booking) ----------
     null when the column is not one of the sheet's machines. */
  function forCol(colId, start, mins) {
    var mod = D.cols[colId];
    if (!mod) return null;
    var probe = { col: colId, mod: mod, at: start, mins: mins, pt: 'this booking', tx: mod, id: 'new' };
    var model = build(probe);
    var i = D.appts.length, who = model.owner[i];
    var s = SETUP[mod], ph = phasesOf(start, mins, s[0], s[2]);
    var certified = PEOPLE.filter(function (p) { return p.cert[mod]; }).map(function (p) { return p.n; });
    var on = model.techs.filter(function (p) { return p.cert[mod]; }).map(function (p) { return p.n; });
    var r = { mod: mod, who: who, certified: certified, working: on, begin: ph[0], end: ph[2] };
    if (who) { r.ok = true; return r; }
    r.ok = false;
    r.why = !on.length
      ? 'Nobody certified on ' + mod + ' is working today (' + (certified.join(', ') || 'no one is certified') + '). The column is black all day.'
      : (on.length > 1 ? on.slice(0, -1).join(', ') + ' and ' + on[on.length - 1] + ' are' : on[0] + ' is') + ' certified on ' + mod + ' but their hands are full in the ' + short(start) + ' or the ' + short(ph[2].s) + ' quarter-hour.';
    return r;
  }
  function nextOk(colId, mins, from) {
    for (var t = from; t + mins <= DAY1; t += STEP) {
      var r = forCol(colId, t, mins);
      if (!r || r.ok) return t;
    }
    return null;
  }

  window.STAFF = {
    SHEET: SHEET, COLS: COLS, PEOPLE: PEOPLE, SETUP: SETUP, DATA: D, working: working,
    forCol: forCol, nextOk: nextOk, clock: clock,
    toggle: function (n, on) { working[n] = on; renderDynamic(); },
    flip: function (n, m) { var p = PEOPLE.filter(function (x) { return x.n === n; })[0]; p.cert[m] = p.cert[m] ? 0 : 1; renderCertified(); renderDynamic(); },
    setup: function (m, i, v) { SETUP[m][i] = Math.max(0, parseInt(v, 10) || 0); renderSetup(); renderDynamic(); },
    setupIv: function (i, v) { IV_SETUP[i] = Math.max(0, parseInt(v, 10) || 0); renderSetup(); renderDynamic(); },
    render: function () { renderDynamic(); renderCertified(); renderSetup(); }
  };
  window.STAFF.render();
})();
