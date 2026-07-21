# WIREFRAME_GUIDE.md — how every page of this wireframe is built

Read CLAUDE.md first for domain truth. This file is the *mechanical* contract: the page
skeleton, the shared runtime, the component vocabulary, and the validation gate. Every page
in this repo follows it exactly — that is what makes the site feel like one product.

## Page skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Scheduling · HCOS Wireframe</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/hcos.css">
</head>
<body data-page="schedule" data-page-title="Scheduling" data-shell="app">

  <div class="screens">
    <section class="screen" id="l-01-day" data-title="Day view">
      …screen content…
    </section>
    <section class="screen" id="l-02-week" data-title="Week view">
      …
    </section>
  </div>

  <!-- page-local modals/drawers/scripts go here, OUTSIDE .screens -->

  <script src="assets/hcos.js"></script>
  <!-- optional tiny inline <script> AFTER hcos.js; may use window.HCOS -->
</body>
</html>
```

`assets/hcos.js` does the rest at load time: it wraps `.screens` in the app shell
(navy sidebar 216px + topbar + screen chips), builds one chip per `.screen` from its
`data-title`, wires switching + `#hash` routing, injects the **feedback widget** on every
page, and loads `feedback/notes.json` (with a silent fallback on `file://`).

### body attributes

| attribute | values | meaning |
|---|---|---|
| `data-page` | `schedule`, `patients`, … | must match the filename stem; used in note routing and sidebar active state |
| `data-page-title` | `Scheduling` | shown in the topbar |
| `data-shell` | `app` (default) · `bare` (slim top strip, no sidebar — login) · `none` (page owns layout — hub) | |
| `data-screen` | e.g. `hub` | only for `data-shell="none"` pages with no `.screen` sections |

### Screen ids

Kebab case, prefixed by module letter: `l-01-day`, `b-02-infusion`, `d-01-worklist`,
`a-03-kiosk`… Patients uses `pt-`, login uses `auth-`. Ids must be unique across the
whole site (they are feedback anchors — a note pins to `page/screen-id` forever).

2–5 screens per page. High level means representative, never exhaustive.

## Every screen starts with a descriptor

```html
<div class="screen-descriptor">
  <div class="descriptor-eyebrow">L-01 · Day view</div>
  <div class="descriptor-title">The clinic day at a glance</div>
  <div class="descriptor-body">One or two sentences: what this screen is and the decision it helps make.</div>
  <div class="descriptor-meta">
    <span class="meta-item"><strong>Primary users</strong> Yazmin · Haylee (Front Desk)</span>
    <span class="meta-item"><strong>Replaces in eCW</strong> <span class="fixes-ecw">separate per-provider views</span></span>
  </div>
</div>
```

When a screen visibly fixes one of the "why eCW loses" items, say so in the descriptor —
that is the argument for the whole project.

Below the descriptor, the actual mock lives inside a `.frame` (browser-style container):

```html
<div class="frame">
  <div class="frame-titlebar"><span class="frame-dot"></span><span class="frame-dot"></span><span class="frame-dot"></span>
    <span class="frame-url">hcos.helixona.com/schedule</span></div>
  <div class="frame-body"> …the screen mock… </div>
</div>
```

Use `frame-body tight` (no padding) for full-bleed content like the calendar. Screens that
are patient-facing use `.phone-frame` (mobile) or `.kiosk-frame` instead of `.frame`.

## Component vocabulary (assets/hcos.css — reuse, never reinvent)

- **Layout**: `grid-2` `grid-3` `grid-4` `grid-sidebar` · `card` (+`card-title`) · `stat-card`+`stat-num`+`stat-lbl` · `seg-divider` · `empty-state` · `kv` (definition grid)
- **App chrome inside a frame**: `app-header` `app-logo` `app-user` `avatar` · `page-title` `page-sub`
- **Buttons**: `btn` + `btn-primary` `btn-accent` `btn-navy` `btn-danger` `btn-ghost` `btn-sm` `btn-lg`
- **Pills**: `pill` + `pill-ok` `pill-warn` `pill-err` `pill-muted` `pill-navy` · status pills `pill-st st-scheduled|st-confirmed|st-arrived|st-inroom|st-inchair|st-done|st-noshow|st-cancelled` · network `net-badge net-inn|net-oon|net-self`
- **Tables**: `tbl` inside `tbl-wrap`
- **Forms**: `field` `field-label` `field-input` `field-select` `field-textarea` `field-row` `field-help` `field-error` · `filters` `filter-chip` `search-input`
- **Callouts**: `callout` + `callout-warn` `callout-err` `callout-ok`
- **Flow bits**: `timeline`/`timeline-item` · `check-list`/`check-item`+`check-icon done|pending|active|blocked` · `status-flow`/`status-step`(+`current`,`past`)/`status-arrow`
- **Overlays**: `modal-overlay`>`modal`(+`modal-wide`) with `modal-head/-title/-sub/-close/-body/-foot` · `drawer-overlay`+`drawer` · toasts via `HCOS.toast(msg, 'ok'|'warn')`
- **Calendar (Module L + anywhere a calendar appears)**: `cal` `cal-toolbar` `cal-nav` `cal-date` `cal-views` · day: `daycal-head` `daycal-band` `daycal-band-spacer` `daycal-col-head` `daycal-grid` `daycal-hours` `daycal-hour` `daycal-col` `daycal-slot` · `cal-now`+`cal-now-label` · `cal-appt` (+`st-*` status class, children `cal-appt-time/-name/-type`) · `conflict` · week: `weekcal-*`, `week-appt` · `cal-legend`
- **Specialty**: `kiosk-frame` `kiosk-title` `kiosk-sub` `kiosk-btn` `kiosk-pin`/`kiosk-pin-cell` · `phone-frame` `phone-bar` `phone-body` · `msg-preview` (email) `msg-header` `msg-body` `msg-cta` `msg-foot` · `sms-bubble`(+`out`) · form builder `fb-shell` `fb-palette` `fb-palette-item` `fb-canvas` `fb-question`(+`selected`) `fb-inspector` · `public-hero` `public-h1` `public-lede`

