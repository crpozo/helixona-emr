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
- Appointment types with real durations: New Patient Consult 90m · Follow-up 30m · Infusion (NAD+ ~3h, Mega C 50 ~2h, Foundational Flow 10 ~1h, Glutathione push 30m) · Lab Draw 15m · Telehealth 30m.
- **The 30-minute grid is the START-TIME granularity for medics, not a duration (Carlos, 2026-07-28).** Nothing is "30 minutes long" because of the grid — a 3 h NAD+ runs 3 h, it just begins at :00 or :30.
- **Duration is per patient, not just per protocol.** The system tracks how long each patient actually takes for a given IV and books their own average once there are 3 past runs — Maya Reyes books 3 h 20 for NAD+, not 3 h. Blocks warn when a drip is running past its booked end.
- **Conflicts: each rule sets its own strength (Carlos, 2026-07-28)** — Block / Warn / Allow, configured on `schedule-rules.html`. Provider double-book blocks; chair overlap warns (clinics overbook on purpose). Coverage rules layer on top and the stricter one wins.
- Filters are multi-select across team, providers, actors and treatment, and a user can **lock a saved view** as their default.
- **Three levels, one look each (Carlos, 2026-08-06, third pass — designed by an independent
  three-way panel after two rejected attempts).** One sentence a receptionist can repeat:
  **the colour says WHAT it is · the word says WHICH one · how dark the block is says WHERE it
  stands — and a black bar means someone is waiting on you.**
  - **TYPE owns the hue, in two places and nowhere else**: a 5px `::before` rail carrying a
    per-type *texture* (visit solid · procedure dash · IV dot · energetics split · treatment
    hatch) so the code survives greyscale and colour blindness, plus the subtype word's ink.
    Tokens `--ty-*` / `--ty-*-ink`. The five pale `--ty-*-bg` fills are **deleted**: measured at
    2.4% luminance spread, they were noise pretending to be signal and they occupied
    `background`, which status needs.
  - **SUBTYPE owns the words**: the real English name — "NAD+", "Mega C", "Acupuncture",
    "Foundational Flow" — set in its parent type's ink, first on line one. Three-letter chips are
    gone from calendar blocks (`.type-mark` stays everywhere else). This is what makes the levels
    read as *nested*: the only coloured text on a block is the subtype, in its family's hue.
  - **STATUS owns weight**, on a dilution of the block's own hue — never a second palette:
    scheduled ghost (white + dashed) · confirmed 18% · arrived/checkout 38% + ink ring ·
    in progress 100% + white text + inverted rail · done 8% + faded rail. The two exits leave the
    ramp and drop hue entirely: no-show grey hatch + dashed ink, cancelled white + strikethrough
    + grey rail.
  - **The status word is printed on only three of eight statuses** — the ones where a human owes
    an action (ARRIVED · WAITING / READY TO CHECK OUT / NO-SHOW) — as a full-width black bar on
    the block's bottom edge. Because every block shares `left:4px;right:4px`, the bars line up
    into a column of call-to-action strips, the only pure black marks on a tinted board.
    `.cal.st-words` is the opt-in that prints all eight.
  - Layout is a 3-row grid with permanent cells, so nothing reflows between an 18px lab draw and
    a 3-hour infusion; container queries drop the descriptor, then the time, as height and width
    shrink. `--blk-muted #4A4A4A` replaces `--muted` on blocks, which fails contrast on tints.
- **Filters are hierarchical**: picking Types narrows which Subtype chips are offered; both are multi-select; the same state drives day, week and month. Saved custom filters are built on the Filter setup screen (`l-06-filters`) and lockable as a personal default.
- **Chairs are gone — resources are general**: columns are IV 1–4 under the Infusion suite band, plus Rooms; the booking form's location field is "Resource".
- **An appointment type is linked to the provider's order** (order = prescription): the booking screen shows the patient's active orders with validity dates and their expired ones; an expired order can proceed only with an acknowledged note, booking as TENTATIVE until Dr. Drannikov approves the renewal. Orders show duration and expiration everywhere (`b-09-orders` has an Expires column) and click through to the orders page.
- **Linked appointments** follow the main one (lab draw before, next of series, provider FU) and re-offer their slots when the main moves.
- **AI pattern warnings on booking and hover**: patients who run long or arrive late are flagged with the pattern and a suggestion ("book her late in the day"), with provenance.
- **Month view shows capacity per treatment** — % full and slots left this month, per type.
- **Membership = booking priority**: prime times open to Longevity 14 days out, Restore 7, Wellness 3.
- Front-desk-first density: a full clinic day visible without scrolling.

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
index.html            REDIRECT to login.html — the root opens the sign-in like the
                      real app (Carlos, 2026-07-21). Never put the hub back here.
