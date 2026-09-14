/* THE STAFF MODULE IS THE CLINIC'S SHEET (Cassandra, 2026-09-14), and nothing else.
   Three blocks, in the sheet's own words:

     CERTIFIED YES/NO          Resource (Human) × modality
     DYNAMIC SCHEDULING        "N techs certified and working today" → a 15-minute board
     SET UP PAGE BY MODALITY   Active Time Beginning · Dormant Time · Active Time End

   One model, read by all three pages. A treatment needs a person's hands at the
   beginning and the end (red); in between the machine runs alone and that person
   is FREE (blue). A cell is black when nobody certified, working today and free
   could start there. Everything on screen is derived from these tables. */
(function () {
  'use strict';

  var MODS = ['RedLight', 'Erchonia Laser', 'Nano Bath 1', 'Nano Bath 2', 'Halo Therapy',
              'Bio Charger', 'Bemer', 'Hydrogen Inhalation', 'Nano Vie', 'RIFE'];

  /* Certified Yes/No — exactly the sheet */
  var PEOPLE = [
    { n: 'Nick', cert: { 'RedLight': 1, 'Erchonia Laser': 1, 'Nano Bath 1': 1, 'Nano Bath 2': 1, 'Halo Therapy': 1, 'Bio Charger': 1, 'Bemer': 1, 'Hydrogen Inhalation': 0, 'Nano Vie': 0, 'RIFE': 1 } },
    { n: 'Juan', cert: { 'RedLight': 1, 'Erchonia Laser': 1, 'Nano Bath 1': 1, 'Nano Bath 2': 1, 'Halo Therapy': 1, 'Bio Charger': 1, 'Bemer': 1, 'Hydrogen Inhalation': 0, 'Nano Vie': 0, 'RIFE': 1 } },
    { n: 'Bea',  cert: { 'RedLight': 1, 'Erchonia Laser': 1, 'Nano Bath 1': 0, 'Nano Bath 2': 0, 'Halo Therapy': 1, 'Bio Charger': 1, 'Bemer': 1, 'Hydrogen Inhalation': 1, 'Nano Vie': 1, 'RIFE': 1 } },
    { n: 'Wes',  cert: { 'RedLight': 1, 'Erchonia Laser': 1, 'Nano Bath 1': 0, 'Nano Bath 2': 0, 'Halo Therapy': 1, 'Bio Charger': 1, 'Bemer': 1, 'Hydrogen Inhalation': 1, 'Nano Vie': 1, 'RIFE': 1 } }
  ];

  /* Set Up Page by Modality — [active beginning, dormant, active end] in minutes.
     RedLight and Erchonia are filled in on the sheet; the rest are blank there and
     carry placeholders marked "to confirm" so the board has something to draw. */
  var SETUP = {
    'RedLight':            [5, 50, 5],
    'Erchonia Laser':      [10, 15, 5],
    'Nano Bath 1':         [10, 40, 10],
    'Nano Bath 2':         [10, 40, 10],
    'Halo Therapy':        [5, 45, 5],
    'Bio Charger':         [5, 25, 5],
    'Bemer':               [5, 20, 5],
    'Hydrogen Inhalation': [5, 25, 5],
    'Nano Vie':            [5, 25, 5],
    'RIFE':                [5, 25, 5]
  };
  var ON_SHEET = { 'RedLight': true, 'Erchonia Laser': true };

  /* The sheet's example morning: RedLight 8:00, Nano Bath 1 8:00, Erchonia 8:15,
     Halo 8:15, Bio Charger 9:00. Synthetic patients. */
  var APPTS = [
    { m: 'RedLight',       at: 480, pt: 'Hana Sato' },
    { m: 'Nano Bath 1',    at: 480, pt: 'Tom Alvarez' },
    { m: 'Erchonia Laser', at: 495, pt: 'Priya Natarajan' },
    { m: 'Halo Therapy',   at: 495, pt: 'Rosa Iglesias' },
    { m: 'Bio Charger',    at: 540, pt: 'Walter Hsu' }
  ];

  var DAY0 = 480, DAY1 = 720, STEP = 15;
  var working = { Nick: true, Juan: true, Bea: false, Wes: false };

  function clock(m) { var h = Math.floor(m / 60), mm = m % 60; return h + ':' + (mm < 10 ? '0' : '') + mm; }
  function total(m) { var s = SETUP[m]; return s[0] + s[1] + s[2]; }
  function phases(a) {
    var s = SETUP[a.m];
    return [{ k: 'red', s: a.at, e: a.at + s[0] },
            { k: 'blue', s: a.at + s[0], e: a.at + s[0] + s[1] },
            { k: 'red', s: a.at + s[0] + s[1], e: a.at + s[0] + s[1] + s[2] }];
  }

  /* who has hands on what, minute by minute. Pooled and greedy: a treatment's red
     minutes go to the first certified tech free at every one of them, and the
     same person opens and closes it. Blue counts as free. */
  function build() {
    var techs = PEOPLE.filter(function (p) { return working[p.n]; });
    var busy = {}; techs.forEach(function (p) { busy[p.n] = {}; });
    var owner = {}, unstaffed = [];
    APPTS.forEach(function (a, i) {
      var need = [];
      phases(a).forEach(function (f) { if (f.k === 'red') for (var t = f.s; t < f.e; t++) need.push(t); });
      var who = techs.filter(function (p) { return p.cert[a.m]; })
        .filter(function (p) { return need.every(function (t) { var b = busy[p.n][t]; return !b || b.watch; }); })[0];
      if (!who) { unstaffed.push(a); return; }
      owner[i] = who.n;
      need.forEach(function (t) { busy[who.n][t] = a; });
      phases(a).forEach(function (f) { if (f.k === 'blue') for (var t = f.s; t < f.e; t++) if (!busy[who.n][t]) busy[who.n][t] = { watch: a }; });
    });
    return { techs: techs, busy: busy, owner: owner, unstaffed: unstaffed };
  }
  function handsFree(model, p, t0) {
    for (var t = t0; t < t0 + STEP; t++) { var b = model.busy[p.n][t]; if (b && !b.watch) return false; }
    return true;
  }
  function canStart(model, t0, mod) {
    return model.techs.some(function (p) { return p.cert[mod] && handsFree(model, p, t0); });
  }
  function apptAt(mod, t) {
    return APPTS.filter(function (x) { return x.m === mod && x.at <= t && t < x.at + total(mod); })[0] || null;
  }

  /* ---------- Dynamic Scheduling ---------- */
  function renderBoard(model) {
    var g = document.getElementById('dy-grid'); if (!g) return;
    g.style.gridTemplateColumns = '60px repeat(' + MODS.length + ', minmax(96px, 1fr))';
    var out = ['<div class="h t"></div>'];
    MODS.forEach(function (m) {
      var n = model.techs.filter(function (p) { return p.cert[m]; }).length;
      out.push('<div class="h">' + m + '<small>' + (n ? n + ' certified working' : 'nobody certified working') + '</small></div>');
    });
    for (var t = DAY0; t < DAY1; t += STEP) {
      out.push('<div class="t' + (t % 60 === 0 ? ' hour' : '') + '">' + clock(t) + '</div>');
      MODS.forEach(function (m) {
        var a = apptAt(m, t);
        if (a) {
          var red = phases(a).some(function (f) { return f.k === 'red' && f.s < t + STEP && f.e > t; });
          var who = model.owner[APPTS.indexOf(a)];
          out.push('<div class="c ' + (red ? 'red' : 'blue') + (a.at === t ? ' start' : '') + '" title="' + a.pt + ' · ' + m + ' · ' + clock(a.at) + (who ? ' · ' + who : ' · nobody free to run it') + '">'
            + (a.at === t ? '<span class="n">' + a.pt + '</span>' : '') + (red && who ? '<span class="w">' + who + '</span>' : '') + '</div>');
        } else {
          var ok = canStart(model, t, m);
          out.push(ok
            ? '<div class="c" onclick="HCOS.toast(\'' + m + ' at ' + clock(t) + ' — a certified tech is free to start it.\', \'ok\')"></div>'
            : '<div class="c black" title="Nobody certified, working today and free at ' + clock(t) + '"></div>');
        }
      });
    }
    g.innerHTML = out.join('');
  }
  function renderPeople(model) {
    var g = document.getElementById('st-grid'); if (!g) return;
    var cols = (DAY1 - DAY0) / STEP;
    g.style.gridTemplateColumns = '150px repeat(' + cols + ', minmax(24px, 1fr))';
    var out = ['<div class="who"></div>'];
    for (var t = DAY0; t < DAY1; t += STEP) out.push('<div class="who tick">' + (t % 60 === 0 ? clock(t) : '') + '</div>');
    PEOPLE.forEach(function (p) {
      var on = working[p.n], free = 0, cells = [];
      for (var t = DAY0; t < DAY1; t += STEP) {
        if (!on) { cells.push('<div class="k off"></div>'); continue; }
        var red = false, blue = false, name = '';
        for (var u = t; u < t + STEP; u++) { var b = model.busy[p.n][u]; if (b && !b.watch) { red = true; name = b.m; } else if (b && b.watch) blue = true; }
        if (!red) free += STEP;
        cells.push('<div class="k ' + (red ? 'red' : blue ? 'blue' : '') + '">' + (red ? '<span class="n">' + name + '</span>' : '') + '</div>');
      }
      out.push('<div class="who">' + p.n + (on ? '<span class="free">' + free + ' min free</span>' : '<small>not working today</small>') + '</div>' + cells.join(''));
    });
    g.innerHTML = out.join('');
  }
  function renderSummary(model) {
    var el = document.getElementById('dy-sum'); if (!el) return;
    var free = 0;
    model.techs.forEach(function (p) { for (var t = DAY0; t < DAY1; t += STEP) if (handsFree(model, p, t)) free += STEP; });
    var dark = MODS.filter(function (m) { return !model.techs.some(function (p) { return p.cert[m]; }); });
    el.innerHTML =
      '<div><b>' + model.techs.length + '</b><span>techs certified and working today</span></div>'
      + '<div><b>' + free + ' min</b><span>of technician time free 8–12, between them</span></div>'
      + '<div><b>' + model.unstaffed.length + '</b><span>booked treatments with nobody free to run them'
        + (model.unstaffed.length ? ': ' + model.unstaffed.map(function (a) { return a.m + ' ' + clock(a.at); }).join(', ') : '') + '</span></div>'
      + '<div><b>' + dark.length + '</b><span>' + (dark.length ? 'black all day — nobody certified is working: ' + dark.join(', ') : 'modalities black all day') + '</span></div>';
  }
  function renderWho() {
    var w = document.getElementById('dy-who'); if (!w) return;
    w.innerHTML = PEOPLE.map(function (p) {
      return '<label class="' + (working[p.n] ? 'on' : '') + '"><input type="checkbox"' + (working[p.n] ? ' checked' : '')
        + ' onchange="STAFF.toggle(\'' + p.n + '\', this.checked)">' + p.n + '</label>';
    }).join('');
    var n = document.getElementById('dy-n');
    if (n) n.textContent = PEOPLE.filter(function (p) { return working[p.n]; }).length + ' techs certified and working today';
  }
  function renderDynamic() { var model = build(); renderWho(); renderSummary(model); renderBoard(model); renderPeople(model); }

  /* ---------- Certified Yes/No ---------- */
  function renderCertified() {
    var t = document.getElementById('cert-tbl'); if (!t) return;
    t.innerHTML = '<thead><tr><th>Resource (Human)</th>' + MODS.map(function (m) { return '<th>' + m + '</th>'; }).join('') + '</tr></thead><tbody>'
      + PEOPLE.map(function (p) {
          return '<tr><td>' + p.n + '</td>' + MODS.map(function (m) {
            return '<td><button type="button" class="yn ' + (p.cert[m] ? 'yes' : 'no') + '" onclick="STAFF.flip(\'' + p.n + '\',\'' + m + '\')">' + (p.cert[m] ? 'Yes' : 'No') + '</button></td>';
          }).join('') + '</tr>';
        }).join('')
      + '<tr class="sum"><td>Certified</td>' + MODS.map(function (m) {
          var n = PEOPLE.filter(function (p) { return p.cert[m]; }).length;
          return '<td class="' + (n <= 1 ? 'one' : '') + '">' + n + ' of ' + PEOPLE.length + '</td>';
        }).join('') + '</tr></tbody>';
  }

  /* ---------- Set Up Page by Modality ---------- */
  function renderSetup() {
    var tb = document.querySelector('#setup-tbl tbody'); if (!tb) return;
    tb.innerHTML = MODS.map(function (m) {
      var s = SETUP[m], tot = total(m);
      return '<tr><td>' + m + (ON_SHEET[m] ? '' : ' <span class="tc">to confirm</span>') + '</td>'
        + [0, 1, 2].map(function (i) { return '<td><input class="field-input" type="number" min="0" step="5" value="' + s[i] + '" onchange="STAFF.setup(\'' + m + '\',' + i + ',this.value)"> min</td>'; }).join('')
        + '<td class="num">' + tot + ' min</td><td class="num hands">' + (s[0] + s[2]) + ' min</td>'
        + '<td><div class="shape"><i class="a" style="width:' + (s[0] / tot * 100) + '%"></i><i class="d" style="width:' + (s[1] / tot * 100) + '%"></i><i class="a" style="width:' + (s[2] / tot * 100) + '%"></i></div></td></tr>';
    }).join('');
  }

  window.STAFF = {
    MODS: MODS, PEOPLE: PEOPLE, SETUP: SETUP, APPTS: APPTS, working: working,
    toggle: function (n, on) { working[n] = on; renderDynamic(); },
    flip: function (n, m) { var p = PEOPLE.filter(function (x) { return x.n === n; })[0]; p.cert[m] = p.cert[m] ? 0 : 1; renderCertified(); renderDynamic(); },
    setup: function (m, i, v) { SETUP[m][i] = Math.max(0, parseInt(v, 10) || 0); renderSetup(); renderDynamic(); },
    render: function () { renderDynamic(); renderCertified(); renderSetup(); }
  };
  STAFF.render();
})();