Interactive helpers (no custom JS needed):
`data-open-modal="#id"` · `data-close-modal` · `data-open-drawer="#id"` ·
`data-close-drawer="#id"` · `data-activate="screen-id"` (jump to another screen on the same
page). Tiny page-local `<script>` after `hcos.js` is fine for demo behavior (e.g. cycling a
status pill); it must produce zero console errors.

Page-specific CSS: allowed only in a small `<style>` in `<head>`, class names prefixed with
the page letter (e.g. `.b-scribe-…`), and only for things the shared vocabulary genuinely
lacks. If it feels general, it belongs in `assets/hcos.css` instead.

## Copy and design rules (from CLAUDE.md — enforced at review)

- Sentence case everywhere. Inter for UI; Fraunces ONLY on the login hero and hub headline.
- Buttons say exactly what they do: "Book appointment", "Sign and lock", "Start infusion" —
  never "Submit", "OK", "Go". A button keeps its name through a flow.
- Errors say what happened and how to fix it.
- Status colors are the ONLY color system on the calendar; appointment type is text.
- Statuses use the one vocabulary: Scheduled → Confirmed → Arrived → In Room | In Chair →
  Done; exits No-Show / Cancelled / Rescheduled. Conflicts warn, never block.
- 8px spacing rhythm; white cards on the band background; 12px radius.

## The synthetic world (no PHI — ever)

The wireframe's fixed "today" is **Tuesday, July 21**. The day-view now-line sits at
**11:40 AM**. Clinic hours 8:00 AM – 6:00 PM.

Shared synthetic patient cast — reuse these names across pages so screens tell one story:

| Patient | Age | Coverage | Story |
|---|---|---|---|
| Maya Reyes | 52 | UnitedHealthcare PPO · OON | NAD+ series, detox program, readiness Standard |
| Daniel Okafor | 47 | Anthem Blue Cross · INN | IV vitamin C 25 g series (J3490: 50 units = $276.50) |
| Priya Natarajan | 38 | Blue Shield of CA PPO · OON | Myers' cocktail, fatigue workup, claim in appeals |
| Tom Alvarez | 61 | Cigna PPO · OON | New patient, glutathione push, SPD requested |
| Grace Lindqvist | 44 | Self-pay | Follow-up, thyroid panel pending |
| Marcus Webb | 55 | Anthem Blue Cross · INN | New patient consult 90m |
| Elena Petrova | 33 | UnitedHealthcare · OON | Telehealth follow-up |
| Sofia Ramos | 29 | Blue Shield of CA · OON | Lab draw 15m |
| Walter Hsu | 68 | Cigna · OON (self-funded / ERISA) | NAD+ infusion, caregiver access granted |
| Nadia Boulos | 41 | Anthem · INN | Questionnaire pending, readiness Physician Review |

Staff names/roles come from the CLAUDE.md roster. Providers on the calendar:
Dr. Drannikov (primary day-view column), Dr. Bakman, Brooke (PA). Chairs 1–4 sit under the
"Infusion Suite" band.

## Validation gate (run before calling any page done)

```bash
# div balance
grep -o '<div' page.html | wc -l   # must equal:
grep -o '</div>' page.html | wc -l
# unique screen ids across the site
grep -ho 'id="[a-z0-9-]*"' *.html | sort | uniq -d   # expect empty
# js syntax
node -e "new Function(require('fs').readFileSync('assets/hcos.js','utf8'))"
```

Then open from `file://`: zero console errors, chips switch screens, the feedback widget
opens/saves, every link resolves. The same must hold on GitHub Pages.