hub.html              hub: pillars line, 12-module map with status chips
                      (wireframed / in progress / planned), feedback explainer;
                      linked from the sidebar foot ("Module map")
login.html            staff sign-in + 4 auth states — chrome-free, card only
schedule.html         day calendar with chairs + week (ref: design file screens 01–04)
patients.html         list + profile with insurance snapshot (INN / OON)
billing.html          claim worklist + payer routing (EDI 275 vs claim-number-first)

Modules A and B carry the FULL deep pass (76 screens ported 2026-07-21 from the old
helixona-ehr wireframes), organized as sub-pages with second-level tabs (SUBNAV in
hcos.js):
intake.html            Triage — Marie's console, module home    a-06…a-12
intake-funnel.html     Public funnel                            a-01…a-05
intake-onboarding.html Onboarding wizard, 10 steps              a-13…a-22
intake-documents.html  Uploads/OCR, SPD, confirmation           a-23…a-28
intake-frontdesk.html  Front desk day                           a-29…a-32
intake-kiosk.html      Kiosk flow                               a-33…a-38
intake-previsit.html   MA pre-visit sweep                       a-39…a-41
intake-admin.html      Audit, templates, notifications, builder a-42…a-46
clinical.html          Provider spine (worklist→sign & lock)    b-01,02,03,08,09,11
clinical-chart.html    Timeline, problems, med rec, IV order    b-04…07,10,12
clinical-questionnaires.html  Survey-engine clinical arm        b-28…b-30
clinical-infusion.html Bay board, five rights, flowsheet        b-13…b-17
clinical-remote.html   Remote MA pre/post-charting              b-18…b-20
clinical-templates.html Shared templates + dot-phrases          b-21…b-23
clinical-governance.html Co-sign, audit, quality, states        b-24…b-27

Module J (Patient journey & education) carries the ported eCarePlan app (2026-07-21,
from github.com/crpozo/helixona-module-careplan — a React/Tailwind patient POC app,
converted gold→grayscale). Patient-facing screens render in .phone-frame; the staff
care-plan authoring page is the one desktop screen. Sub-pages with journey tabs:
journey.html            Today — patient home (module landing)     j-01…j-03
journey-plan.html       My plan: journey path, activities, doses   j-plan-*
journey-checkin.html    Guided check-in flow + celebration         j-checkin-*
journey-schedule.html   By day / week / month / treatment          j-sched-*
journey-progress.html   Adherence ring, streak, week history       j-progress-*
journey-rewards.html    Points, tier ladder, catalog, badge wall   j-rewards-*
journey-book.html       Book a visit (what→day→time→confirm)       j-book-*
journey-careplan.html   Care plan authoring / staff entry (desktop) j-staff-*

The care journey (7 stages Identification→Graduation), pacing, activity/supplement
doses, tier ladder (Initiate→Radiant) and rewards are the eCarePlan's model. In
grayscale: done/earned = ink, never gold or green.

security.html         Audit store, roles matrix, canonical records,
                      eCW ownership and cutover               g-01…g-04

[remaining modules]   one high-level screen each, deepened in later passes
assets/hcos.css       tokens + components — single source of truth
assets/hcos.js        screen switching + the feedback widget
feedback/notes.json   published team notes, rendered as badges and a drawer per screen
```

Each page uses screen-nav chips; deep modules stay usable by splitting into sub-pages of
3–10 screens under their module tabs (the 2–5 rule applies to NEW high-level modules only).

## Feedback widget (on every screen — never omit)

Floating **Feedback** button → panel with: Screen (auto-filled from page + screen id), Type (Idea / Problem / Question / Approved), Note. No name field, no email step (removed by Carlos, 2026-07-21). On save:

1. Persists to localStorage and renders as the author's own pin on that screen — instant, private to their browser, no account needed. Own notes can be deleted from the drawer.
2. **Export my notes** downloads a notes.json the person can share any way they like (chat, email, PR).

Shared visibility — how "everyone edits" works on a static site: Carlos merges received feedback into `feedback/notes.json` (fields `id, page, screen, name, type, text, date, status(open|done)`); `hcos.js` fetches it and renders count badges plus a notes drawer on each screen, visible to all. GitHub-savvy collaborators may PR that file directly. This two-layer loop IS the collaboration mechanism — protect it in every change. `fetch()` fails on `file://`, so wrap it with a graceful fallback (empty published notes, no console error).

