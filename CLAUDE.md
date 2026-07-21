# CLAUDE.md — Helixona EMR (HCOS)

This file is the single source of truth for working in this repo. Everything Claude needs is here.

## Current mission: the collaborative wireframe

We are NOT building the application yet. The current deliverable is a **high-level interactive wireframe** of the whole EMR, published on GitHub Pages, that the entire Helixona team can browse and annotate. It is the collaboration surface where the software gets shaped — by everyone — before any application code is written.

- `design/hcos-v1-design.html` is the finished visual reference for the calendar and login. Reuse its language and components.
- `HCOS_V1_PLAN.md` is the LATER phase (the real application build). Do not scaffold Next.js, Prisma, or any app code until Carlos closes the wireframe phase.
- All instructions may arrive in Spanish; UI, code, and docs are always English.

## What the wireframe must be

- **Static HTML/CSS/JS only.** No build step, no framework, no backend. Identical behavior opened from `file://` and on GitHub Pages (this repo, `index.html` at root → https://crpozo.github.io/helixona-emr/).
- `index.html` = hub with the 12-module map and the how-to-give-feedback explainer; one HTML page per wireframed area; shared `assets/hcos.css` + `assets/hcos.js`.
- Priority order: 1 Hub · 2 Login · 3 Schedule/Calendar (the centerpiece — a real calendar showing appointments) · 4 Patients · 5 Clinical Documentation + Infusion · 6 Billing/RCM · then remaining modules as one high-level screen each.
- Every screen carries the feedback widget (spec below).
- High level means high level: 2–5 representative screens per module, never exhaustive flows. Depth comes later, driven by team feedback.
- **It behaves like a clickable prototype (Carlos, 2026-07-21): the team tests it as if using the real app.** Sign in flows into the calendar; buttons navigate; rows open their detail; flows connect pages (calendar ↔ chart ↔ billing). Never a dead primary button.
- **No explanatory blocks on screens** (descriptor cards retired 2026-07-21) — screens show product UI only; reviewer context lives in the hub explainer and the notes drawer.

## The clinic

Helixona, Inc. — functional medicine and infusion therapy. 114 Pacifica, Suite 130, Irvine, CA 92618 · (949) 257-2644 · Group NPI 1407646755. Replacing eClinicalWorks (eCW).

Philosophy: the Helixona Method and its Six Pillars — 1 Body Knows How to Heal · 2 Healing Happens Together · 3 Listen Deeply · 4 Teach Until It Makes Sense · 5 Timing Matters · 6 Love Is Clinical.

Guiding principle for every screen: it must **reduce burden, improve understanding, or help make the next safest decision**. If it does none of those, question it.

## The team — who uses HCOS and what each person needs

These are the real users, the feedback-dropdown names, and the role labels on screens:

- **Tom Bakman** — Leadership / RCM oversight. Needs visibility: claim outcomes, reporting, and the standing policy honored everywhere: **every recoupment is appealed — no passive write-offs**.
- **Dr. Drannikov** — Physician. Needs documentation that ends at the clinic: a reliable AI scribe inside the SOAP editor, shareable macros, and sign-and-lock that dispatches everything at once. Today the documentation burden follows him into the weekend — HCOS must end that.
- **Marie** — New Patient Advisor. Runs intake triage. Today she keeps a personal Excel log because eCW gives her no triage console — Module A must replace it with a real one.
- **Jazzmine** — Front Desk / Scheduling. The calendar is her home page: day view by provider and chairs, one-click status flow, quick patient create from an empty slot.
- **Charlenne** — Remote MA. Today she re-keys questionnaire answers into the chart by hand. In HCOS, questionnaire answers flow into the chart automatically.
- **Shibani** — Office Manager / Admin. Settings, templates, users, day-to-day administration.
- **Karina** and **Bea** — Billing / RCM. Need a claim worklist with the payer-specific routing rules (below) built in, not memorized.
- **Bee** and **Heyli** — Medical Assistants. Infusion records: start/stop times, route, dosage, supplies — captured in the flow, not after it.
- **Vignesh** — AnnexMed, external billing partner; technical and integrations contact.
- **Carlos** — Technical lead, owner of this repo.

### Staff roster (feedback dropdown + synthetic calendar data)

| ID | Name | Role |
|----|------|------|
| e1 | Dr. Drannikov | Provider |
| e2 | Dr. Bakman | Provider |
| e3 | Brooke | Physician Associate |
| e4 | Marie | New Patient Advisor |
| e5 | Bee | PCC |
| e6 | Yazmin | Front Desk |
| e7 | Haylee | Front Desk |
| e8 | Charlene (Virtual) | Medical Assistant |
| e9 | Wesley | Medical Assistant |
| e10 | Bea | Medic |
| e11 | Juan | Medic |
| e12 | Nate | Medic |
| e13 | Nick | Nurse |
| e14 | Kyle | Technician |
| e15 | Vignesh | Billing |
| e16 | Kamalesh | Billing |
| e18 | Karina | Operations Manager |
| e19 | Shibani | Admin |

## The 12 modules — what each one contains

- **A · Intake & Onboarding.** The public funnel: Public Landing → Initial Inquiry Form → Check Email/Text → Magic Link (email + SMS, 7-day expiry, pause-and-resume) → Link Expired. Marie's triage console. Kiosk check-in (today's kiosk fails silently). Form Builder — drag-and-drop, replaces the Typeform dependency. Consent-flag visibility. (43 screens were wireframed in the earlier deep pass; this repo's version is the high-level cut.)
- **B · Clinical Documentation.** SOAP editor with the HCOS AI scribe (replacing eCW's unreliable one). Questionnaires whose answers land in the chart. Infusion suite records. Shareable templates and macros. Remote MA screens. And **sign-and-lock (B-12)** — the system's nervous center: signing an encounter dispatches to labs, infusion bay, billing, pharmacy, and scheduling simultaneously. (31 screens wireframed earlier; requirements FR-B-001–014.)
- **C · Diagnostics & Lab.** Orders and results; FHIR R4 feed from eCW (sandbox endpoint exists; certification has a 2–4 week lead time).
- **D · Revenue Cycle.** Claim worklist, documentation packets, EOB/ERA reconciliation, FAIR Health benchmarks for out-of-network allowables, appeals. The payer rules below shape every billing screen.
- **E · Patient Communication.** Reminders and messaging (the clinic uses OhMD today; voice runs on separate VoIP).
- **F · Reporting & Admin.** Operational and clinical reporting for leadership.
- **G · Security & Compliance.** Roles, permissions, audit trail on every action.
- **H · Pharmacy & Medication.** Medications and supplements — a flagged priority. EPCS/DEA certification has a long lead time; screens can precede it.
- **I · Readiness Engine.** Module 001 — Detox Readiness, the first production intelligence module. Inputs: surveys, symptoms, labs, physician rules, home activities, treatment history. Outputs: Gentle / Standard / Advanced / Pause / Flare Recovery / Physician Review.
- **J · Patient Journey & Education.** The patient-facing "today view" as core UX — what to do today, what comes next, taught until it makes sense.
- **K · Caregiver Portal.** Scoped access for family/caregivers: appointments / supplements / plan / everything, granted as temporary or permanent.
- **L · Scheduling.** The calendar — the centerpiece. Truths below.

One architectural fact to respect in labels and structure: the Form Builder (A), Questionnaires (B), and Readiness surveys (I) are **ONE survey engine**, not three.

## Scheduling truths (Module L)

- Day view: time on the vertical axis; columns are **Dr. Drannikov + Chairs 1–4** grouped under an "Infusion Suite" band; a current-time line makes the calendar a live picture of the clinic day.
- Status lifecycle — one vocabulary everywhere: **Scheduled → Confirmed → Arrived → In Room | In Chair → Done**; exits No-Show, Cancelled, Rescheduled.
- Appointment types with real durations: New Patient Consult 90m · Follow-up 30m · Infusion (NAD+ ~3h, IV Vitamin C 25 g ~2.5h, Myers' Cocktail 1h, Glutathione push 30m) · Lab Draw 15m · Telehealth 30m.
- Conflicts warn, never block — clinics overbook on purpose. Front-desk-first density: a full clinic day visible without scrolling.

## Payer knowledge (shapes every Module D screen)

| Payer | Network | Docs method | Claim # first? | Path |
|-------|---------|-------------|----------------|------|
| Anthem Blue Cross | In-network | EDI 275 with the claim | No | 837 + 275 via clearinghouse (Waystar) |
| UnitedHealthcare | OON | EDI 275 with the claim | No | 837 + 275 via clearinghouse |
| Blue Shield of CA | OON | Portal / fax packet | Yes | Claim # → SympliSend portal or secure fax |
| Cigna | OON | Portal / fax packet | Yes | Claim # → portal upload or secure fax |

OON documentation packet contents: claim identifier page / CMS-1500 detail, verification of benefits, W-9, clinical notes, infusion record, FAIR Health benchmark summary, Helixona cover sheet requesting pricing-methodology disclosure (Blue Shield reduces via NovoLogix; Cigna via MultiPlan; UHC via third-party pricing — the packet demands the database, geographic mapping, percentile, and edits used).

Every packet classifies the plan: **Self-funded / ERISA** vs **Fully insured / commercial** — governance changes the rules.

Anthem J3490 ascorbic acid methodology (effective May 2025): 1 billing unit = 500 mg at $5.53/unit — e.g., a 25 g infusion = 50 units = $276.50.

Patients with PPO OON benefits are asked for their plan's governing document (SPD / EOC, typically 50–150 pages) before the visit.

Tom's standing rule, again: **every recoupment is appealed**.

## Why eCW loses (what wireframe screens must visibly fix)

Unreliable AI scribe · macros that cannot be shared · questionnaire answers that never flow into the chart · zero payer automation · a silently failing kiosk · triage tracked in a personal spreadsheet · answers re-keyed by hand · documentation that spills into the weekend. When a screen fixes one of these, make the fix visible on the screen.

## Site architecture

```
index.html            hub: pillars line, 12-module map with status chips
                      (wireframed / in progress / planned), feedback explainer
login.html            staff sign-in + 4 auth states   (ref: design file screens 00, 00b)
schedule.html         day calendar with chairs + week (ref: design file screens 01–04)
patients.html         list + profile with insurance snapshot (INN / OON)
clinical.html         encounter SOAP + infusion record + sign-and-lock concept
billing.html          claim worklist + payer routing (EDI 275 vs claim-number-first)
[remaining modules]   one high-level screen each, added in later passes
assets/hcos.css       tokens + components — single source of truth
assets/hcos.js        screen switching + the feedback widget
feedback/notes.json   published team notes, rendered as badges and a drawer per screen
```

Each module page uses screen-nav chips like the design file, 2–5 screens maximum.

## Feedback widget (on every screen — never omit)

Floating **Feedback** button → panel with: Name (the team dropdown above), Screen (auto-filled from page + screen id), Type (Idea / Problem / Question / Approved), Note. On save:

1. Persists to localStorage and renders as the author's own pin on that screen — instant, private to their browser, no account needed.
2. **Send to Carlos** opens a prefilled mailto — subject `[HCOS Wireframe] <page>/<screen> — <name>`.
3. **Export my notes** downloads a notes.json the person can attach anywhere.

Shared visibility — how "everyone edits" works on a static site: Carlos merges received feedback into `feedback/notes.json` (fields `id, page, screen, name, type, text, date, status(open|done)`); `hcos.js` fetches it and renders count badges plus a notes drawer on each screen, visible to all. GitHub-savvy collaborators may PR that file directly. This two-layer loop IS the collaboration mechanism — protect it in every change. `fetch()` fails on `file://`, so wrap it with a graceful fallback (empty published notes, no console error).

## Design system (established — reuse, never reinvent)

**GRAYSCALE ONLY (Carlos, 2026-07-21): black, white, and grays — no hue anywhere. It is a wireframe.** Never introduce a color; meaning comes from copy, shade, and border style (solid / dashed / dotted). Token names are historical but resolve to grays: `--hx-navy #1A1A1A` · `--hx-blue #3D3D3D` · `--hx-accent #6E6E6E` · `--hx-band #F7F7F7` · `--hx-light #EFEFEF` · ink `#1A1A1A` · muted `#737373` · lines `#DBDBDB / #E9E9E9`.

Status is a light→dark grayscale ramp — the further along the visit, the darker (still the ONLY differentiation system on the calendar; appointment type is text): Scheduled `#C9C9C9` · Confirmed `#9A9A9A` · Arrived `#6E6E6E` · In Room/Chair `#3D3D3D` · Done `#1A1A1A` on white · No-Show dashed `#4A4A4A` · Cancelled `#B3B3B3` + strikethrough. Network badges read by border: INN solid · OON dashed · self-pay dotted.

Type and copy: Inter everywhere; Fraunces only on the login hero and hub headline. Sentence case. Buttons say exactly what they do ("Book appointment", never "Submit") and keep their name through a flow. Errors say what happened and how to fix it. 8px spacing rhythm. App shell: navy sidebar 216px, band background, white cards, 12px radius.

New module screens may use simplified placeholder blocks for depth we don't have yet — but always inside the real shell, with real labels drawn from this file.

## Data rules

**No PHI, ever.** Patients, appointments, notes, and claims in the wireframe are always synthetic. Clinic identity (name, address, phone, NPI) and staff first names are fine — they are the real users. Do not put the clinic TIN, payer account numbers, or any real patient detail anywhere in this repo.

## Working style and validation

- One page per commit when possible; imperative messages.
- Before finishing any task: pages load from `file://` with zero console errors; div balance checked (`grep -o '<div' page.html | wc -l` vs `</div>`); every screen id unique; every screen has the feedback widget; all hub links resolve; JS syntax checked (`node -e "new Function(require('fs').readFileSync('assets/hcos.js','utf8'))"`).
- When in doubt about domain content, this file wins. When in doubt about look, `design/hcos-v1-design.html` wins. Open questions go to Carlos.
