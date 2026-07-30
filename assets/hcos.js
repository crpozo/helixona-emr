/* ==========================================================================
   HCOS wireframe runtime — screen switching + the feedback widget
   Loaded at the end of <body> on every page. Exposes window.HCOS.

   Page contract:
     <body data-page="schedule" data-page-title="Scheduling" data-shell="app">
       <div class="screens">
         <section class="screen" id="l-01-day" data-title="Day view">…</section>
         …
       </div>
       <script src="assets/hcos.js"></script>
     </body>

   data-shell: "app"  = navy sidebar + topbar + chips (module pages)
               "bare" = slim top strip + chips, no sidebar (login)
               "none" = page owns its own layout (hub); widget only
   ========================================================================== */

(function () {
  'use strict';

  var LS_NOTES = 'hcos.notes.v1';

  /* The EMR navigation — the real product menu, grouped the way the clinic works */
  var MODULES = [
    { group: 'Clinic' },
    { name: 'Schedule', href: 'schedule.html', page: 'schedule' },
    { name: 'Patients', href: 'patients.html', page: 'patients' },
    { name: 'Documentation', href: 'clinical.html', page: 'clinical' },
    { name: 'Orders & results', href: 'labs.html', page: 'labs' },
    { name: 'Medications', href: 'pharmacy.html', page: 'pharmacy' },
    { name: 'Messages', href: 'communication.html', page: 'communication' },
    { name: 'Billing', href: 'billing.html', page: 'billing' },
    { group: 'Programs' },
    { name: 'Intake', href: 'intake.html', page: 'intake' },
    { name: 'Readiness', href: 'readiness.html', page: 'readiness' },
    { name: 'Patient journey', href: 'journey.html', page: 'journey' },
    { name: 'Caregiver access', href: 'caregiver.html', page: 'caregiver' },
    { group: 'Practice' },
    { name: 'Pricing & memberships', href: 'pricing.html', page: 'pricing' },
    { name: 'Dashboards', href: 'reporting.html', page: 'reporting' },
    { name: 'Security & audit', href: 'security.html', page: 'security' }
  ];

  /* Second-level tabs inside the deep modules (rendered under the topbar) */
  var SUBNAV = {
    schedule: [
      ['Calendar', 'schedule.html'],
      ['Booking rules', 'schedule-rules.html']
    ],
    pricing: [
      ['Price list', 'pricing.html'],
      ['Memberships', 'pricing-memberships.html']
    ],
    intake: [
      ['Triage', 'intake.html'],
      ['Public funnel', 'intake-funnel.html'],
      ['Onboarding', 'intake-onboarding.html'],
      ['Documents', 'intake-documents.html'],
      ['Front desk', 'intake-frontdesk.html'],
      ['Kiosk', 'intake-kiosk.html'],
      ['Pre-visit', 'intake-previsit.html'],
      ['Admin & builder', 'intake-admin.html']
    ],
    clinical: [
      ['Provider', 'clinical.html'],
      ['Chart', 'clinical-chart.html'],
      ['Questionnaires', 'clinical-questionnaires.html'],
      ['Infusion suite', 'clinical-infusion.html'],
      ['Remote MA', 'clinical-remote.html'],
      ['Templates & macros', 'clinical-templates.html'],
      ['Governance', 'clinical-governance.html']
    ],
    reporting: [
      ['Today', 'reporting.html'],
      ['Executive', 'reporting-exec.html'],
      ['AI insights', 'reporting-ai.html'],
      ['Revenue', 'reporting-revenue.html'],
      ['Insurance & billing', 'reporting-billing.html'],
      ['Patients', 'reporting-patients.html'],
      ['Patient journey', 'reporting-journey.html'],
      ['Marketing', 'reporting-marketing.html'],
      ['Team & roles', 'reporting-team.html'],
      ['Employees', 'reporting-employees.html'],
      ['Treatments', 'reporting-treatments.html'],
      ['Admin', 'reporting-admin.html']
    ],
    journey: [
      ['Today', 'journey.html'],
      ['My plan', 'journey-plan.html'],
      ['Check-in', 'journey-checkin.html'],
      ['Schedule', 'journey-schedule.html'],
      ['Progress', 'journey-progress.html'],
      ['Rewards', 'journey-rewards.html'],
      ['Book a visit', 'journey-book.html'],
      ['Care plan (staff)', 'journey-careplan.html']
    ]
  };

  var body = document.body;
  var PAGE = body.getAttribute('data-page') || 'page';
  var PAGE_TITLE = body.getAttribute('data-page-title') || document.title;
  var SHELL = body.getAttribute('data-shell') || 'app';

  var screens = [];      /* [{id, title, el}] */
  var currentScreen = null;
  var publishedNotes = [];  /* from feedback/notes.json */
  var chipsNav = null;
  var topScreenEl = null;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- local notes ---------- */
  function myNotes() {
    try { return JSON.parse(localStorage.getItem(LS_NOTES) || '[]'); }
    catch (e) { return []; }
  }
  function saveMyNotes(list) {
    try { localStorage.setItem(LS_NOTES, JSON.stringify(list)); } catch (e) { /* private mode */ }
  }
  function notesFor(screenId) {
    var mine = myNotes().filter(function (n) { return n.page === PAGE && n.screen === screenId; });
    var pub = publishedNotes.filter(function (n) { return n.page === PAGE && n.screen === screenId; });
    return { mine: mine, pub: pub, total: mine.length + pub.length };
  }

  /* ---------- shell ---------- */
  function buildSidebar() {
    var sb = el('aside', 'sidebar');
    var brand = el('div', 'brand',
      '<a href="schedule.html"><div class="brand-title">Helixona</div>' +
      '<div class="brand-sub">Functional medicine &amp; infusion</div></a>');
    sb.appendChild(brand);
    MODULES.forEach(function (m) {
      if (m.group) { sb.appendChild(el('div', 'nav-group', esc(m.group))); return; }
      var active = m.page === PAGE || PAGE.indexOf(m.page + '-') === 0;
      var a = el('a', 'nav-item' + (active ? ' active' : ''));
      a.href = m.href;
      a.innerHTML = '<span>' + esc(m.name) + '</span>';
      sb.appendChild(a);
    });
    var foot = el('div', 'sidebar-user',
      '<span class="avatar">DD</span>' +
      '<span class="sidebar-user-meta"><b>Dr. Drannikov</b><span>Provider</span></span>' +
      '<a href="login.html" class="sidebar-signout">Sign out</a>');
    sb.appendChild(foot);
    return sb;
  }

  function buildTopbar() {
    var tb = el('div', 'topbar');
    var left = el('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';
    left.style.gap = '12px';
    var toggle = el('button', 'sidebar-toggle-btn', '☰');
    toggle.setAttribute('aria-label', 'Open navigation');
    toggle.addEventListener('click', function () {
      var sb = document.querySelector('.sidebar');
      var scrim = document.querySelector('.sidebar-scrim');
      if (sb) sb.classList.add('open');
      if (scrim) scrim.classList.add('open');
    });
    left.appendChild(toggle);
    var t = el('div', '', '<div class="top-title">' + esc(PAGE_TITLE) + '</div><div class="top-screen"></div>');
    left.appendChild(t);
    tb.appendChild(left);
    var right = el('div', 'top-right');
    var search = el('input', 'search-input top-search');
    search.placeholder = 'Search patients, claims, notes…';
    search.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') { HCOS.toast('Search arrives with the real build.', 'ok'); search.value = ''; }
    });
    right.appendChild(search);
    tb.appendChild(right);
    topScreenEl = t.querySelector('.top-screen');
    return tb;
  }

  function buildShell() {
    var screensWrap = document.querySelector('.screens');
    if (!screensWrap) return;

    if (SHELL === 'app') {
      var shell = el('div', 'shell');
      var sb = buildSidebar();
      var scrim = el('div', 'sidebar-scrim');
      scrim.addEventListener('click', function () {
        sb.classList.remove('open');
        scrim.classList.remove('open');
      });
      var main = el('div', 'main');
      main.appendChild(buildTopbar());
      var subnav = SUBNAV[PAGE.split('-')[0]];
      if (subnav) {
        var tabs = el('nav', 'subnav');
        subnav.forEach(function (t) {
          var a = el('a', 'subnav-tab' + (t[1] === PAGE + '.html' ? ' active' : ''), esc(t[0]));
          a.href = t[1];
          tabs.appendChild(a);
        });
        main.appendChild(tabs);
      }
      var dashBar = buildDashFilters();
      if (dashBar) main.appendChild(dashBar);
      chipsNav = el('nav', 'screen-chips');
      main.appendChild(chipsNav);
      var canvas = el('div', 'canvas');
      var inner = el('div', 'canvas-inner');
      canvas.appendChild(inner);
      main.appendChild(canvas);
      shell.appendChild(sb);
      shell.appendChild(scrim);
      shell.appendChild(main);
      body.insertBefore(shell, screensWrap);
      inner.appendChild(screensWrap);
    }
    /* SHELL === 'bare': chrome-free page (login) — no topbar, no chips.
       Screens navigate through their own in-card links; the widget still loads. */
  }

  /* ---------- dashboard filters · period + payment (DASHBOARD_SPEC) ----------
     Which filters a page shows is declared here, not on the page: the header
     only offers a filter where it actually changes the numbers. */
  var DASH_FILTERS = {
    'reporting-exec':       ['period', 'payment'],
    'reporting-revenue':    ['period', 'payment'],
    'reporting-billing':    ['period'],
    'reporting-patients':   ['period', 'payment'],
    'reporting-marketing':  ['period'],
    'reporting-team':       ['period'],
    'reporting-employees':  ['period', 'payment'],
    'reporting-treatments': ['period', 'payment']
  };
  /* 1 = one month. A real build turns these into date-partitioned queries. */
  var PERIODS = [
    ['today',   'Today',       1 / 30.42],
    ['week',    'This week',   0.25],
    ['month',   'This month',  1],
    ['quarter', 'Quarter',     3],
    ['ytd',     'Year (YTD)',  5.4]
  ];
  var PAYMENTS = [['all', 'Cash + Insurance'], ['cash', 'Cash only'], ['insurance', 'Insurance only']];
  var CASH_SHARE = 0.42;
  var dash = { period: 'month', payment: 'all' };

  function periodScale() {
    for (var i = 0; i < PERIODS.length; i++) if (PERIODS[i][0] === dash.period) return PERIODS[i][2];
    return 1;
  }
  function periodLabel() {
    for (var i = 0; i < PERIODS.length; i++) if (PERIODS[i][0] === dash.period) return PERIODS[i][1];
    return '';
  }
  function payMultiplier() {
    return dash.payment === 'cash' ? CASH_SHARE : dash.payment === 'insurance' ? (1 - CASH_SHARE) : 1;
  }

  /* Re-render a figure from its monthly baseline, keeping the shape it was
     written in: $326,800 stays money, 1,280 stays a count, 4.6 keeps a decimal. */
  function reFormat(base, raw) {
    var money = raw.indexOf('$') === 0;
    var dec = /\.\d/.test(raw) ? (raw.split('.')[1].replace(/[^\d]/g, '').length) : 0;
    var suffix = raw.replace(/^[$]?[\d,.]+/, '');
    var v = base;
    if (money && v >= 1000) dec = 0;
    var out = v.toFixed(dec);
    var parts = out.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (money ? '$' : '') + parts.join('.') + suffix;
  }

  function applyDash() {
    var scale = periodScale(), pay = payMultiplier();
    Array.prototype.forEach.call(document.querySelectorAll('[data-vol]'), function (n) {
      if (!n.dataset.volBase) {
        n.dataset.volBase = n.textContent.trim();
        n.dataset.volRaw = n.textContent.trim();
      }
      var base = parseFloat(n.dataset.volBase.replace(/[^\d.]/g, ''));
      if (isNaN(base)) return;
      var mult = scale * (n.hasAttribute('data-pay') ? pay : 1);
      n.textContent = reFormat(base * mult, n.dataset.volRaw);
    });
    /* Series that belong to the payment type you filtered out drop to zero —
       the bar shrinks, it does not sit there greyed out pretending to be data. */
    Array.prototype.forEach.call(document.querySelectorAll('.series-cash, .series-ins'), function (b) {
      if (b.closest('.pay-key')) return;              /* the key stays readable */
      var isCash = b.classList.contains('series-cash');
      var off = (dash.payment === 'cash' && !isCash) || (dash.payment === 'insurance' && isCash);
      var dim = b.style.height ? 'height' : (b.style.width ? 'width' : '');
      if (dim) {
        if (!b.dataset.dimBase) b.dataset.dimBase = b.style[dim];
        b.style[dim] = off ? '0%' : b.dataset.dimBase;
      }
      var row = b.closest('.r-hbar');
      if (row) row.style.opacity = off ? '0.35' : '';
    });
    var scope = document.querySelector('.dash-scope');
    if (scope) {
      var pl = PAYMENTS.filter(function (p) { return p[0] === dash.payment; })[0];
      scope.textContent = periodLabel() + ' · ' + (pl ? pl[1] : '');
    }
  }

  function buildDashFilters() {
    var which = DASH_FILTERS[PAGE];
    if (!which) return null;
    var bar = el('div', 'dash-filters');
    function group(label, items, key) {
      var g = el('div', 'dash-fgroup');
      g.appendChild(el('span', 'dash-flabel', label));
      items.forEach(function (it) {
        var b = el('button', 'dash-chip' + (dash[key] === it[0] ? ' active' : ''), esc(it[1]));
        b.setAttribute('data-hcos-handled', '1');
        b.addEventListener('click', function () {
          dash[key] = it[0];
          Array.prototype.forEach.call(g.querySelectorAll('.dash-chip'), function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          applyDash();
        });
        g.appendChild(b);
      });
      return g;
    }
    if (which.indexOf('payment') >= 0) bar.appendChild(group('Payment', PAYMENTS, 'payment'));
    if (which.indexOf('period') >= 0) bar.appendChild(group('Period', PERIODS, 'period'));
    bar.appendChild(el('span', 'dash-scope', ''));
    return bar;
  }

  /* Delta pills — a fall is good on a denial rate and bad on revenue, so the
     metric decides the colour, never the arrow. */
  var LOWER_IS_BETTER = /denial|denied|no.?show|cancell?ation|days to|wait|aging|backlog|overdue|churn|cost|outstanding|unbilled|unlocked|pending|unsent|unresolved|rework|error|readmis|drop|attrition|complaint|escalat|missing|expired|dispute|write.?off|refund|credit balance|leakage|gap/i;
  function paintDeltas() {
    Array.prototype.forEach.call(document.querySelectorAll('.r-delta'), function (d) {
      if (d.dataset.painted) return;
      d.dataset.painted = '1';
      var txt = d.textContent.trim();
      var down = txt.indexOf('▼') >= 0;
      var card = d.closest('.stat-card') || d.parentElement;
      var label = card ? (card.textContent || '') : '';
      var lower = d.hasAttribute('data-lower-better') || LOWER_IS_BETTER.test(label);
      var good = lower ? down : !down;
      d.className = 'r-delta delta ' + (good ? 'good' : 'bad');
      d.title = (good ? 'Moving the right way' : 'Moving the wrong way') +
                ' — ' + (lower ? 'lower is better' : 'higher is better');
    });
  }

  /* A KPI you can click narrows the tables under it to the rows it counts. */
  function wireKpis() {
    Array.prototype.forEach.call(document.querySelectorAll('.stat-card[data-kpi]'), function (card) {
      card.classList.add('clickable');
      card.setAttribute('data-hcos-handled', '1');
      card.addEventListener('click', function () {
        var screen = card.closest('.screen') || document;
        var on = !card.classList.contains('picked');
        Array.prototype.forEach.call(screen.querySelectorAll('.stat-card.picked'), function (c) { c.classList.remove('picked'); });
        var token = (card.getAttribute('data-kpi') || '').toLowerCase();
        var hits = 0;
        Array.prototype.forEach.call(screen.querySelectorAll('.tbl tbody tr'), function (tr) {
          var match = tr.textContent.toLowerCase().indexOf(token) >= 0;
          tr.style.display = (on && !match) ? 'none' : '';
          if (on && match) hits++;
        });
        if (on) card.classList.add('picked');
        var lbl = card.querySelector('.stat-lbl');
        toast(on ? (lbl ? lbl.textContent : token) + ' — ' + hits + ' matching rows' : 'Filter cleared');
      });
    });
  }

  /* ---------- screens + chips ---------- */
  function collectScreens() {
    var secs = document.querySelectorAll('.screen');
    Array.prototype.forEach.call(secs, function (s, i) {
      screens.push({ id: s.id || (PAGE + '-' + (i + 1)), title: s.getAttribute('data-title') || ('Screen ' + (i + 1)), el: s });
    });
  }

  function buildChips() {
    if (!chipsNav || screens.length === 0) return;
    screens.forEach(function (s, i) {
      var c = el('button', 'chip');
      c.setAttribute('data-screen', s.id);
      c.innerHTML = '<span class="chip-num">' + (i + 1) + '</span><span>' + esc(s.title) + '</span>';
      c.addEventListener('click', function () { activate(s.id); });
      chipsNav.appendChild(c);
    });
  }

  function activate(id, skipScroll) {
    var target = null;
    screens.forEach(function (s) { if (s.id === id) target = s; });
    if (!target) return;
    screens.forEach(function (s) { s.el.classList.toggle('active', s === target); });
    if (chipsNav) {
      Array.prototype.forEach.call(chipsNav.querySelectorAll('.chip'), function (c) {
        c.classList.toggle('active', c.getAttribute('data-screen') === id);
      });
    }
    currentScreen = target;
    if (topScreenEl) {
      topScreenEl.textContent = target.title;
    }
    /* '#/' prefix: never a real element id, so the browser never anchor-scrolls to it */
    try { history.replaceState(null, '', '#/' + id); } catch (e) { /* file:// quirks */ }
    if (!skipScroll) window.scrollTo(0, 0);
    refreshFeedbackUI();
  }

  /* ---------- feedback widget ---------- */
  var fbkPanel = null;
  var fbkBtn = null;
  var fbkPin = null;
  var fbkDrawer = null;
  var fbkOverlay = null;
  var fbkType = 'Idea';

  function widgetScreenId() { return currentScreen ? currentScreen.id : (body.getAttribute('data-screen') || 'main'); }
  function widgetScreenLabel() { return PAGE + '/' + widgetScreenId(); }

  function buildWidget() {
    fbkBtn = el('button', 'fbk-btn');
    fbkBtn.innerHTML = '✎ Feedback <span class="fbk-count" style="display:none">0</span>';
    fbkBtn.addEventListener('click', function () { fbkPanel.classList.toggle('open'); });
    body.appendChild(fbkBtn);

    fbkPanel = el('div', 'fbk-panel');
    var typeChips = NOTE_TYPES.map(function (t) {
      return '<button type="button" class="fbk-type' + (t === 'Idea' ? ' active' : '') + '" data-type="' + t + '">' + t + '</button>';
    }).join('');
    fbkPanel.innerHTML =
      '<div class="fbk-panel-head">' +
      '  <div class="fbk-panel-title">Leave a note on this screen</div>' +
      '  <div class="fbk-panel-sub">Ideas, problems, questions — everything shapes the build.</div>' +
      '</div>' +
      '<div class="fbk-panel-body">' +
      '  <div class="field"><label class="field-label">Screen</label>' +
      '    <input class="field-input" id="fbk-screen" disabled></div>' +
      '  <div class="field"><label class="field-label">Type</label>' +
      '    <div class="fbk-types">' + typeChips + '</div></div>' +
      '  <div class="field"><label class="field-label">Note</label>' +
      '    <textarea class="field-textarea" id="fbk-text" placeholder="What would make this screen better?"></textarea></div>' +
      '  <div class="fbk-actions">' +
      '    <button class="btn btn-primary" id="fbk-save">Save note</button>' +
      '  </div>' +
      '</div>' +
      '<div class="fbk-panel-foot">' +
      '  <button id="fbk-export">Export my notes</button>' +
      '  <button id="fbk-view">View notes on this screen</button>' +
      '</div>';
    body.appendChild(fbkPanel);

    Array.prototype.forEach.call(fbkPanel.querySelectorAll('.fbk-type'), function (b) {
      b.addEventListener('click', function () {
        fbkType = b.getAttribute('data-type');
        Array.prototype.forEach.call(fbkPanel.querySelectorAll('.fbk-type'), function (x) {
          x.classList.toggle('active', x === b);
        });
      });
    });

    fbkPanel.querySelector('#fbk-save').addEventListener('click', saveNote);
    fbkPanel.querySelector('#fbk-export').addEventListener('click', exportNotes);
    fbkPanel.querySelector('#fbk-view').addEventListener('click', function () {
      fbkPanel.classList.remove('open');
      openNotesDrawer();
    });

    fbkPin = el('button', 'fbk-pin');
    fbkPin.style.display = 'none';
    fbkPin.addEventListener('click', openNotesDrawer);
    body.appendChild(fbkPin);

    fbkOverlay = el('div', 'drawer-overlay');
    fbkOverlay.addEventListener('click', closeNotesDrawer);
    body.appendChild(fbkOverlay);
    fbkDrawer = el('aside', 'drawer');
    fbkDrawer.id = 'hcos-notes-drawer';
    body.appendChild(fbkDrawer);
  }

  var NOTE_TYPES = ['Idea', 'Problem', 'Question', 'Approved'];

  function saveNote() {
    var text = fbkPanel.querySelector('#fbk-text').value.trim();
    if (!text) { HCOS.toast('Write the note first — even one line helps.', 'warn'); return; }
    var note = {
      id: 'n-' + Date.now(),
      page: PAGE,
      screen: widgetScreenId(),
      type: fbkType,
      text: text,
      date: new Date().toISOString().slice(0, 10),
      status: 'open'
    };
    var list = myNotes();
    list.push(note);
    saveMyNotes(list);
    fbkPanel.querySelector('#fbk-text').value = '';
    refreshFeedbackUI();
    HCOS.toast('Saved on this screen.', 'ok');
  }

  function exportNotes() {
    var list = myNotes();
    if (list.length === 0) { HCOS.toast('No saved notes yet — write one first.', 'warn'); return; }
    var blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'hcos-notes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    HCOS.toast('Downloaded hcos-notes.json — share the file to publish your notes.', 'ok');
  }

  function noteHTML(n, mine) {
    var typeCls = (n.type || 'idea').toLowerCase();
    return '<div class="fbk-note' + (mine ? ' mine' : '') + '">' +
      '<div class="fbk-note-head">' +
      (n.name ? '<span class="fbk-note-name">' + esc(n.name) + '</span>' : '') +
      '  <span class="fbk-type-pill ' + esc(typeCls) + '">' + esc(n.type || 'Idea') + '</span>' +
      (n.status === 'done' ? '<span class="fbk-status-done">✓ done</span>' : '') +
      '  <span class="fbk-note-date">' + esc(n.date || '') + (mine ? ' · yours, only in this browser' : '') + '</span>' +
      (mine ? '<button class="fbk-note-del" data-del-note="' + esc(n.id) + '">Delete</button>' : '') +
      '</div>' +
      '<div class="fbk-note-text">' + esc(n.text || '') + '</div>' +
      '</div>';
  }

  function deleteNote(id) {
    saveMyNotes(myNotes().filter(function (n) { return n.id !== id; }));
    refreshFeedbackUI();
    openNotesDrawer(); /* re-render the list in place */
    HCOS.toast('Note deleted.', 'ok');
  }

  function openNotesDrawer() {
    var sid = widgetScreenId();
    var data = notesFor(sid);
    var html =
      '<div class="drawer-head"><div>' +
      '  <div class="modal-title">Notes · ' + esc(widgetScreenLabel()) + '</div>' +
      '  <div class="modal-sub">' + data.pub.length + ' published · ' + data.mine.length + ' yours</div>' +
      '</div><button class="modal-close" id="hcos-drawer-close">×</button></div>' +
      '<div class="drawer-body">';
    if (data.total === 0) {
      html += '<div class="empty-state"><div class="empty-icon">✎</div>' +
        'No notes on this screen yet.<br>Tap Feedback and be the first.</div>';
    } else {
      if (data.pub.length) {
        html += '<div class="seg-divider">Published — the shared board</div>';
        data.pub.forEach(function (n) { html += noteHTML(n, false); });
      }
      if (data.mine.length) {
        html += '<div class="seg-divider">Yours — saved in this browser</div>';
        data.mine.forEach(function (n) { html += noteHTML(n, true); });
      }
    }
    html += '<p style="font-size:11px;color:var(--muted);margin-top:16px">Published notes live in ' +
      '<code>feedback/notes.json</code>. Exported notes get merged there, ' +
      'so the whole team sees them on these screens.</p></div>';
    fbkDrawer.innerHTML = html;
    fbkDrawer.querySelector('#hcos-drawer-close').addEventListener('click', closeNotesDrawer);
    Array.prototype.forEach.call(fbkDrawer.querySelectorAll('[data-del-note]'), function (b) {
      b.addEventListener('click', function () { deleteNote(b.getAttribute('data-del-note')); });
    });
    fbkDrawer.classList.add('open');
    fbkOverlay.classList.add('open');
  }

  function closeNotesDrawer() {
    fbkDrawer.classList.remove('open');
    fbkOverlay.classList.remove('open');
  }

  function refreshFeedbackUI() {
    var sid = widgetScreenId();
    var data = notesFor(sid);
    if (fbkPanel) {
      var scrEl = fbkPanel.querySelector('#fbk-screen');
      if (scrEl) scrEl.value = widgetScreenLabel();
    }
    if (fbkBtn) {
      var count = fbkBtn.querySelector('.fbk-count');
      count.textContent = data.total;
      count.style.display = data.total > 0 ? 'inline-flex' : 'none';
    }
    if (fbkPin) {
      if (data.mine.length > 0) {
        fbkPin.style.display = 'block';
        fbkPin.textContent = '✎ ' + data.mine.length + ' note' + (data.mine.length > 1 ? 's' : '') + ' of yours here';
      } else {
        fbkPin.style.display = 'none';
      }
    }
    if (chipsNav) {
      Array.prototype.forEach.call(chipsNav.querySelectorAll('.chip'), function (c) {
        var id = c.getAttribute('data-screen');
        var n = notesFor(id).total;
        var badge = c.querySelector('.fbk-badge');
        if (n > 0) {
          if (!badge) { badge = el('span', 'fbk-badge'); c.appendChild(badge); }
          badge.textContent = n;
        } else if (badge) {
          c.removeChild(badge);
        }
      });
    }
  }

  /* ---------- published notes ---------- */
  function loadPublishedNotes() {
    /* fetch() fails on file:// — fall back to an empty board, no console error */
    try {
      fetch('feedback/notes.json')
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (json) {
          publishedNotes = Array.isArray(json) ? json : [];
          refreshFeedbackUI();
        })
        .catch(function () { publishedNotes = []; });
    } catch (e) { publishedNotes = []; }
  }

  /* ---------- generic helpers (modals, drawers, toasts, screen links) ---------- */
  function wireDelegation() {
    document.addEventListener('click', function (ev) {
      var t = ev.target.closest ? ev.target.closest('[data-open-modal],[data-close-modal],[data-open-drawer],[data-close-drawer],[data-activate]') : null;
      if (!t) return;
      var sel;
      if (t.hasAttribute('data-open-modal')) {
        sel = document.querySelector(t.getAttribute('data-open-modal'));
        if (sel) sel.classList.add('open');
      } else if (t.hasAttribute('data-close-modal')) {
        var ov = t.closest('.modal-overlay');
        if (ov) ov.classList.remove('open');
      } else if (t.hasAttribute('data-open-drawer')) {
        sel = document.querySelector(t.getAttribute('data-open-drawer'));
        if (sel) {
          sel.classList.add('open');
          var pair = document.querySelector('.drawer-overlay[data-close-drawer="' + t.getAttribute('data-open-drawer') + '"]');
          if (pair) pair.classList.add('open');
        }
      } else if (t.hasAttribute('data-close-drawer')) {
        sel = document.querySelector(t.getAttribute('data-close-drawer'));
        if (sel) sel.classList.remove('open');
        var ovl = t.classList.contains('drawer-overlay') ? t : t.closest('.drawer-overlay');
        if (ovl) ovl.classList.remove('open');
        else {
          var pair2 = document.querySelector('.drawer-overlay[data-close-drawer="' + t.getAttribute('data-close-drawer') + '"]');
          if (pair2) pair2.classList.remove('open');
        }
      } else if (t.hasAttribute('data-activate')) {
        ev.preventDefault();
        activate(t.getAttribute('data-activate'));
      }
    });
    /* ---- Nothing is dead. Anything clickable that has no explicit handler
       still behaves the way its label promises. ---- */
    document.addEventListener('click', function (ev) {
      var el = ev.target.closest ? ev.target.closest('button, .filter-chip, .modal-close, .kiosk-key, .status-step, .fb-palette-item, .fb-question') : null;
      if (!el || el.dataset.hcosHandled) return;
      /* leave anything with its own behaviour alone */
      if (el.hasAttribute('onclick') || el.hasAttribute('data-activate') ||
          el.hasAttribute('data-open-modal') || el.hasAttribute('data-close-modal') ||
          el.hasAttribute('data-open-drawer') || el.hasAttribute('data-close-drawer') ||
          el.hasAttribute('data-del-note') || el.hasAttribute('data-f') ||
          el.id.indexOf('fbk-') === 0 || el.closest('.fbk-panel')) return;

      var label = (el.textContent || '').trim();

      /* a close button closes what it sits in */
      if (el.classList.contains('modal-close')) {
        var ov = el.closest('.modal-overlay'); if (ov) { ov.classList.remove('open'); return; }
        var dr = el.closest('.drawer');
        if (dr) { dr.classList.remove('open'); var so = document.querySelector('.drawer-overlay.open'); if (so) so.classList.remove('open'); return; }
      }

      /* a filter chip selects — several per group when the group allows it */
      if (el.classList.contains('filter-chip') || el.classList.contains('status-step')) {
        var group = el.parentNode;
        var multi = el.classList.contains('multi') || group.querySelector('.filter-chip.multi');
        if (multi) { el.classList.toggle('active'); }
        else {
          Array.prototype.forEach.call(group.children, function (c) {
            if (c.classList && (c.classList.contains('filter-chip') || c.classList.contains('status-step'))) {
              c.classList.remove('active'); c.classList.remove('current');
            }
          });
          el.classList.add(el.classList.contains('status-step') ? 'current' : 'active');
        }
        if (label) toast(label + ' — showing that now.', 'ok');
        return;
      }

      /* a keypad key fills the next empty cell */
      if (el.classList.contains('kiosk-key')) {
        var cells = document.querySelectorAll('.kiosk-pin-cell');
        for (var i = 0; i < cells.length; i++) {
          if (!cells[i].textContent.trim()) { cells[i].textContent = label; return; }
        }
        return;
      }

      /* a palette or question in the builder selects */
      if (el.classList.contains('fb-palette-item') || el.classList.contains('fb-question')) {
        if (el.classList.contains('fb-question')) {
          Array.prototype.forEach.call(el.parentNode.children, function (c) {
            if (c.classList) c.classList.remove('selected');
          });
          el.classList.add('selected');
          toast('Editing “' + label.split('\n')[0].slice(0, 40) + '”.', 'ok');
        } else {
          toast('“' + label + '” added to the form. Drag it where you want it.', 'ok');
        }
        return;
      }

      /* the rest: do what the label says */
      var l = label.toLowerCase();
      if (/^(remove|delete|discard)\b/.test(l)) {
        var row = el.closest('tr, .act-row, .check-item, .lr-rule, .fb-question, li');
        if (row && row.parentNode) { row.parentNode.removeChild(row); toast('Removed.', 'ok'); return; }
      }
      if (!label) return;
      if (/^(edit|change|adjust)\b/.test(l))      { toast(label + ' — opened.', 'ok'); return; }
      if (/^(add|new|create)\b/.test(l))          { toast(label + ' — ready to fill in.', 'ok'); return; }
      if (/^(save|apply|publish|confirm)\b/.test(l)) { toast('Saved.', 'ok'); return; }
      if (/^(send|notify|flag|escalate)\b/.test(l)) { toast(label + ' — done, and the team was told.', 'ok'); return; }
      if (/^(open|view|see|review)\b/.test(l))    { toast(label + ' — opened.', 'ok'); return; }
      if (/^(export|download|print)\b/.test(l))   { toast(label + ' — file ready.', 'ok'); return; }
      toast(label + '.', 'ok');
    });

    /* click on modal backdrop closes it */
    document.addEventListener('click', function (ev) {
      if (ev.target.classList && ev.target.classList.contains('modal-overlay')) {
        ev.target.classList.remove('open');
      }
    });
  }

  function toast(msg, kind) {
    var c = document.querySelector('.toast-container');
    if (!c) { c = el('div', 'toast-container'); body.appendChild(c); }
    var t = el('div', 'toast' + (kind === 'ok' ? ' toast-ok' : kind === 'warn' ? ' toast-warn' : ''), esc(msg));
    c.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 4000);
  }

  /* ---------- boot ---------- */
  function boot() {
    buildShell();
    collectScreens();
    buildChips();
    buildWidget();
    wireDelegation();
    paintDeltas();
    wireKpis();
    applyDash();

    var initial = null;
    if (location.hash) {
      var hid = location.hash.replace(/^#\/?/, '');
      screens.forEach(function (s) { if (s.id === hid) initial = s.id; });
    }
    if (!initial && screens.length) {
      var pre = null;
      screens.forEach(function (s) { if (s.el.classList.contains('active')) pre = s.id; });
      initial = pre || screens[0].id;
    }
    if (initial) activate(initial, true);
    else refreshFeedbackUI();

    /* the browser's native #hash anchor-jump fights the screen switcher — undo it
       (only on screen pages; plain anchors like index.html#feedback must keep working) */
    if (screens.length) {
      requestAnimationFrame(function () { window.scrollTo(0, 0); });
      window.addEventListener('load', function () { window.scrollTo(0, 0); });
    }

    loadPublishedNotes();
  }

  window.HCOS = {
    toast: toast,
    activate: activate,
    modules: MODULES,
    openNotes: function () { openNotesDrawer(); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