## Design system (established — reuse, never reinvent)

**Colour code (Carlos, 2026-07-28) — two channels, two questions.** The wireframe was grayscale-only; it now carries a deliberate colour code and nothing else.

- **Status owns the FILL** — where the visit is right now, read as a workflow: Scheduled `#9AA3B0` grey (nothing yet) → Confirmed `#2E6DB4` blue (they said yes) → Arrived `#D98A1F` amber (here, waiting on you) → In Room / In Chair `#2E8B57` green (being treated) → Done `#5B6673` slate (finished, recedes). Exits: No-Show `#C0392B` red dashed · Cancelled `#A9B0B8` grey with strikethrough. Block fills are the pale `--st-*-bg` tints so the treatment edge stays loud.
- **Treatment owns the LEFT EDGE and the initial chip** — NAD+ `#5B4B8A` · IV vitamin C `#B26B12` · Foundational Flow and pushes `#1F6F6B` · EBOO `#9B3A3A` · consults and follow-ups `#2E5C8A` · telehealth `#3E7A4E` · lab draw `#6B5B3A`. The edge **pattern** stays alongside the colour so the board still reads printed or colour-blind.

- **Trend owns its own tokens** — `--trend-good #2F7D4F` / `--trend-bad #B03A2E`, used only by
  delta pills on the dashboards. It is deliberately NOT the clinical green and red: "revenue is up"
  must not share a swatch with "the patient is in the chair", or retuning the clinical ramp silently
  moves the dashboards with it.
- **A generic second chart series is `--series-2 #B8B8B8`**, a neutral. A chart series is not a status.

Everything outside those systems stays black, white and grey. Structure, chrome, cards, tables and
buttons are never coloured. A status colour may only ever mean that status: the funnel's
Completed / Remaining / No-show legitimately uses the ramp because those *are* appointment statuses,
but "below par stock" is not, and is marked in words (`.t-par`) so it reads printed and colour-blind.

Base tokens: `--hx-navy #1A1A1A` · `--hx-blue #3D3D3D` · `--hx-accent #6E6E6E` · `--hx-band #F7F7F7` · `--hx-light #EFEFEF` · ink `#1A1A1A` · muted `#737373` · lines `#DBDBDB / #E9E9E9`. Network badges read by border: INN solid · OON dashed · self-pay dotted.

Type and copy: Inter everywhere; Fraunces only on the login hero and hub headline. Sentence case. Buttons say exactly what they do ("Book appointment", never "Submit") and keep their name through a flow. Errors say what happened and how to fix it. 8px spacing rhythm. App shell: navy sidebar 216px, band background, white cards, 12px radius.

New module screens may use simplified placeholder blocks for depth we don't have yet — but always inside the real shell, with real labels drawn from this file.

**The shell is the real product's chrome (Carlos, 2026-07-21): a real EMR menu, not wireframe scaffolding.** Sidebar groups: Clinic (Schedule · Patients · Documentation · Orders & results · Medications · Messages · Billing), Programs (Intake · Readiness · Patient journey · Caregiver access), Practice (Reports · Security & audit) — no module letters, no status dots, no "wireframe" labels. Sidebar foot = signed-in user card (Dr. Drannikov · Provider · Sign out). Topbar = page title + global search. Wireframe meta lives only in the floating feedback widget and hub.html.

## Architecture rules (from the HCOS Wireframe Architecture Review, 2026-07-28)

131 screens were audited. 26 Critical and 27 High findings all reduce to one rule:

> **Information exists once, with many controlled views.** A screen may look different when it
> is a *view* of the same record. It is a defect when a screen stores a competing copy, applies
> different clinical or business rules, or lets an unauthorized role change an approved decision.

### Canonical records — each exists once, with many controlled views

