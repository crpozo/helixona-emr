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

  var FEEDBACK_EMAIL = 'crpozo95@gmail.com';
  var LS_NOTES = 'hcos.notes.v1';
  var LS_NAME = 'hcos.name';

  /* The 12-module map — single source for sidebar, statuses, and hub links */
  var MODULES = [
    { group: 'Daily work' },
    { num: 'L', name: 'Scheduling', href: 'schedule.html', page: 'schedule', status: 'wireframed' },
    { num: '·', name: 'Patients', href: 'patients.html', page: 'patients', status: 'wireframed' },
    { num: 'B', name: 'Clinical documentation', href: 'clinical.html', page: 'clinical', status: 'wireframed' },
    { num: 'D', name: 'Billing / RCM', href: 'billing.html', page: 'billing', status: 'wireframed' },
    { num: 'A', name: 'Intake & onboarding', href: 'intake.html', page: 'intake', status: 'wireframed' },
    { group: 'Modules' },
    { num: 'C', name: 'Diagnostics & lab', href: 'labs.html', page: 'labs', status: 'inprogress' },
    { num: 'E', name: 'Patient communication', href: 'communication.html', page: 'communication', status: 'inprogress' },
    { num: 'H', name: 'Pharmacy & medication', href: 'pharmacy.html', page: 'pharmacy', status: 'inprogress' },
    { num: 'I', name: 'Readiness engine', href: 'readiness.html', page: 'readiness', status: 'inprogress' },
    { num: 'J', name: 'Patient journey', href: 'journey.html', page: 'journey', status: 'inprogress' },
    { num: 'K', name: 'Caregiver portal', href: 'caregiver.html', page: 'caregiver', status: 'inprogress' },
    { num: 'F', name: 'Reporting & admin', href: 'reporting.html', page: 'reporting', status: 'inprogress' },
    { num: 'G', name: 'Security & compliance', href: 'security.html', page: 'security', status: 'inprogress' }
  ];

  /* The team — feedback dropdown (real users; see CLAUDE.md roster) */
  var TEAM = [
    'Tom Bakman — Leadership / RCM oversight',
    'Dr. Drannikov — Provider',
    'Dr. Bakman — Provider',
    'Brooke — Physician Associate',
    'Marie — New Patient Advisor',
    'Bee — PCC',
    'Yazmin — Front Desk',
    'Haylee — Front Desk',
    'Charlene — Medical Assistant (Virtual)',
    'Wesley — Medical Assistant',
    'Bea — Medic',
    'Juan — Medic',
    'Nate — Medic',
    'Nick — Nurse',
    'Kyle — Technician',
    'Karina — Operations Manager',
    'Shibani — Admin',
    'Vignesh — Billing (AnnexMed)',
    'Kamalesh — Billing (AnnexMed)',
    'Carlos — Technical lead',
    'Other'
  ];

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
      '<a href="index.html"><div class="brand-title">Helixona · HCOS</div>' +
      '<div class="brand-sub">Wireframe — the whole team shapes it</div></a>');
    sb.appendChild(brand);
    MODULES.forEach(function (m) {
      if (m.group) { sb.appendChild(el('div', 'nav-group', esc(m.group))); return; }
      var a = el('a', 'nav-item' + (m.page === PAGE ? ' active' : ''));
      a.href = m.href;
      a.innerHTML = '<span class="nav-num">' + esc(m.num) + '</span><span>' + esc(m.name) + '</span>' +
        '<span class="nav-status ' + m.status + '" title="' + m.status + '"></span>';
      sb.appendChild(a);
    });
    var foot = el('div', 'sidebar-foot',
      '<a href="login.html">Sign-in screens</a> · <a href="index.html#feedback">How feedback works</a>' +
      '<br>HCOS wireframe v0.1 · Helixona, Inc.');
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
    var notesBtn = el('button', 'btn btn-sm', 'Notes on this screen');
    notesBtn.id = 'hcos-notes-btn';
    notesBtn.addEventListener('click', function () { openNotesDrawer(); });
    right.appendChild(notesBtn);
    right.appendChild(el('span', 'wf-tag', 'Wireframe — give feedback'));
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
      topScreenEl.innerHTML = esc(target.title) + ' · <code>' + esc(PAGE + '/' + target.id) + '</code>';
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
    var typeChips = TEAMLESS_TYPES.map(function (t) {
      return '<button type="button" class="fbk-type' + (t === 'Idea' ? ' active' : '') + '" data-type="' + t + '">' + t + '</button>';
    }).join('');
    var nameOpts = '<option value="">Who are you?</option>' + TEAM.map(function (t) {
      return '<option>' + esc(t) + '</option>';
    }).join('');
    fbkPanel.innerHTML =
      '<div class="fbk-panel-head">' +
      '  <div class="fbk-panel-title">Leave a note on this screen</div>' +
      '  <div class="fbk-panel-sub">Ideas, problems, questions — everything shapes the build.</div>' +
      '</div>' +
      '<div class="fbk-panel-body">' +
      '  <div class="field"><label class="field-label">Name</label>' +
      '    <select class="field-select" id="fbk-name">' + nameOpts + '</select></div>' +
      '  <div class="field"><label class="field-label">Screen</label>' +
      '    <input class="field-input" id="fbk-screen" disabled></div>' +
      '  <div class="field"><label class="field-label">Type</label>' +
      '    <div class="fbk-types">' + typeChips + '</div></div>' +
      '  <div class="field"><label class="field-label">Note</label>' +
      '    <textarea class="field-textarea" id="fbk-text" placeholder="What would make this screen better?"></textarea></div>' +
      '  <div class="fbk-actions">' +
      '    <button class="btn btn-primary" id="fbk-save">Save note</button>' +
      '    <button class="btn" id="fbk-send">Send to Carlos</button>' +
      '  </div>' +
      '</div>' +
      '<div class="fbk-panel-foot">' +
      '  <button id="fbk-export">Export my notes</button>' +
      '  <button id="fbk-view">View notes on this screen</button>' +
      '</div>';
    body.appendChild(fbkPanel);

    var nameSel = fbkPanel.querySelector('#fbk-name');
    try { var saved = localStorage.getItem(LS_NAME); if (saved) nameSel.value = saved; } catch (e) {}
    nameSel.addEventListener('change', function () {
      try { localStorage.setItem(LS_NAME, nameSel.value); } catch (e) {}
    });

    Array.prototype.forEach.call(fbkPanel.querySelectorAll('.fbk-type'), function (b) {
      b.addEventListener('click', function () {
        fbkType = b.getAttribute('data-type');
        Array.prototype.forEach.call(fbkPanel.querySelectorAll('.fbk-type'), function (x) {
          x.classList.toggle('active', x === b);
        });
      });
    });

    fbkPanel.querySelector('#fbk-save').addEventListener('click', function () { saveNote(false); });
    fbkPanel.querySelector('#fbk-send').addEventListener('click', function () { saveNote(true); });
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

  var TEAMLESS_TYPES = ['Idea', 'Problem', 'Question', 'Approved'];

  function saveNote(sendMail) {
    var name = fbkPanel.querySelector('#fbk-name').value;
    var text = fbkPanel.querySelector('#fbk-text').value.trim();
    if (!name) { HCOS.toast('Pick your name first — the dropdown at the top of the panel.', 'warn'); return; }
    if (!text) { HCOS.toast('Write the note first — even one line helps.', 'warn'); return; }
    var note = {
      id: 'n-' + Date.now(),
      page: PAGE,
      screen: widgetScreenId(),
      name: name.split('—')[0].trim(),
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
    if (sendMail) {
      var subject = '[HCOS Wireframe] ' + widgetScreenLabel() + ' — ' + note.name;
      var mailBody = note.type + ': ' + note.text + '\n\n—\nScreen: ' + widgetScreenLabel() +
        '\nDate: ' + note.date + '\nSent from the HCOS wireframe feedback widget.';
      window.location.href = 'mailto:' + FEEDBACK_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(mailBody);
      HCOS.toast('Saved here and opened an email to Carlos — press send there.', 'ok');
    } else {
      HCOS.toast('Saved in this browser. Use “Send to Carlos” so it reaches the shared board.', 'ok');
    }
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
    HCOS.toast('Downloaded hcos-notes.json — attach it in an email or PR.', 'ok');
  }

  function noteHTML(n, mine) {
    var typeCls = (n.type || 'idea').toLowerCase();
    return '<div class="fbk-note' + (mine ? ' mine' : '') + '">' +
      '<div class="fbk-note-head">' +
      '  <span class="fbk-note-name">' + esc(n.name || '?') + '</span>' +
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
        html += '<div class="seg-divider">Yours — send them to Carlos to publish</div>';
        data.mine.forEach(function (n) { html += noteHTML(n, true); });
      }
    }
    html += '<p style="font-size:11px;color:var(--muted);margin-top:16px">Published notes live in ' +
      '<code>feedback/notes.json</code>. Emailed and exported notes get merged there by Carlos, ' +
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
    team: TEAM,
    openNotes: function () { openNotesDrawer(); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
