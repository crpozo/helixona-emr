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
    { name: 'Treatments & therapies', href: 'treatments.html', page: 'treatments' },
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
      ['Plan & orders', 'journey-plan.html'],
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
    search.setAttribute('aria-label', 'Search patients, claims and notes');
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

  /* ---------- review state: which screens the team has settled ----------
     Wireframe meta, kept beside the notes it belongs with. Stored per browser,
     exported with the notes so approvals travel the same way feedback does. */
  var APPR_KEY = 'hcos-approved-v1';
  function approvals() {
    try { return JSON.parse(localStorage.getItem(APPR_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveApprovals(a) {
    try { localStorage.setItem(APPR_KEY, JSON.stringify(a)); } catch (e) {}
  }
  function apprKey(id) { return PAGE + '/' + id; }
  /* A PUBLISHED approval is the team's, committed to the repo as
     data-approved="2026-08-12" on the section, and everyone sees it. The
     localStorage one is the individual reviewer's and stays in their browser.
     Carlos settles a screen for everybody; a reviewer settles it for himself. */
  function publishedAppr(id) {
    var s = document.getElementById(id);
    return s ? s.getAttribute('data-approved') : null;
  }
  function isApproved(id) { return !!approvals()[apprKey(id)] || !!publishedAppr(id); }

  function buildApprovalBar() {
    if (!screens.length) return;
    var bar = el('div', 'appr-bar');
    bar.id = 'hcos-appr-bar';
    bar.innerHTML =
      '<span class="appr-state"><i></i><span id="hcos-appr-word">Not reviewed yet</span></span>' +
      '<span class="appr-note" id="hcos-appr-note">Mark it approved when this screen needs no more changes.</span>' +
      '<span class="appr-count" id="hcos-appr-count"></span>' +
      '<button class="btn btn-sm appr-toggle" id="hcos-appr-btn" data-hcos-handled="1">Mark approved</button>';
    var canvas = document.querySelector('.canvas-inner');
    if (canvas) canvas.insertBefore(bar, canvas.firstChild);
    bar.querySelector('#hcos-appr-btn').addEventListener('click', function () {
      var id = currentScreen ? currentScreen.id : '';
      /* a published approval is the team's; a reviewer answers it with a note,
         not by quietly clearing it in their own browser */
      if (publishedAppr(id)) {
        if (fbkPanel) fbkPanel.classList.add('open');
        toast('This screen is settled. Tell us what you found and Carlos will reopen it.');
        return;
      }
      var a = approvals(), k = apprKey(id);
      if (a[k]) { delete a[k]; } else { a[k] = { at: new Date().toISOString().slice(0, 10) }; }
      saveApprovals(a);
      refreshApproval();
      toast(a[k] ? 'Approved. It shows a green tick in the screen row.'
                 : 'Approval removed — it is open for changes again.', 'ok');
    });
    refreshApproval();
  }

  function refreshApproval() {
    var bar = document.getElementById('hcos-appr-bar');
    if (!bar || !currentScreen) return;
    var a = approvals(), rec = a[apprKey(currentScreen.id)];
    var pub = publishedAppr(currentScreen.id);
    bar.classList.toggle('is-ok', !!rec || !!pub);
    document.getElementById('hcos-appr-word').textContent =
      pub ? 'Approved by the team' : (rec ? 'Approved' : 'Not reviewed yet');
    document.getElementById('hcos-appr-note').textContent = pub
      ? 'Settled ' + pub + '. If you still see a problem, leave a note — one reviewer does not reopen a team decision on their own.'
      : (rec ? 'Approved ' + rec.at + ' — no more changes needed on this screen.'
             : 'Mark it approved when this screen needs no more changes.');
    document.getElementById('hcos-appr-btn').textContent =
      pub ? 'Leave a note' : (rec ? 'Remove approval' : 'Mark approved');
    var done = 0;
    screens.forEach(function (sc) { if (a[apprKey(sc.id)] || publishedAppr(sc.id)) done++; });
    document.getElementById('hcos-appr-count').textContent =
      done + ' of ' + screens.length + ' screens on this page approved';
    if (chipsNav) {
      Array.prototype.forEach.call(chipsNav.querySelectorAll('.chip'), function (c) {
        var sid = c.getAttribute('data-screen');
        c.classList.toggle('is-ok', !!a[apprKey(sid)] || !!publishedAppr(sid));
      });
    }
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
    refreshApproval();
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
    /* The floating Feedback button is gone (Carlos, 2026-08-12). It sat bottom
       right, which is exactly where the page action bar's primary button now
       lives, and a permanent chrome button competing with Save is worse than no
       button. The WIDGET is still built and still works — the panel, the pins,
       the notes drawer, the export — it is only the floating launcher that is
       not rendered, so the collaboration loop is intact and can be given a new
       home whenever we pick one. HCOS.openFeedback() opens it from anywhere. */
    fbkBtn = el('button', 'fbk-btn');
    fbkBtn.innerHTML = '✎ Feedback <span class="fbk-count" style="display:none">0</span>';
    fbkBtn.addEventListener('click', function () { fbkPanel.classList.toggle('open'); });

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
      '    <input class="field-input" id="fbk-screen" aria-label="Screen this note belongs to" disabled></div>' +
      '  <div class="field"><label class="field-label">Type</label>' +
      '    <div class="fbk-types">' + typeChips + '</div></div>' +
      '  <div class="field"><label class="field-label">Note</label>' +
      '    <textarea class="field-textarea" id="fbk-text" aria-label="Your note" placeholder="What would make this screen better?"></textarea></div>' +
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
  /* ---------- keyboard parity ----------
     Anything clickable that is not a native control must also answer the
     keyboard. Done once here, so no page has to remember it. */
  var CLICKABLE = '[data-activate],[data-open-modal],[data-open-drawer],' +
                  '[data-close-modal],[data-close-drawer],[data-row-add],[data-row-del],' +
                  '.filter-chip,.chip,.status-step,.kiosk-key,.msel-opt,.o-kind-card,' +
                  '.lay-widget,.j-face,.stat-card[data-kpi],.dash-chip,.cal-appt,.monthcal-day[data-day]';

  function wireKeyboard(root) {
    var list = (root || document).querySelectorAll(CLICKABLE);
    Array.prototype.forEach.call(list, function (n) {
      var tag = n.tagName;
      if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' ||
          tag === 'SELECT' || tag === 'TEXTAREA' || tag === 'LABEL') return;
      if (n.hasAttribute('tabindex')) return;
      n.setAttribute('tabindex', '0');
      if (!n.hasAttribute('role')) n.setAttribute('role', 'button');
    });
  }

  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var t = ev.target;
    if (!t || !t.matches || !t.matches(CLICKABLE)) return;
    var tag = t.tagName;
    if (tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' ||
        tag === 'SELECT' || tag === 'TEXTAREA') return;
    ev.preventDefault();
    t.click();
  });

  function wireDelegation() {
    document.addEventListener('click', function (ev) {
      var t = ev.target.closest ? ev.target.closest('[data-open-modal],[data-close-modal],[data-open-drawer],[data-close-drawer],[data-activate]') : null;
      if (!t) return;
      var sel;
      if (t.hasAttribute('data-open-modal')) {
        sel = document.querySelector(t.getAttribute('data-open-modal'));
        if (sel) sel.classList.add('open');
      } else if (t.hasAttribute('data-close-modal')) {
        /* When data-close-modal sits on the OVERLAY it means "click the
           backdrop to dismiss" — but every click inside the modal bubbles up to
           it, so closest() found the overlay and the modal shut the moment you
           touched a select. Only a click on the backdrop ITSELF closes it.
           (Carlos, 2026-08-12: "it would close whenever I clicked on anything".) */
        if (t.classList.contains('modal-overlay') && ev.target !== t) return;
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
    /* ---- A button that says "added" has to add something, and one that says
       "removed" has to remove it. Declarative, so no page hand-rolls it. ---- */
    document.addEventListener('click', function (ev) {
      var el = ev.target.closest ? ev.target.closest('[data-row-add],[data-row-del]') : null;
      if (!el) return;

      if (el.hasAttribute('data-row-del')) {
        var row = el.closest('tr, .ob-card, .act-row, .check-item, .lr-rule, .b-sugg, .card-row, li');
        if (row && row.parentNode) row.parentNode.removeChild(row);
        return;
      }

      /* find the list this button belongs to */
      var scope = el.closest('.card, .screen') || document;
      var sel = el.getAttribute('data-row-add');
      var host = null;
      if (sel) {
        host = scope.querySelector(sel);
      } else {
        /* the list this button belongs to is the next one after it, not the first
           one on the screen — a page can hold several tables */
        var lists = Array.prototype.slice.call(scope.querySelectorAll('tbody, .ob-cards'));
        for (var i = 0; i < lists.length; i++) {
          if (el.compareDocumentPosition(lists[i]) & Node.DOCUMENT_POSITION_FOLLOWING) { host = lists[i]; break; }
        }
        if (!host) host = lists[lists.length - 1] || null;
      }
      if (!host || !host.lastElementChild) return;

      var clone = host.lastElementChild.cloneNode(true);
      /* blank it out — a new line is empty, not a copy of somebody else's data */
      var cells = clone.querySelectorAll('td, .ob-card-title, .ob-card-note, .act-name, .act-meta');
      Array.prototype.forEach.call(cells, function (c, i) {
        var keep = c.querySelector('button, select, input, textarea');
        if (keep) return;
        c.innerHTML = i === 0 ? '<em style="color:var(--muted)">New entry &mdash; fill this in</em>'
                              : '<span style="color:var(--line)">&mdash;</span>';
      });
      var pill = clone.querySelector('.pill, .appr, .clin-state');
      if (pill) { pill.className = 'appr draft'; pill.textContent = 'Draft'; }
      clone.setAttribute('data-row-new', '1');
      host.appendChild(clone);
      wireKeyboard(clone);
      clone.scrollIntoView({ block: 'nearest' });
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
    buildApprovalBar();
    wireDelegation();
    wireKeyboard();
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

    /* Links like href="page.html#/screen-id" clicked while already on that page
       only change the hash — listen, so they switch screens like everything else. */
    window.addEventListener('hashchange', function () {
      var hid = location.hash.replace(/^#\/?/, '');
      if (!hid || (currentScreen && currentScreen.id === hid)) return;
      activate(hid);
    });

    /* the browser's native #hash anchor-jump fights the screen switcher — undo it
       (only on screen pages; plain anchors like index.html#feedback must keep working) */
    if (screens.length) {
      requestAnimationFrame(function () { window.scrollTo(0, 0); });
      window.addEventListener('load', function () { window.scrollTo(0, 0); });
    }

    loadPublishedNotes();
    /* Tables get their grips and their scroll hints after the shell exists, so
       there are real widths to freeze. NOT on requestAnimationFrame alone:
       rAF does not fire in a hidden tab, so a page opened in the background had
       no resizable columns and no overflow warning until somebody looked at it,
       and then still did not. Run now, run again when the page is shown. */
    wireTables();
    window.addEventListener('load', wireTables);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) wireTables();
    });
  }


  /* ---------- CONFIRM BEFORE SOMETHING IRREVERSIBLE ----------
     Carlos, 2026-08-12: "if I click delete should a popup, are you sure?" — and
     he is right. It was a two-press toast, which is easy to miss entirely and
     easy to arm by accident. A destructive action gets a dialog that STOPS you,
     names the thing, and says what breaks.

     Three rules the dialog keeps:
       · Cancel is the default and holds focus, so Enter is always the safe key.
       · The body says the CONSEQUENCE, not "this cannot be undone" — the desk
         needs to know that 34 appointments lose a warning, not that deletion
         is permanent, which they already assume.
       · The destructive button says what it does ("Delete the flag type"),
         never "OK". A button labelled OK tells you nothing about what you are
         agreeing to.  */

  /* ---------- RESIZABLE COLUMNS ----------
     Carlos, 2026-08-12: "make columns customizable in width to read better".
     The waitlist has eleven columns and the reason a patient is urgent is the
     one that matters most — it should not be the one squeezed to two words
     because "Doctor wants them seen" is a long heading.

     Two things this deliberately does NOT do:
       · It does not switch the table to a fixed layout up front. The automatic
         widths are a good default; the first drag FREEZES what is on screen and
         goes from there, so nothing moves until somebody asks it to.
       · It does not let a column go under 60px. A column dragged to nothing is
         a column you cannot find again to drag back.
     Widths are per browser, per table, and a double-click on any grip puts the
     whole table back to automatic. */
  var COL_KEY = 'hcos-cols-v1';
  function colStore() {
    try { return JSON.parse(localStorage.getItem(COL_KEY) || '{}'); } catch (e) { return {}; }
  }
  function colSave(id, widths) {
    var all = colStore();
    if (widths) all[id] = widths; else delete all[id];
    try { localStorage.setItem(COL_KEY, JSON.stringify(all)); } catch (e) {}
  }
  function tableId(tbl, i) {
    var sc = tbl.closest ? tbl.closest('.screen') : null;
    return PAGE + '/' + (sc && sc.id ? sc.id : 'main') + '/' + i;
  }
  function colFreeze(tbl) {
    if (tbl.dataset.colsFrozen) return;
    var ths = tbl.querySelectorAll('thead th');
    var w = [].map.call(ths, function (th) { return th.getBoundingClientRect().width; });
    tbl.style.tableLayout = 'fixed';
    tbl.style.width = tbl.getBoundingClientRect().width + 'px';
    [].forEach.call(ths, function (th, i) { th.style.width = Math.round(w[i]) + 'px'; });
    tbl.dataset.colsFrozen = '1';
  }
  function colApply(tbl, widths) {
    if (!widths || !widths.length) return;
    colFreeze(tbl);
    var ths = tbl.querySelectorAll('thead th');
    widths.forEach(function (v, i) { if (ths[i] && v) ths[i].style.width = v + 'px'; });
    var total = widths.reduce(function (a, b) { return a + (b || 0); }, 0);
    if (total) tbl.style.width = total + 'px';
  }
  function colWidths(tbl) {
    return [].map.call(tbl.querySelectorAll('thead th'), function (th) {
      return Math.round(th.getBoundingClientRect().width);
    });
  }
  function colReset(tbl, id) {
    [].forEach.call(tbl.querySelectorAll('thead th'), function (th) { th.style.width = ''; });
    tbl.style.tableLayout = '';
    tbl.style.width = '';
    delete tbl.dataset.colsFrozen;
    colSave(id, null);
    toast('Column widths reset — back to automatic.', 'ok');
  }
  function wireColumns(root) {
    var tables = (root || document).querySelectorAll('table.tbl');
    [].forEach.call(tables, function (tbl, ti) {
      if (tbl.dataset.colsWired) return;
      tbl.dataset.colsWired = '1';
      var id = tableId(tbl, ti);
      var ths = tbl.querySelectorAll('thead th');
      if (ths.length < 2) return;
      var saved = colStore()[id];
      if (saved) colApply(tbl, saved);

      [].forEach.call(ths, function (th, i) {
        if (i === ths.length - 1) return;      /* the last column takes the slack */
        th.classList.add('col-sizable');
        var g = el('span', 'col-grip');
        g.setAttribute('role', 'separator');
        g.setAttribute('tabindex', '0');
        g.setAttribute('aria-orientation', 'vertical');
        g.setAttribute('aria-label', 'Resize this column. Arrow keys adjust, double-click resets every column.');
        g.title = 'Drag to resize · double-click to reset';
        th.appendChild(g);

        function nudge(dx) {
          colFreeze(tbl);
          var w = Math.max(60, th.getBoundingClientRect().width + dx);
          th.style.width = Math.round(w) + 'px';
          tbl.style.width = colWidths(tbl).reduce(function (a, b) { return a + b; }, 0) + 'px';
        }
        g.addEventListener('pointerdown', function (ev) {
          ev.preventDefault();
          colFreeze(tbl);
          var x0 = ev.clientX, w0 = th.getBoundingClientRect().width;
          document.body.classList.add('col-resizing');
          g.setPointerCapture(ev.pointerId);
          function move(e) {
            var w = Math.max(60, w0 + (e.clientX - x0));
            th.style.width = Math.round(w) + 'px';
            tbl.style.width = colWidths(tbl).reduce(function (a, b) { return a + b; }, 0) + 'px';
          }
          function up() {
            g.removeEventListener('pointermove', move);
            g.removeEventListener('pointerup', up);
            document.body.classList.remove('col-resizing');
            colSave(id, colWidths(tbl));
          }
          g.addEventListener('pointermove', move);
          g.addEventListener('pointerup', up);
        });
        g.addEventListener('dblclick', function (ev) { ev.preventDefault(); colReset(tbl, id); });
        g.addEventListener('keydown', function (ev) {
          var step = ev.shiftKey ? 40 : 12;
          if (ev.key === 'ArrowRight') { ev.preventDefault(); nudge(step); colSave(id, colWidths(tbl)); }
          else if (ev.key === 'ArrowLeft') { ev.preventDefault(); nudge(-step); colSave(id, colWidths(tbl)); }
          else if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); colReset(tbl, id); }
        });
      });
    });
  }


  /* ==========================================================================
     SHARED VOCABULARY (Carlos, 2026-08-12: "we cannot invent every nomenclature
     each time"). Resources, hours, days and frequency were written out by hand
     on every screen, so the same chair was "IV 1 · Nick · Nurse" in one place
     and "IV 1 (Nick)" in another, and a room read exactly like a doctor.

     A ROOM IS NOT A DOCTOR. Every resource carries a KIND, and the kind is
     shown, so the desk never has to know from memory that "Room 2" is a place
     and "Brooke" is a person.
     ========================================================================== */
  var RESOURCE_KINDS = ['Provider', 'IV chair', 'Room', 'Equipment'];
  var RESOURCES = [
    { id: 'dr',    kind: 'Provider',  name: 'Dr. Drannikov', sub: 'Physician' },
    { id: 'bak',   kind: 'Provider',  name: 'Dr. Bakman',    sub: 'Physician' },
    { id: 'bro',   kind: 'Provider',  name: 'Brooke',        sub: 'Physician Associate' },
    { id: 'c1',    kind: 'IV chair',  name: 'IV 1',          sub: 'Nick · Nurse' },
    { id: 'c2',    kind: 'IV chair',  name: 'IV 2',          sub: 'Bea · Medic' },
    { id: 'c3',    kind: 'IV chair',  name: 'IV 3',          sub: 'Juan · Medic' },
    { id: 'c4',    kind: 'IV chair',  name: 'IV 4',          sub: 'Nate · Medic' },
    { id: 'room1', kind: 'Room',      name: 'Room 1',        sub: 'Exam' },
    { id: 'room2', kind: 'Room',      name: 'Room 2',        sub: 'Procedures' },
    { id: 'eboo',  kind: 'Equipment', name: 'EBOO circuit',  sub: 'One only' },
    { id: 'laser', kind: 'Equipment', name: 'Laser',         sub: 'Erchonia' }
  ];
  function resourceById(id) {
    for (var i = 0; i < RESOURCES.length; i++) if (RESOURCES[i].id === id) return RESOURCES[i];
    return null;
  }
  /* "Provider · Dr. Drannikov", never a bare name */
  function resourceLabel(id, withSub) {
    var r = resourceById(id);
    if (!r) return id || '';
    return r.kind + ' · ' + r.name + (withSub && r.sub ? ' (' + r.sub + ')' : '');
  }
  /* options grouped BY KIND, so the list itself teaches the difference */
  function resourceOptions(opt) {
    opt = opt || {};
    var out = opt.all === false ? '' :
      '<option value="">' + (opt.allLabel || 'Every resource') + '</option>';
    RESOURCE_KINDS.forEach(function (k) {
      var list = RESOURCES.filter(function (r) { return r.kind === k; });
      if (!list.length) return;
      out += '<optgroup label="' + k + '">';
      if (opt.groupAll !== false) {
        out += '<option value="kind:' + k + '">Every ' + k.toLowerCase() + '</option>';
      }
      list.forEach(function (r) {
        out += '<option value="' + r.id + '"' + (opt.selected === r.id ? ' selected' : '') + '>'
             + r.name + (r.sub ? ' · ' + r.sub : '') + '</option>';
      });
      out += '</optgroup>';
    });
    return out;
  }
  /* a multi-select list of resources, grouped the same way */
  function resourceChecks(name) {
    var out = '';
    RESOURCE_KINDS.forEach(function (k) {
      var list = RESOURCES.filter(function (r) { return r.kind === k; });
      if (!list.length) return;
      out += '<div class="msel-group">' + k + '</div>';
      list.forEach(function (r) {
        out += '<label class="msel-opt" data-res="' + r.id + '">'
             + '<input type="checkbox" name="' + (name || 'res') + '" value="' + r.id + '" '
             + 'aria-label="' + r.name + '">' + r.name
             + (r.sub ? ' <span class="msel-sub">' + r.sub + '</span>' : '') + '</label>';
      });
    });
    return out;
  }

  /* Every half hour the clinic could conceivably run, not the four somebody
     happened to type. The default range is the clinic day; a screen that needs
     the whole 24 hours asks for it. */
  function hourOptions(o) {
    o = o || {};
    var from = o.from === undefined ? 6 : o.from;
    var to   = o.to   === undefined ? 20 : o.to;
    var step = o.step || 30;
    var out = '';
    for (var m = from * 60; m <= to * 60; m += step) {
      var h = Math.floor(m / 60) % 24, mm = m % 60;
      var ampm = h < 12 ? 'AM' : 'PM';
      var hh = h % 12 === 0 ? 12 : h % 12;
      var label = hh + ':' + (mm < 10 ? '0' + mm : mm) + ' ' + ampm;
      out += '<option value="' + m + '"' + (o.selected === m ? ' selected' : '') + '>'
           + label + '</option>';
    }
    return out;
  }

  /* ONE vocabulary for days and for how often, everywhere. The clinic opens at
     the weekend, so Saturday and Sunday are not an afterthought. */
  var DAYS = [['mon','Mon','Monday'], ['tue','Tue','Tuesday'], ['wed','Wed','Wednesday'],
              ['thu','Thu','Thursday'], ['fri','Fri','Friday'], ['sat','Sat','Saturday'],
              ['sun','Sun','Sunday']];
  var FREQ = [['once','Just once'], ['daily','Daily'], ['weekly','Weekly'],
              ['fortnightly','Every two weeks'], ['monthly','Monthly — same weekday'],
              ['forever','Every week, no end date']];
  function dayChips(on) {
    on = on || ['mon','tue','wed','thu','fri'];
    return DAYS.map(function (d) {
      return '<button class="filter-chip multi' + (on.indexOf(d[0]) !== -1 ? ' active' : '') + '" '
           + 'type="button" data-day="' + d[0] + '" aria-label="' + d[2] + '">' + d[1] + '</button>';
    }).join('');
  }
  function freqOptions(sel) {
    return FREQ.map(function (f) {
      return '<option value="' + f[0] + '"' + (f[0] === sel ? ' selected' : '') + '>' + f[1] + '</option>';
    }).join('');
  }


  /* A table that overflows silently is a table whose last three columns do not
     exist as far as the reader is concerned. Every .tbl-wrap says which way it
     has more, and how many columns are off-screen. */
  /* one entry point, safe to call as often as you like — both wirers mark what
     they have already done */
  function wireTables() {
    try { wireColumns(); } catch (e) {}
    try { wireScrollHints(); } catch (e) {}
    setTimeout(function () { try { wireScrollHints(); } catch (e) {} }, 300);
  }

  function wireScrollHints(root) {
    var wraps = (root || document).querySelectorAll('.tbl-wrap');
    [].forEach.call(wraps, function (w) {
      if (w.dataset.hintWired) return;
      w.dataset.hintWired = '1';
      var hint = el('div', 'scroll-hint');
      hint.innerHTML = '<span>&#8596;</span><span class="scroll-hint-t"></span>';
      if (w.parentNode) w.parentNode.insertBefore(hint, w.nextSibling);
      function paint() {
        var more = w.scrollWidth - w.clientWidth;
        var right = more - w.scrollLeft > 2, left = w.scrollLeft > 2;
        w.classList.toggle('has-more-right', right);
        w.classList.toggle('has-more-left', left);
        var t = hint.querySelector('.scroll-hint-t');
        if (!more) { t.textContent = ''; return; }
        var hidden = [].filter.call(w.querySelectorAll('thead th'), function (th) {
          var r = th.getBoundingClientRect(), b = w.getBoundingClientRect();
          return r.right > b.right + 2 || r.left < b.left - 2;
        }).length;
        t.innerHTML = hidden
          ? '<b>' + hidden + ' more column' + (hidden === 1 ? '' : 's') + '</b> off to the '
            + (right ? 'right' : 'left') + ' — scroll sideways, or drag a header edge to make room'
          : 'Scroll sideways for the rest';
      }
      w.addEventListener('scroll', paint);
      window.addEventListener('resize', paint);
      requestAnimationFrame(paint);
      setTimeout(paint, 240);
    });
  }


  /* ONE WORDING FOR "I'll pick the dates myself" (Carlos, 2026-08-13).
     It had drifted into four: "Custom range…", "A range…", "A date…" and a bare
     "Custom…". Every dropdown that lets somebody choose their own dates says
     CUSTOM RANGE, whether they are picking both ends or just the far one — the
     other end is always on the screen beside it, so it is still a range.

     A recurrence pattern is NOT a date and does not get this word: that list is
     FREQ, above, and "Custom…" on it was the same mistake wearing a different
     hat. */
  var CUSTOM_RANGE = 'Custom range…';
  var PERIODS_BACK = [['30', 'Last 30 days'], ['90', 'Last 90 days'],
                      ['180', 'Last 6 months'], ['365', 'Last 12 months']];
  var PERIODS_FWD  = [['7', 'Next 7 days'], ['14', 'Next 2 weeks'],
                      ['28', 'Next 4 weeks'], ['90', 'Next 3 months']];
  function periodOptions(o) {
    o = o || {};
    var list = (o.direction === 'forward' ? PERIODS_FWD : PERIODS_BACK).slice();
    var out = list.map(function (p) {
      return '<option value="' + p[0] + '"' + (p[0] === String(o.selected) ? ' selected' : '') + '>'
           + p[1] + '</option>';
    }).join('');
    if (o.custom !== false) {
      out += '<option value="custom"' + (o.selected === 'custom' ? ' selected' : '') + '>'
           + CUSTOM_RANGE + '</option>';
    }
    return out;
  }

  var confirmEl = null;
  function buildConfirm() {
    confirmEl = el('div', 'modal-overlay confirm-overlay');
    confirmEl.id = 'hcos-confirm';
    confirmEl.innerHTML =
      '<div class="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="hcos-confirm-t">' +
        '<div class="modal-head"><div class="modal-title" id="hcos-confirm-t"></div></div>' +
        '<div class="modal-body"><div class="confirm-body" id="hcos-confirm-b"></div>' +
          '<div class="confirm-what" id="hcos-confirm-w"></div></div>' +
        '<div class="modal-foot">' +
          '<button class="btn" id="hcos-confirm-no" data-hcos-handled="1">Cancel</button>' +
          '<button class="btn btn-danger" id="hcos-confirm-yes" data-hcos-handled="1"></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(confirmEl);
    confirmEl.addEventListener('click', function (ev) {
      if (ev.target === confirmEl) closeConfirm();
    });
    document.getElementById('hcos-confirm-no').addEventListener('click', closeConfirm);
  }
  function closeConfirm() {
    if (confirmEl) confirmEl.classList.remove('open');
  }
  function confirmAction(o) {
    if (!confirmEl) buildConfirm();
    o = o || {};
    document.getElementById('hcos-confirm-t').textContent = o.title || 'Are you sure?';
    document.getElementById('hcos-confirm-b').innerHTML = o.body || '';
    var w = document.getElementById('hcos-confirm-w');
    w.innerHTML = o.consequence || '';
    w.style.display = o.consequence ? '' : 'none';
    var yes = document.getElementById('hcos-confirm-yes');
    yes.textContent = o.confirm || 'Delete it';
    var fresh = yes.cloneNode(true);          /* drop the previous handler */
    yes.parentNode.replaceChild(fresh, yes);
    fresh.addEventListener('click', function () {
      closeConfirm();
      if (typeof o.onConfirm === 'function') o.onConfirm();
    });
    confirmEl.classList.add('open');
    /* Cancel holds focus: Enter is always the safe key */
    setTimeout(function () { document.getElementById('hcos-confirm-no').focus(); }, 30);
  }
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && confirmEl && confirmEl.classList.contains('open')) closeConfirm();
  });

  window.HCOS = {
    toast: toast,
    activate: activate,
    modules: MODULES,
    openNotes: function () { openNotesDrawer(); },
    confirm: confirmAction,
    wireColumns: wireColumns, wireScrollHints: wireScrollHints, wireTables: wireTables,
    openFeedback: function () { if (fbkPanel) fbkPanel.classList.add('open'); },
    RESOURCES: RESOURCES, RESOURCE_KINDS: RESOURCE_KINDS, DAYS: DAYS, FREQ: FREQ,
    resourceById: resourceById, resourceLabel: resourceLabel,
    resourceOptions: resourceOptions, resourceChecks: resourceChecks,
    hourOptions: hourOptions, dayChips: dayChips, freqOptions: freqOptions,
    CUSTOM_RANGE: CUSTOM_RANGE, periodOptions: periodOptions
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