| Canonical record | Core content | Authoritative input | Key governance rule |
|---|---|---|---|
| **Person / Patient Master** | Stable person ID, identifiers, demographics, contacts, preferred name, communication preferences | Inquiry form; eCW import; authorized correction | One person; lifecycle changes, identity does not fork. |
| **Lifecycle** | Inquiry, Lead, Scheduled, Onboarding, Patient, Inactive/Closed; timestamps and reason | Workflow events | Append status events; current status is derived. |
| **Coverage** | Payer, plan, member/group IDs, effective dates, card/document links | Card OCR + staff verification | One active coverage set; eligibility is separate snapshot history. |
| **Eligibility Snapshot** | Response date, status, network, deductible/OOP/coinsurance, source response | Payer verification | Never overwrite prior response; latest valid snapshot is selected. |
| **Appointment & Resources** | Appointment, service, provider/chair/room, duration, status, series, constraints | Central scheduling service | Transactional booking; one appointment ID. |
| **Encounter** | Visit/administration context, participants, note state | Clinical documentation | Draft → reviewed → signed/locked → addendum. |
| **Problem List** | Condition/problem, status, onset/resolution, verification, source | Provider reconciliation | Patient report is not automatically a confirmed diagnosis. |
| **Allergy / Intolerance** | Substance, reaction, severity, category, status, source, verifier | Patient report + clinical verification | One list; every safety check reads it. |
| **Medication / Supplement** | Item, dose, route, frequency, status, source, start/stop, reconciliation | Patient, pharmacy, prescription, provider | Preserve patient-reported vs reconciled vs prescribed states. |
| **Order** | Type, item, dose/rate, cadence, prerequisites, expiration, stop/hold rules, signer | Physician/extender | Versioned; downstream references order ID/version. |
| **Result** | Test/measurement, value, unit, reference/critical flags, source, reviewed status | Lab/interface/manual verified import | Original result immutable; corrections are linked. |
| **Readiness Assessment** | Inputs, ruleset/version, result, rationale, reviewer, override | HCOS rules + clinician review | One current effective assessment plus history. |
| **Plan of Care** | Goal, pathway, access level, stage, lead actor, pacing, plan items, stop/transition rules | Signed clinical decision | Versioned effective plan; physician/extender approval required. |
| **Weekly Plan Item** | Activity/treatment/medication/supplement, frequency, timing, owner, completion rule | Approved plan version | Staff suggestion remains pending until approved where clinically meaningful. |
| **Questionnaire / Response** | Definition/version, question IDs, scoring; response/source/time | Form builder + patient/staff | Definition and response are immutable versions; mappings are explicit. |
| **Document / Consent** | Type, file, extraction, signer, version, effective/expiration dates | Upload/signature/OCR | OCR is proposed data; original file and consent evidence retained. |
| **Communication / Task** | Message, template/version, channel, delivery, work item, owner, due/escalation | Workflow event or user | Separate message from task; both link to source event. |
| **Treatment Administration** | Order reference, actual dose/rate/volume, vitals, staff, times, variance/adverse event | Nurse/medic documentation | Actuals never overwrite signed order. |
| **Claim / RCM Work Item** | Encounter/order/coverage references, codes, submission, remittance, appeal | Billing workflow | Claims reference clinical records; billing edits cannot change signed note. |
| **Caregiver Grant** | Patient, caregiver identity, scope, start/end, revocation, consent | Patient approval | Scope-based, time-limited when selected, immediately revocable. |
| **Enterprise Audit Event** | Actor, role, action, record, time, source, before/after metadata, AI/system identity | Every component | Append-only; no administrator edits or deletes. |
| **AI Provenance** | Use case, source records, model/ruleset version, prompt/context, output, confidence, reviewer/disposition | Every AI-enabled workflow | AI output never silently replaces human-approved record. |

### The 18 duplicate/flow clusters — solve once, consume everywhere

These are the architectural clusters the review says must be solved once and then consumed across the wireframe. Screen-level findings are symptoms of these.

| # | Cluster | Required architecture | Priority |
|---|---|---|---|
| 1 | **Person identity and lifecycle** | One person record with lifecycle statuses: Inquiry → Lead → Scheduled/Onboarding → Patient → Inactive/Closed. No separate lead and patient identities. | Critical |
| 2 | **Scheduling** | One appointment/resource engine with staff, intake and patient views. Same capacity, duration, cadence, order, clearance and override rules everywhere. | Critical |
| 3 | **Coverage and benefits** | One coverage record plus immutable eligibility/benefit snapshots. Price/membership rules link to coverage but remain separate configuration. | High |
| 4 | **Allergies and sensitivities** | One longitudinal allergy/intolerance record. Intake submits; provider/extender verifies; other screens display or record verification. | Critical |
| 5 | **Medications and supplements** | One longitudinal list with patient-reported, reconciled, prescribed, active, held and discontinued states. Plan/check-in references the same items. | Critical |
| 6 | **Conditions, symptoms and problems** | Patient-reported history remains attributable; provider verification creates/changes the longitudinal problem list; encounter assessment remains encounter-specific. | High |
| 7 | **Signed plan, HCOS stage and weekly plan** | One versioned Plan of Care Builder. Physician/extender changes stage or weekly plan; staff submit suggestions. Patient views are projections of the approved version. | Critical |
| 8 | **Readiness** | One versioned readiness assessment with inputs, ruleset, rationale, reviewer and override. All other screens consume it. | Critical |
| 9 | **Orders and administration** | One signed order/version drives eligibility, booking, administration and billing. Flowsheet records actuals; it does not restate the order. | Critical |
| 10 | **Clinical documentation and AI drafts** | Pre-chart and ambient documentation remain drafts with source links. Only the provider-approved note becomes legal record. | Critical |
| 11 | **Questionnaires** | One survey engine with reusable questions, versioned definitions, scoring and destination mapping. Responses are stored once. | High |
| 12 | **Audit trails** | One append-only enterprise audit event store with filtered domain views. Include reads, edits, AI/system actions and integration events. | High |
| 13 | **Workflow/system states** | One workflow-state framework with domain-specific state machines and governed transitions; avoid duplicate state infrastructure. | High |
| 14 | **Templates and content** | Use a shared versioning/publishing framework, while retaining distinct content types and owners. | Medium |
| 15 | **Documents and consents** | One document/consent repository with document type, version, signer, effective date, expiration and source file. | High |
| 16 | **Tasks, alerts and flags** | One task/alert framework with owner, due date, priority, source event, status and escalation; modules provide filtered queues. | High |
| 17 | **Reports and dashboards** | Reports are read-only projections calculated from canonical data with metric definitions, refresh time and drill-through. | Medium |
| 18 | **Clinical pathways vs access levels** | Keep pathway taxonomy separate from access level. Pathways: Complex Chronic Care, Health Optimization, Recovery, Vitality. Access: Comprehensive, Collaborative, Self-Directed/Open Access. | High |

### Two separate axes — never mix them (H7)
- **Care pathway** (clinical): Complex Chronic Care · Health Optimization · Recovery · Vitality
- **Access level** (business): Comprehensive · Collaborative · Self-Directed / Open Access

### Who may do what — Roles, suggestions and approval rights

`A/E` approve or edit · `E` edit/execute · `S` suggest/prepare · `V` view · `O` owns their own data · `—` not permitted.

| Action | Physician | Extender | MA | Nurse / Medic | Care Guide / PCC | Front Desk | Patient | AI / System | Governance note |
|---|---|---|---|---|---|---|---|---|---|
| **Create inquiry/person** | V | V | V | — | E | E | O | — | Front desk/PCC can create; system proposes duplicates. |
| **Promote lifecycle Inquiry → Lead → Patient** | V | V | — | — | E | E | — | — | Identity remains the same record. |
| **Edit administrative demographics** | V | V | E | — | E | E | O | — | Patient correction retains provenance; sensitive changes may require verification. |
| **Submit conditions/symptoms/allergies/medications** | V | V | E | E | E | — | O | — | Submission is patient/staff-reported until reconciled. |
| **Reconcile problem list** | A/E | A/E | S | S | S | — | — | S | AI may suggest; provider/extender approves. |
| **Reconcile allergies** | A/E | A/E | S | S | S | — | — | S | Safety flags show immediately; clinical status approved by provider/extender. |
| **Reconcile medications/supplements** | A/E | A/E | S | S | S | — | — | S | MA prepares; provider/extender approves. |
| **Place/change/discontinue clinical order** | A/E | A/E | S | S | S | — | — | S | Only licensed provider/extender acts within scope. |
| **Sign and lock encounter** | A/E | A/E | — | — | — | — | — | — | AI cannot sign. |
| **Change HCOS stage** | A/E | A/E | S | S | S | — | — | S | Explicit user decision: physician or extender; staff suggest. |
| **Change approved weekly plan** | A/E | A/E | S | S | S | — | — | S | Versioned approval required. |
| **Complete assigned plan task** | V | V | E | E | E | — | O | — | Completion does not change plan definition. |
| **Approve/override readiness** | A/E | A/E | S | S | S | — | — | S | System calculates; clinician approves/overrides with reason. |
| **Book within approved constraints** | V | V | E | E | E | E | O | — | Patient sees eligible options; hard safety constraints enforced. |
| **Override designated scheduling warning** | A/E | A/E | — | S | — | — | — | — | Only configured warning types; never hard safety blocks. |
| **Document infusion administration** | V | V | S | A/E | V | — | — | — | Nurse/medic documents actuals; material variance escalates. |
| **Document adverse event** | A/E | A/E | S | A/E | S | — | O | S | Immediate clinical escalation and linked event. |
| **Publish questionnaire/template** | A/E | A/E | S | S | S | — | — | S | Clinical owner approves clinical content and scoring. |
| **Grant/revoke caregiver access** | V | V | V | — | V | — | O | V | Patient consent controls scope; staff assists only under policy. |
| **Edit or delete audit event** | — | — | — | — | — | — | — | — | No role may edit/delete append-only audit events. |

### Corrections the review made to our own assumptions

- **Clinical sequence** is **Stabilization → Root cause identification → Lead Actor 1/2/3 → Repair → Graduation.** Stabilization comes FIRST — calm the system before mapping root drivers. Same sequence and terms in staff and patient views.
- **The physician is Dr. Eduard Drannikov.** One verified name everywhere: signatures, examples, templates.
- **Self-directed / open access never means "no clinical clearance."** EBOO, every infusion and every push still require a signed order and current clearance. Booking is a HARD BLOCK until both exist.
- **Person and Patient are one record, in one place.** `patients.html` holds the list (lifecycle filter, Patient by default), the identity record, find-or-create and the duplicate queue. There is no separate People section — `people.html` only redirects.

### Scheduling is one engine (C3)
**Hard blocks** (never an ordinary warning): occupied chair or provider · missing signed order or clearance · contraindication · unsafe interval · unavailable supervision. **Eligible warnings** may be overridden only by a designated authority, **with a reason, logged**.

### AI governance (H8)
AI prepares, summarizes, detects and suggests. **It does not sign, order, diagnose, merge, escalate or send.** Every AI surface shows: source(s) used, model/version, confidence or uncertainty, state (suggested / accepted / rejected), and the named human reviewer. Fail-safe: readiness fails **closed** to Physician Review Required; scheduling falls back to protocol defaults and hard constraints.

### eCW transition
Before a domain activates in HCOS, **eCW is the only writer** for that domain; HCOS reads. Cutover is per domain, and the source-of-truth rule is stated on the screen. The per-domain register lives at `security.html#/g-04-ecw` (11 domains: 6 written by HCOS, 2 in cutover, 3 still eCW; **never** one written by both). The 22 canonical records above are registered at `security.html#/g-03-records`, each with its writer, its rule, the screen it lives in, and who owns it today.

### Shared components for all of the above (assets/hcos.css)
`lifecycle`/`lifecycle-step` · `clin-state reported|reconciled|verified` + `clin-src` · `prov` (provenance line) · `ver-chip` + `appr draft|pending|approved|superseded` · `ai-block` (`ai-badge`, `ai-state`, `ai-meta`, `ai-actions`) · `match-row`/`match-score`. Never re-invent these per page.

## Dashboard rules (from DASHBOARD_SPEC.md, 2026-07-30)

The spec's *behaviour* is adopted; its gold-and-black palette is not — the
wireframe keeps grayscale plus the two clinical channels (status = fill,
treatment = edge). Where the spec says "gold", read "our dark ink".

- **Period and payment live in the header**, and only on the pages where they
  change the numbers. The matrix is in `DASH_FILTERS` in `assets/hcos.js`:
  Executive, Revenue, Patients, Employees and Treatments take both; Billing,
  Marketing and Team take period only; Today, AI insights, Journey and Admin
  take neither.
- **Period is a multiplier where 1 = one month** (today 1/30.42 · week 0.25 ·
  month 1 · quarter 3 · YTD 5.4). A figure scales only if it is a count or an
  amount: mark it `data-vol`. Rates, averages and per-something never scale.
  Add `data-pay` when the payment filter should also split it.
- **A filtered-out series drops to zero**, it does not sit there greyed out
  pretending to be data.
- **Cash and insurance use one pair of tones everywhere** — `--pay-cash` mid
  grey, `--pay-ins` near-black, applied through `.series-cash` / `.series-ins`
  with a `.pay-key` legend. Never invent a new pair per chart.
- **A delta pill is coloured by the metric, not by the arrow.** Falling is good
  on a denial rate, a no-show rate or days in AR, and bad on revenue. The
  vocabulary lives in `LOWER_IS_BETTER`; extend it there, never per page.
- **A KPI card carrying `data-kpi="token"` is clickable** and narrows the tables
  on its own screen to rows containing that token. One token per screen — three
  cards that filter to the same rows is not a filter.
- **Every figure is `tabular-nums`** so columns line up.

## Treatments and therapies (Module T, added 2026-07-31)

`treatments.html` is the clinic's recipe book and the only place a treatment is
defined. Six screens: catalogue, recipe detail, therapies and procedures,
inventory, administration log, and types and colour codes.

- **26 IV recipes and add-ons**, each with its own bags, pushes, run time and
  components. There is no Myers' cocktail — that is a spa drip, and the clinic's
  base recipe is Foundational Flow. The calendar code is FLO, not MYR.
- **9 therapies and procedures**, each carrying only the variables that belong to
  it: a laser has a diode colour and a protocol, EBOO has a circuit, a manual
  therapy has neither.
- **Chair time is per patient, not per recipe.** The catalogue default is a
  starting point; the booked duration is the patient's own, and the difference is
  a recorded variance, never a silent correction.
- **Whether a treatment is billable is a property of the treatment**, set here and
  read by booking and by billing. It is never re-decided at the desk.
- **One administration entry has four consequences**: it decrements the lot,
  stamps the recipe version onto the chart, records the variance, and releases
  units to billing. Staff enter it once, in the flow.
- Recipes are versioned and approved. An administration is stamped with the
  version that was live when it ran, so an old chart never shows today's recipe.
- Concentrations and stability windows marked "to confirm" are placeholders
  awaiting clinical sign-off. Never present one as settled.

## Lead actors (added 2026-07-31)

The doctor treats a driver; the payer pays for a code; those are not the same
name. Every patient carries **two classifications per problem**: the clinic's own
lead actor, which is more specific and carries the co-infections and the flare
pattern, and the name the payer accepts. The clinic name drives the plan, the
payer name drives the claim.

The doctor ranks them and flags a main one. The **top five ride along as
breadcrumbs (`.lead-bar`) on every screen of that patient** — chart, snapshot and
profile — so nobody opens a chart and forgets what the visit is about.

## Buttons must not lie (added 2026-07-31)

A button that announces "added" and changes nothing is worse than a dead button,
because the reviewer believes it. Declarative attributes in `assets/hcos.js`:

- `data-row-add` appends a blank row to the list that follows the button
- `data-row-del` removes the row the button sits in
- a button may instead carry `data-activate` when the real outcome is navigation

`check.sh` fails the build on any button whose toast claims a change it cannot
make. Chips in a "tick everything that applies" group must carry `multi`, or
answering one silently unticks the last.

## Data rules

**No PHI, ever.** Patients, appointments, notes, and claims in the wireframe are always synthetic. Clinic identity (name, address, phone, NPI) and staff first names are fine — they are the real users. Do not put the clinic TIN, payer account numbers, or any real patient detail anywhere in this repo.

## Working style and validation

- One page per commit when possible; imperative messages.
- Before finishing any task: pages load from `file://` with zero console errors; div balance checked (`grep -o '<div' page.html | wc -l` vs `</div>`); every screen id unique; every screen has the feedback widget; all hub links resolve; JS syntax checked (`node -e "new Function(require('fs').readFileSync('assets/hcos.js','utf8'))"`).
- When in doubt about domain content, this file wins. When in doubt about look, `design/hcos-v1-design.html` wins. Open questions go to Carlos.
