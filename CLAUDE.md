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
- **Bee** and **Heyli** — infusion side. Infusion records: start/stop times, route, dosage, supplies — captured in the flow, not after it. **Bee does not make patient calls** (Carlos, 2026-08-13) — a call about a no-show, a cancellation or a reminder is FRONT DESK work (Yazmin, Haylee); a call to a new inquiry is Marie's; a call about money is Billing's. Getting this wrong in synthetic data is not cosmetic: the team reads the wireframe as a claim about how the clinic runs.
- **Vignesh** — AnnexMed, external billing partner; technical and integrations contact.
- **Carlos** — Technical lead, owner of this repo.

### Staff roster (feedback dropdown + synthetic calendar data)

| ID | Name | Role |
|----|------|------|
| e1 | Dr. Drannikov | Provider |
| e2 | Dr. Bakman | Provider |
| e3 | Brooke | Physician Associate |
| e20 | Mira | Provider — office visits, 30 and 60 min |
| e21 | Leigh Ann | Depth Psychology — books through her own app today |
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
- **The calendar code is the CLINIC'S OWN, from their colour spreadsheet (Carlos,
  2026-08-11, fifth pass). It supersedes every earlier attempt, including mine.**

      BACKGROUND COLOUR                     = appointment TYPE
      SIDE BAR COLOUR                       = SUB appointment type
      WATERMARK over the background         = STATUS

  Two of my three channels were the wrong way round. The side bar was already the subtype and
  stays; the background moved from status to TYPE, and status became a faint symbol watermarked
  over the block.
  - **TYPE owns the background** (`--tybg-*`, class `ty-*`): Office Visit `#B7CDB0` · Procedure
    `#A9B9E2` · Energetics `#F9F0D4` · Labs `#C5C9E8` · Diagnostics `#B8CCE4` · FPE `#F0C9A0` ·
    Chiro `#BDD7EE` · EBOO `#E8B4A8` · **Laser `#8B1A1A`** · IV white. All ten come from the
    clinic; the seven I once invented are gone.
  - **Laser's background is dark maroon at 1.9:1**, so every piece of text on a Laser block
    switches to white. It is the only type that needs it, and the rule is generated, not typed.
  - **SUBTYPE owns the side bar** (`--sb-*`, class `t-*`), 63 of them. **No white ones are
    left** — the clinic's revised sheet (2026-08-12) gave BioMod Pro `#DEE6D2` and colours to
    the other six. Every side bar still carries a hairline, because several are near-white.
  - **A colour only has to be unique WITHIN its type**, and the clinic's revised sheet is built
    that way. Eleven colours appear more than once, but never twice under the same type — so
    the two blocks always sit on different backgrounds and still read apart (`#0000F0` is G6PD
    on the Labs ground and Eboo Boost on the IV ground). The codes screen names the other
    treatments that share a colour instead of counting them, so the pairing is legible.
  - **Three near-collisions survive inside a type and are the clinic's own**: the ErcComp
    variants (Pt `#EED8D2`, VIP `#F5EAD2`, Ref `#FAF0DC`) are three pale creams on the same
    dark-maroon Laser ground, and the Foundational Flow ladder is a deliberate gradient, so 5
    and 10 are adjacent by design. Raised with Carlos, recorded as the sheet has them.
  - **The whole code is generated from one source** (`code2.py` in the session scratchpad):
    tokens, class rules, **the status watermarks**, the three legends, both filter lists and the
    codes screen. After five revisions of this palette, hand-editing five places was the thing
    that kept going wrong.
  - **The watermarks live INSIDE the generated block.** They used to sit between the subtype
    rules and the padlock, generated by nothing, and a regeneration that spliced from the code
    header to the padlock silently ate all twenty. If a rule belongs to the code, the generator
    has to emit it — otherwise the next regeneration deletes it and the CSS still parses.
- **The week and month boards speak the same taxonomy as the day board.** They were still on
  the retired code (`t-nad`, `t-ivc`, `t-flow`, `t-glut`, `t-consult`, `t-tele`, `t-eboo`,
  `t-lab`, `t-pel`, `t-las`) long after those tokens were deleted from the CSS, so every block
  on them had been rendering with **no side bar at all** — a whole channel of the code silently
  missing on two of the four views. Migrated 2026-08-12, along with the booking form's subtype
  options, the capacity rows, the month pips and the waitlist key. When a subtype key changes,
  grep the WHOLE page for it: the day board is generated, the other three views are not.
- **The taxonomy is the clinic's: TEN types and 63 subtypes.** Office Visit · Procedure ·
  Energetics · Labs · Diagnostics · FPE · Chiro · EBOO · Laser · IV. EBOO, Chiro and Laser are
  TYPES, not subtypes. Names follow the sheet exactly, including **iGenex** (not iGenix) and
  **Essential Aminos** (not Essential Amino), and the sheet's own additions: R&R, FPE - IE,
  FPE F/U, DC IN - TX, DC - TX, Laser Eval., MediFNE, POC Review, EBOO Safe, Erch Laser and the
  four ErcComp variants, Chelation, Migraine, Mini Mito Boost and Mini Mito Boost - Custom.
- **Long recipe names step down in size until they fit** (`.fit-1/2/3`, applied by measurement
  in `lFitSubs`). "Foundational Flo…" is a failure: the number is the whole point of the name.
  The measurement runs off a `ResizeObserver` on the grid **and** `document.fonts.ready` — Inter
  lands after first paint and is wider than the fallback.
- **The hour row is 96px — 48px per half hour** (Carlos, 2026-08-11: "feels constrained"). A
  30-minute block at 46px collapsed once the watermark landed in it; at 50px it breathes, and
  nine labels need to step down to fit instead of sixteen.
- **A container query can NEVER style its own container.** The watermark lives on `.cal-appt`,
  which IS the query container, so `@container appt { .cal-appt { … } }` silently never fired
  and the mark stayed at 30px on a 46px block. It is sized off the inline height instead —
  `[style*="height:50px"]` — the way the block's own layout already is. Written down because I
  had this exact comment in the file already and still made the mistake.
- **The legend's items sit in a GRID, not a flex-wrap flow.** A flow gives ragged rows and the
  eye has nowhere to land; fixed tracks line every swatch up into a column. The two IV ladders
  are wider than a track and get their own row.
- **No editorial asides in the legend** (Carlos, 2026-08-11). No "the rest are still white", no
  "the eCW recipe menu", no "no colour yet" tags. The legend shows the code; it does not
  comment on it.
- **Flag icons are drawn, not typed (Carlos, 2026-08-11).** They were text glyphs — a triangle
  for an allergy, a cross for an urgent alert, a four-pointed star for anything administrative
  — and none of them said what they meant. Nine icons now: **a stop sign for a food allergy**,
  a capsule for a drug allergy, a silhouette for pregnancy, a warning triangle for an urgent
  alert, a half-empty droplet for a deficiency, a clock for an expiring prior auth, a banknote
  for a balance, speech bubbles for an interpreter, a document for missing forms.
  - They are a **CSS mask**, not a background image, so the severity colour tints the icon: the
    mask takes the shape and `background-color` supplies the ink. A data-URI SVG cannot inherit
    `currentColor`, which is the whole reason it has to be a mask.
  - **A white sub-shape does not cut a hole in a mask** — only alpha counts, so a white fill is
    still opaque and gets drawn. The bar in the stop sign, the divider in the capsule and the
    "!" in the triangle are cut with `fill-rule='evenodd'` on a single path.
- **The black bar is gone (Carlos, 2026-08-11).** The watermark carries the status on its own.
- **Flags open the appointment drawer, above the status and everything else (Carlos,
  2026-08-11).** A food allergy or a pregnancy is not context — it is the thing you must know
  before you touch the patient, and it cannot sit four sections down. A high-severity flag
  frames the whole block in red and the heading changes from "Flags" to **"Alerts on this
  patient"**. With none, the block stays as a quiet dashed placeholder so the section is always
  in the same place.
- **Flags are a fourth thing the block says, and deliberately not a fourth channel.** They live
  in their own corner cell, never on the rail or the fill. A flag has a **category** (Medical /
  Billing / Admin — who cares) and a **severity** (how loud); those are separate on purpose,
  because an admin flag can be urgent and a medical one can be a footnote. Only high severity
  rings the block. Definitions live on `schedule.html#/l-08-flags` and are edited there; the
  dictionary is `L_FLAGS` in schedule.html, read by the block, the hover card, the appointment
  detail and the list view. **Adding a flag type has its own screen** (`l-08-flags-new`), with a
  live preview of the block and the drawer as you type — the severity is visibly what decides
  whether the appointment gets framed, so the choice is not abstract. A flag also gets a
  **lifetime**: a pregnancy flag should expire, a documented allergy should not.
- **The day board follows a REAL Helixona day (Carlos, 2026-08-11, from three of Dr.
  Drannikov's actual eCW days).** Patients are always synthetic — the real names never enter
  this repo — but the SHAPE is copied, and my earlier board had it badly wrong:
  - **06:00 to 19:00**, not 8 to 5. Real appointments start at 6 AM and run past 5 PM.
  - **Provider appointments are ONE HOUR.** Only the infusion suite books in 30-minute slots.
  - **The provider is DOUBLE-BOOKED almost every hour** — two patients side by side
    (`.half-l` / `.half-r`). Assuming one patient per slot hid half the day's load.
  - **Break at 10, Lunch at 12, Break at 2**, every day, on every provider.
  - **"NP" slots are HELD at 8 and at 1** with nobody in them: reserved intake capacity.
    A hold is not blocked time — blocked time is unbookable, a hold is waiting for the right
    patient (`.is-hold`, its own drawer, releasable).
  - **The operational note gets its own line** (`.cal-appt-note`). eCW crams consents, labs,
    callbacks, staff initials and the payer into the appointment TITLE as one unreadable
    run-on string; that is the single loudest complaint about that board.
  - Because a provider column carries two names, providers get a **wider grid track**
    (`minmax(250px, 1.7fr)` against `minmax(140px, 1fr)`) and the board scrolls. Equal tracks
    made each half 68px and every name collapsed to "Gra…".
- **A `.modal` MUST be a child of its `.modal-overlay`.** The overlay is the fixed, full-screen
  flex container that centres it, and `data-close-modal` walks up to `.modal-overlay`. Writing
  the modal as a SIBLING renders it in normal flow in the corner with no backdrop and no way to
  close — it happened to three modals at once.
- **Cancelled AND rescheduled leave the board and stay on the record (Carlos, 2026-08-12).**
  They travel together under one toggle, **Show cancelled & rescheduled**, because they are the
  same problem for the desk: a block sitting at a time when nobody is coming. Cancelled means it
  is not happening; rescheduled means it is happening *somewhere else*, and the appointment at
  the new time is its own block — leaving the old one in place reads as a patient who is coming.
  - One test, `lIsOff(el)`, is used by the day, the week, the list and every count, so a status
    can never be hidden in one view and counted in another. **A no-show is deliberately NOT in
    it**: nobody came, but the slot was really booked and really wasted, and the desk needs to
    see that it was.
  - **When they are shown they are visibly past tense**: half lit (`opacity: .45`, restored to 1
    on hover so a dim block is still readable) and struck through — a **solid** line for
    cancelled, a **dashed** one for rescheduled. The strike style is the only thing separating
    them at a glance, and it survives printing and colour blindness.
  - **The counts follow the toggle.** A hidden appointment is not in the denominator either:
    "78 of 82" when four of those 82 are cancelled reads as four missing. The day says 84 with
    the toggle off and 90 with it on.
  - **The list view obeys the same toggle**, and it did not before — it printed every cancelled
    appointment while the calendar hid them, so the two views disagreed about what tomorrow
    looks like, and the list is the one that gets printed and taken off-system.
  - A rescheduled appointment's drawer offers **Go to the new appointment**, never "Book a new
    time" — it is already booked, and offering to book it again is how the same patient ends up
    on the board twice.
- **Blocked time** (lunch, meetings) is not an appointment: it opts out of the colour code
  entirely (`.is-block`, grey hatch) and never counts in the appointment total. Recurrence uses
  the Google-Calendar vocabulary, and **only manager level may create or lift a block**.
- **The hover card carries what the desk asks for before it picks up the phone**: insurance,
  phone, eCarePlan stage, what the patient owes, the flags spelled out, and the AI pattern.
- **Every block on the board opens.** `L_APPT` holds the curated deep entries; anything else is
  built from the block's own data attributes by `lFromBlock`, so a day with eighty-five
  appointments has no dead ones.
- **Only active prescriptions book normally.** A missing or expired prescription still books —
  as **tentative**, visibly — and becomes a normal appointment the moment the order is signed.
  It is an alert, never a stop.
- **Capacity shows the number AND the percentage**, per treatment, in month and week. "81% full"
  alone hides that it is 81% of twenty-five, not of two hundred.
- **A booking rule's "when" is composed, not chosen** (`sr-whens`), and reads back as an English
  sentence. **A rule that contradicts a live one cannot be saved** — two rules that match the
  same thing and end in different verdicts give the desk an answer nobody can act on.
- **ONE filter bar, cloned into every view (Carlos, 2026-08-11).** The day had the whole bar;
  week and month had two loose selects, so a filter set on one view was invisible on the next.
  `lCloneFilters()` clones the day's bar into week, month and list, strips the ids (state lives
  in `lSel`, never in the DOM) and every copy writes to the same state. The multi-selects are
  addressed by `[data-msel]`, not by id, precisely so they can exist more than once.
- **A date range sits in that bar** — today, tomorrow, this week, next 7 days, this month, or a
  range you pick — and applies to day, week, month and list at once.
- **A RESERVED SPACE is a block that is bookable, but only by one kind of appointment
  (Carlos, 2026-08-11).** Three different things, and the wireframe keeps them apart:
  - **Blocked** — lunch, a huddle, a deep clean. Nothing books. Hatched grey.
  - **Held** — one named patient is expected. Dashed, releasable.
  - **Reserved space** — open, but refuses everything except its kind, so a new-patient space is
    still there in three weeks when intake needs it. **White**, because it is open.
  Spaces carry a duration (the new-patient space runs six months), are filterable by what they
  protect, and feed a **find-an-open-slot** search. Management reads "34 new-patient slots open
  over the next four weeks" off the same data.
- **A waitlist offer is a race.** It goes to everyone chosen at the same second with an accept
  link good for 30 minutes; the first to accept takes the slot and everyone else gets an
  automatic reply, so nobody arrives expecting an appointment that was given away. The SMS body
  is editable with `{first_name}` and `{accept_link}`; a call-only option drops the SMS field.
  Every message, accept and auto-reply lands on the patient's communication log.
- **The list view is the outage plan.** Sortable on every column, searchable, paged, with the
  patient's phone and Type and Subtype as separate columns. A PDF of tomorrow's list is
  generated and stored nightly in the practice's own AWS bucket — deliberately a PDF and not a
  database export, because it has to be readable on a phone with no system at all. The filtered
  view can be saved per browser (`hcos-list-view`).
- **Blocked time, holds and reserved spaces are not appointments** and are excluded from the
  list and from the day's count. They were showing up as rows with no patient.
- **A screen can be APPROVED BY THE TEAM, not just per browser (Carlos, 2026-08-12).**
  `data-approved="2026-08-12"` on the section is committed to the repo and everyone sees the green
  tick; the localStorage approval stays the individual reviewer's. A reviewer who disagrees with a
  settled screen leaves a note — one person does not quietly reopen a team decision in their own
  browser. Day, week and month are settled.
- **A FLAG HAS A LIFETIME.** A pregnancy ends after nine months, a missing consent stops shouting
  once it is signed, a documented food allergy never expires. Fourteen of the thirty carry one.
  **An expired flag is not deleted** — it leaves the calendar and stays on the record, because the
  fact that it was once true is itself clinical history. Deleting a flag TYPE asks twice and names
  how many appointments would lose the warning.
- **The note on an appointment belongs to the APPOINTMENT.** It was called a general note and saved
  to the profile, which is a different record with a different lifetime. It sits above the
  appointment facts as the first thing the next person reads, carries who wrote it and when, and is
  **RESOLVED rather than collapsed** — struck through and stamped, still on screen. "Somebody dealt
  with this" has to be readable, not inferred from an absence.
- **PATIENT BALANCE is calculated, never typed**: allowed amount for the treatment, less what the
  plan pays. The drawer shows the WORKING, not just the total — "$102" with no explanation is a
  number nobody can defend to a patient standing at the counter. It goes in the nightly export as
  the amount to key into the card machine, which is the whole reason that export exists.
- **An alert says WHICH problem, in words beside the symbol.** A bare icon made the desk hover
  every row to find out what was wrong.
- **PRIORITY on the waitlist is clinical and carries a REASON** (Carlos: "patient lives depend on
  the priority"). Urgent / High / Routine / Flexible, read as a word first and a colour second so
  it survives printing. A clinician can set a date the patient should be seen BY, and **the number
  of days is always shown** — "overdue" without a number is a feeling, not a fact.
- **An offer is defined by what happens to the SLOT.** Simul ring goes to everyone at once and the
  slot stays on the waitlist until somebody accepts; round robin goes one at a time by priority and
  **releases the slot back to the calendar** if the round ends empty. Everything is SMS — HCOS
  places no calls, so nobody is told on the phone that they have an appointment somebody else
  already took.
- **Capacity lives with blocking; open slots live with booking.** You go to Blocked time to MAKE
  capacity and to Book appointment to spend it, so the slot finder and the metrics moved.
- **The block form goes what → when → hours**, numbered, and reads itself back as one English
  sentence — a recurring block is the easiest thing on the screen to get wrong by one field. It
  refuses to create a reserved space with nothing ticked, which would silently refuse everything.
- **`.textContent` renders `&middot;` literally.** `L_SUBS` is DATA read into a select's
  textContent, and every subtype on the booking screen printed "New patient &middot; 90 min" —
  the "AI slop" Carlos saw. Entities belong in markup; data holds real characters.
- **`treatments.html#/t-07-types` is where the taxonomy is defined**, and `code2.py` is where it is
  generated from. Add or retire a subtype there and the CSS, the three legends, every filter, the
  capacity rows, the codes screen, both booking dictionaries and the block form change together.
  R&R was retired this way.
- **The nightly PDF is written to the practice's own AWS bucket first, and that copy is the
  record.** A Drive or SharePoint mirror is a convenience for the morning, not a second source of
  truth, and it needs a signed agreement before it is switched on — the screen says so rather than
  offering it as an ordinary setting.
- **THE FILTER BAR CARRIES NO LABEL COLUMN (Carlos, 2026-08-12: "organize this better").**
  It had three labelled rows — Show / Type & subtype / Dates — whose labels were three different
  widths, so the selects came out with a ragged left edge and two-thirds of the bar empty, and
  "Type & subtype" was a lie: that row also held statuses and the cancelled toggle. Every control
  already says what it is ("All types", "All statuses", "Today"), so the labels are gone and
  hairlines group them instead, in the order the desk thinks: **WHEN | WHO | WHAT**. The count and
  the saved view are not filters — they are pinned to the right of whichever line they land on, so
  the control that ever drops to a second line is the status toggle, never the date.
- **A DROPDOWN PANEL HAS TO OUTRANK EVERYTHING BELOW IT, AND FIT ON THE SCREEN.**
  The month's summary strip was wearing `.l-filters` — a class that carries `position: relative;
  z-index: 30`. Two siblings at the same z-index means the LATER one paints on top, so the strip
  covered the open panel's search box and its first option, and Carlos could not click them. Three
  rules came out of it:
  - **The summary strip is not a filter bar.** It holds a count and an export button and no
    filters at all; it is `.l-summary` now, with no stacking context of its own.
  - **A bar is only raised while one of its panels is open** (`.l-filters.has-open { z-index: 80 }`).
    Raising it permanently would park the whole bar over the calendar head for no reason.
  - **The panel measures its own room and sizes its scroller to fit**, bounded by BOTH the
    clipping ancestor (`.cal` and `.frame` both hide their overflow) and the window. Measuring
    only against the container pushed the Select all / Clear footer just past the bottom of the
    screen on the list view — present, but unclickable without scrolling. It skips panels on
    inactive screens: those have no box, and measuring them pinned every panel on that screen to
    the 140px floor.
- **A cloned control is identified by CLASS, never by id.** `lSync` tested `src.id` to tell a
  resource select from a treatment select; the clones have their ids stripped, so a cloned
  resource select fell through to the treatment branch and filtered the board to nothing, and
  going back to "Everyone" left the columns hidden until a refresh. Worse, the copy-back listener
  ran AFTER the inline `onchange`, so `lApply` had already read a stale value and the board sat one
  change behind. `lSync` writes every copy first, then applies once. (Carlos, 2026-08-12.)
- **A HOLD or a RESERVED SPACE obeys the type filter; BLOCKED TIME does not.** Filtering to IV
  still showed the open new-patient slots, which cannot take an IV (Carlos, 2026-08-12). Blocked
  time is the clinic being unavailable and belongs to no type; a hold and a space are capacity set
  aside for a KIND of appointment and belong to one. `lSlotOk` is that test, and it deliberately
  ignores STATUS — a held slot has no status in the ten-status vocabulary, and filtering by one
  must not erase it.
- **Every multi-select has Select all as well as Clear.** Clear had no opposite, so once you had
  ticked one box the only way back was to untick the rest by hand. It ticks what is OFFERED, not
  what exists: with Type = IV the subtype panel shows IV subtypes only, and Select all there means
  "every IV".
- **CAPACITY IS A PROPERTY OF THE TYPE (Carlos, 2026-08-12).** An IV chair takes any IV, so
  "77% full of NAD" answers a question nobody asked. The month and week rows are the ten types;
  picking one in the type select opens ITS subtypes underneath, and those are worded as a share of
  what was booked ("33 booked · 8% · of all IV"), never as a capacity of their own, because they do
  not have one. Only type rows feed the total, or the same booking is counted twice.
- **A month square shows TYPE, painted and counted.** It used to carry three-letter subtype codes
  in 8px grey monospace — MCH, MCF, FF1 — which nobody could read and nobody could decode (Carlos,
  2026-08-12: "what are the initials on the screen?"). Each square now carries the type's own
  colour from the clinic's code with the number booked inside it and the type named in the
  tooltip. A square is too small for a subtype breakdown, and at month scale the question is how
  much IV a week holds, not which bag.
- **`data-close-modal` on the OVERLAY means "click the backdrop", not "click anything".** Every
  click inside a modal bubbles to its overlay, so `closest()` found it and the modal shut the
  moment you touched a select — Carlos could not test the export at all. The handler now ignores
  the event unless it landed on the backdrop itself. Five overlays were affected.
- **The booking engine's dictionaries are generated from the clinic's sheet.** `L_SUBS` (subtype
  follows type) and `L_TX` (the durations and order links behind it) both held the retired
  taxonomy — five invented types and sixteen entries keyed `flow`, `nad`, `ivc`, `gsh` — so the
  subtype select promised "follows the type" and never changed, and the moment it spoke real keys
  every `L_TX` lookup came back undefined. The waitlist had no cascade at all: you could put
  somebody on the list for an IV called "Pellet Males". One source, three screens.
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

## Communication log (added 2026-08-07)

Every contact with a patient — phone, email, text, portal, in person — is logged with the date,
the time and the person who made it, on the patient profile (`patients.html`), with the full
detail one click away at `#/pt-07-comms`. The channel is shown as a **word with a border style**,
never a colour: "we phoned her" is not a clinical status and must not borrow the status palette.
Entries cannot be edited or deleted; a correction is a new entry that links to the one it corrects.

## Buttons must not lie (added 2026-07-31)

A button that announces "added" and changes nothing is worse than a dead button,
because the reviewer believes it. Declarative attributes in `assets/hcos.js`:

- `data-row-add` appends a blank row to the list that follows the button
- `data-row-del` removes the row the button sits in
- a button may instead carry `data-activate` when the real outcome is navigation

`check.sh` fails the build on any button whose toast claims a change it cannot
make. Chips in a "tick everything that applies" group must carry `multi`, or
answering one silently unticks the last.

## Screen approval (added 2026-08-06)

Every screen carries a review bar above it, in the wireframe chrome — never in
product UI. **Mark approved** turns it green and puts a green tick on that
screen's chip, so the chip row shows at a glance which screens are settled and
which still want work. The bar also counts: "4 of 7 screens on this page
approved".

- Stored per browser in `localStorage` under `hcos-approved-v1`, keyed
  `page/screen-id`, alongside the person's own notes.
- **Export my notes** now exports `{ notes, approved }` together, so an
  approval travels the same way feedback does and Carlos can merge both.
- The green is `--review-ok #1E7A3E`, its own token. It is deliberately not the
  clinical in-progress green and not the dashboard trend green: a review state
  is not a clinical status, and the three must be retunable apart.

## Data rules

**No PHI, ever.** Patients, appointments, notes, and claims in the wireframe are always synthetic. Clinic identity (name, address, phone, NPI) and staff first names are fine — they are the real users. Do not put the clinic TIN, payer account numbers, or any real patient detail anywhere in this repo.

## Working style and validation

- One page per commit when possible; imperative messages.
- Before finishing any task: pages load from `file://` with zero console errors; div balance checked (`grep -o '<div' page.html | wc -l` vs `</div>`); every screen id unique; every screen has the feedback widget; all hub links resolve; JS syntax checked (`node -e "new Function(require('fs').readFileSync('assets/hcos.js','utf8'))"`).
- When in doubt about domain content, this file wins. When in doubt about look, `design/hcos-v1-design.html` wins. Open questions go to Carlos.

## The condition builder (added 2026-08-12)

**A flag on a timer is guessing.** A pregnancy really does end in about nine months, but a
deficiency clears when the ferritin comes back up, and a missing consent clears when somebody
signs it. For those the honest lifetime is the FACT, so **"Follows a condition" composes that fact
out of things HCOS already holds** — a lab value crossing a threshold, a problem going resolved, an
order signed, a course fully given, a document arriving, a balance reaching zero, a date passing, a
medication discontinued. Eight signal kinds, each a row of signal → test → value, joined with
all/any, on `schedule.html#/l-08-flags-new`.

- **It reads back as one English sentence.** A condition you cannot read out loud is one nobody can
  check against what the clinic actually meant — the same reason the booking rules do it.
- **The default is PROPOSE, not clear.** A flag that clears itself is a flag nobody checked, so the
  condition being met puts it in a queue with the evidence attached and a named role confirms.
  Automatic exists for the cases where the data IS the answer — a balance reaching zero, a consent
  being signed — and is deliberately not the default.
- **Clearing is not deleting.** It comes off the calendar and stays on the record with the reason,
  the evidence, and who confirmed it.
- Anything that cannot be expressed as a row is not a condition the system can watch, and saying so
  is better than accepting words nobody will act on.

## Spacing (Carlos, 2026-08-12: "esta todo muy apretado entre si")

The vertical rhythm was tuned for the CALENDAR, where density is the point, and then reused on
forms, where it reads as a wall. Raised at the **shared components** — `.card`, `.field`,
`.field-help`, `.callout`, `.seg-divider`, `.kv`, `.modal-body`, `.tbl` cells — so it lands on all
187 screens at once rather than the one being looked at. The rule underneath it: **the gap BETWEEN
two groups has to be bigger than any gap inside one**, or nothing groups and the eye has nowhere to
rest. The calendar keeps its own density: the 96px hour row and the 98px block are set in the
day-board rules, not by these.

**A control's escape hatch sits BESIDE it, not under it.** "Clear" stacked below "Remember these
filters" read as a separate feature; they are one thing.

## The page action bar — one standard (Carlos, 2026-08-12)

**Save is never inside a card, and it is always the rightmost thing on the page.**
`<div class="page-actions">` sits outside every card, directly in the `.frame-body`, sticky to the
bottom of the viewport so a long form never hides it. On a two-column screen a Save inside a card
makes the reader work out which card it belongs to — and on the flag screen it had drifted into the
PREVIEW card, saving something it was not part of.

The order is deliberate:

    [ 🗑 destructive ]  ……………  [ note ] [ Cancel ] [ PRIMARY ]

Destructive far left, away from the hand. The consequence note beside the safe actions. Cancel,
then the primary, so the last thing under the cursor is the one you meant. Five screens use it:
add a flag, edit a flag, offer a slot, request an order, edit a block.

**The floating Feedback button is gone (2026-08-12).** It lived bottom-right, which is exactly
where the action bar's primary button now is, and permanent chrome competing with Save is worse
than no launcher. **The widget itself is untouched** — the panel, the pins, the count, the notes
drawer and the export all still work, and `HCOS.openFeedback()` opens it from anywhere. Only the
launcher is unrendered, so the collaboration loop is intact and needs a new home rather than a
rebuild.

**`HCOS.confirm({title, body, consequence, confirm, onConfirm})`** is the only way to do something
irreversible. Cancel holds focus so Enter is always the safe key; the body says the CONSEQUENCE,
not "this cannot be undone"; and the destructive button says what it does, never "OK".

**`HCOS.wireColumns()`** makes every `.tbl` resizable by dragging its header edges. It does not
switch to a fixed layout up front — the automatic widths are a good default, and the first drag
freezes what is on screen. Minimum 60px, because a column dragged to nothing cannot be found again
to drag back. Arrow keys resize a focused grip, double-click resets, widths persist per browser.

## Shared vocabulary (Carlos, 2026-08-12: "we cannot invent every nomenclature each time")

`HCOS` owns one registry and every screen reads it. Resources, hours, days and frequency were
written out by hand per screen, so the same chair was "IV 1 · Nick · Nurse" in one place and
"IV 1 (Nick)" in another.

- **A ROOM IS NOT A DOCTOR.** Every resource carries a **kind** — Provider, IV chair, Room,
  Equipment — and the kind is always shown. `HCOS.resourceOptions()` groups by it,
  `HCOS.resourceChecks()` is the multi-select, `HCOS.resourceLabel(id)` gives "Provider ·
  Dr. Drannikov". Nobody should have to know from memory that Room 2 is a place.
- **`HCOS.hourOptions({from, to, step})`** — every half hour, and 24 of them when a screen asks.
  Four hand-typed options is how a deep clean at 11 PM becomes impossible to schedule.
- **`HCOS.dayChips()` / `HCOS.freqOptions()`** — one day list including **Saturday and Sunday**
  (the clinic opens at the weekend) and one frequency list: Just once, Daily, Weekly, Every two
  weeks, Monthly, Forever.
- Filters name what they filter: **Appointment types**, **Appointment subtypes**, **Appointment
  statuses**. "All types" told you nothing about which types.

### Times are typed, not hunted (Carlos, 2026-08-13)

**Forty-eight options to pick one time is a bad trade.** The list is long BECAUSE it has to reach
3 AM, and 3 AM happens twice a year while 9 AM happens forty times a day — a dropdown makes
everyone pay for the rare case on every single use.

`<input class="time-field" data-mins="480">`, wired by `HCOS.wireTimeFields()`:

- **You type it.** `9` → 9:00 AM · `915` → 9:15 AM · `7pm` → 7:00 PM · `1945` → 7:45 PM. Any
  minute of any hour is reachable, which the 30-minute list could not do at all.
- **A bare 1 to 5 is read as the afternoon**, because at a clinic desk it always is. `3am` still
  gets you 3 AM.
- **Clicking shows the clinic day** (6 AM–8 PM), with the rest of the 24 hours behind one line
  rather than mixed in.
- Read it with `HCOS.timeValue(el)` for minutes and `HCOS.timeText(el)` for the label. **Not
  `.value` for a number** — the value is what the person sees.

`HCOS.hourOptions()` still exists for a genuine `<select>`, but a time somebody chooses should be
a time field.

### One wording for "I'll pick the dates myself" (Carlos, 2026-08-13)

**`Custom range…`**, everywhere, in every dropdown that lets somebody choose their own dates —
whether they pick both ends or only the far one, because the other end is always on the screen
beside it. It had drifted into four wordings: "Custom range…", "A range…", "A date…" and a bare
"Custom…". `HCOS.CUSTOM_RANGE` is the constant and `HCOS.periodOptions({direction, selected})`
builds the whole list, so a new period dropdown cannot invent a fifth.

**A recurrence pattern is not a date and does not get this word.** "Custom…" on the repeat list was
the same mistake wearing a different hat; that list is `HCOS.freqOptions()`.

## Tasks — its own module (Carlos, 2026-08-13)

`tasks.html` + `tasks-rules.html`, in the **Clinic** group of the sidebar, right after Schedule.
It was a screen inside Scheduling and that was wrong: **most of what lands here was raised
somewhere else entirely**, and a queue that lives inside one module is a queue the other modules
cannot reach. Carlos: "es donde vive la administracion de tareas de toda la clinica, es como
Monday".

- **The board is the working view** — To do / Doing / Waiting on someone / Done — and the **list is
  BUILT from the board**, so the two can never disagree. Moving a card is one click ("Move on"),
  not a drag a trackpad fights you on.
- **Most tasks are raised by the software, and the card says so.** An appointment is booked and a
  task appears for whoever confirms it; a patient comes off the waitlist and one appears for the
  front desk; an order goes unsigned and one appears for the provider. `tkRaise({pri, bucket,
  owner, title, body, go, goLbl})` is the hook any module calls.
- **`tasks-rules.html` is why the list can be trusted.** Every rule says what has to happen, whose
  job it becomes, and **how it closes itself**. A rule with no closing condition creates work that
  piles up until people stop reading the whole list — the builder offers "somebody has to close it
  by hand" and calls that out as the option to argue about.
- **Owners are roles, not names** — "Whoever is on the front desk", not "Yazmin". Names go on
  holiday.
- **Turning a rule off does not close the tasks it already raised.** Those were real when they were
  made; it only stops new ones.
- **Dismissing is not doing.** If the system raised it, the cause is still true and it will be
  raised again; the way to stop it is to change the rule.

### The task detail (2026-08-13)

Open button on every card, and clicking the title, both open the same popup — everything about one
task, editable, with its history. Two things it does that a generic editor would not:

- **A system-raised task names the rule that raised it**, and says out loud that editing the wording
  here changes THIS ONE. If it is wrong every time, the rule is what needs changing. Without that
  sentence people quietly fix the same sentence forty times and nobody ever fixes the cause.
- **The activity log includes what the SOFTWARE did**, not only what people did. A task nobody can
  audit is a task nobody trusts, and "raised automatically by rule X at 8:12" is the entry that
  makes the rest believable.

Every edit writes to the log with the name of whoever made it. Saving with an empty title is
refused — a task that does not say what to do is not a task.

### A shared component cannot live inside one page

`.l-filters` and its layout lived in `schedule.html`'s own `<style>`. The Tasks board used the same
markup and got none of the layout — every select rendered full width, stacked. It is in
`assets/hcos.css` now. **If two pages use it, it is not that page's CSS.**

## Patterns can be wrong (2026-08-12)

Every row on `l-09-insights` can be accepted, rejected or deleted, and records **who** did it — a
suggestion nobody has looked at and one a nurse rejected must not look the same. **Rejecting beats
deleting** and the dialog says why: the recorded disagreement is what stops the same thing being
offered next month. A **no-show pattern is marked apart and carries a phone-call action**, because
"Victor no-shows before 10 AM" is only useful if somebody rings Victor.

**The patient profile is one screen and many patients** (`ptOpen(name)`, or `patients.html?pt=Name`).
Ten of them, chosen so every case is reachable — including one with no pattern at all, because
"nothing to say" is a case the design has to handle and the one that gets forgotten.

## Retiring a flag type is two decisions, and only a super admin makes them

Nobody can assign it again — not optional. Then: what happens to the patients who already carry it?
**Keeping is the default** (a documented allergy does not stop being true because the menu changed);
stripping is offered second, for a flag created by mistake or one whose wording should never have
been written.

## Do not wire the DOM on requestAnimationFrame alone

**rAF does not fire in a hidden tab.** Column resizing and the overflow hints were wired in one, so
a page opened in a background tab had neither — and still had neither once you looked at it. They
run immediately, again on `load`, and again on `visibilitychange`. `HCOS.wireTables()` is idempotent.

## Coverage rules (added 2026-08-13, after a run of 20553 denials)

Tom, via Carlos: Medicare and the commercial payers that follow CMS are denying **CPT 20553** for
two reasons — **maximum frequency exceeded** (3 in any rolling 12 months) and **not medically
necessary** (only ten ICD-10 codes are covered, per **CMS Billing and Coding Article A57701**).

**Both denials are decisions somebody made weeks before billing saw them.** By the time a
remittance arrives the injection has been given and the money is gone. So the rule runs at the
moment the clinician chooses the treatment, not at the claim:

- `tools/coverage.py` holds the rules per CPT: the covered ICD-10 list, the frequency limit and
  window, and **the article the rule came from with the date it was last checked**. A coverage rule
  with no source is a rumour, and these articles get revised and retired — an unverified rule shows
  as unverified on `billing.html#/d-04-coverage` rather than pretending.
- The **coverage gate** on `schedule.html#/l-03-book` appears only for a treatment that has a rule.
  It shows how many the patient has had in the window, with dates and who gave them, and asks the
  clinician to pick the covered diagnosis **from the note**.
- **It must never help somebody find a diagnosis that pays.** The list exists so a covered
  diagnosis that IS documented gets coded. If none of them fits, the honest answer is that the
  service is not covered — and the screen says that, then offers the legitimate route: an **ABN
  (CMS-R-131) signed BEFORE the service** and the claim billed with **modifier GA**, so the patient
  can be charged. Without a signed ABN the practice absorbs it; the patient cannot be billed
  afterwards.
- Declining raises a task for the ordering provider rather than silently booking.
- **20552 is one or two muscles, 20553 is three or more.** If the note supports two, no diagnosis
  rescues 20553 — it is the wrong code.
- The frequency count is per patient across **all** providers, so it cannot see injections given
  outside the practice. The screen says so and tells the desk to ask the patient.

## THE SCHEDULING HIERARCHY CHANGED (the clinic's sheet, 2026-08-25)

Carlos: *"necesitamos cambiar la jerarquia en como hace el schedule. Column name significa en el
schedule."* The old two-level type/subtype model cannot express what the clinic actually runs.
**Four levels, and the middle one is the calendar column:**

    ORGANIZING TYPE      what the filters group by — 12 of them
      COLUMN NAME        >>> A COLUMN ON THE DAY BOARD <<< — 35 of them
        APPOINTMENT TYPE what can be booked into that column
          SUBTYPE        from the patient's PLAN OF CARE, not a catalogue

`tools/hierarchy.py` is the source; `treatments.html#/t-08-hierarchy` renders it.

- **A column is a bookable LINE, not a person or a chair.** Dr. Bakman is *two* columns because
  FPE and everything else book by different rules. The BioCharger is *six* because six people sit
  in it at once. This is why the old model could not express it.
- **The subtype list is not static.** It comes from the patient's POC, so booking offers what that
  patient is prescribed — the full IV bag list is never shown to anybody.
- **Seat groups**: Salt Room (4 seats, everyone in a session gets the same meditation) and
  BioCharger (6 seats, same recipe for all). Booking one of these is booking a seat in a session
  that already has a recipe, not an independent slot.
- **Protocol length is not appointment length.** An Erchonia protocol runs 5–20 minutes inside a
  30-minute appointment; a BioCharger recipe 9–30 minutes inside a 30-minute one.
- **A BioCharger STACK is one per day**; single recipes allow up to three.
- Real booking rules now carried as data: add-on only (Erchonia Handheld), can be booked with an IV
  after it starts (Erchonia Laser, NanoVi, Hydrogen), booked along with the IV start (Lab Draw),
  and **Lymph Star must not be the same day as EBOO or within 3 days after — one day before is what
  is recommended**.
- Leigh Ann books through her own app today: HCOS shows it and does not own it.

**The day board is built from it** (`tools/genboard.py`). Carlos, asked how to show it: *"por
organizing type, verlas separadas"*.

- **Forty columns**, one per (organizing type, column name) pair, grouped under twelve
  organizing-type bands, scrolled sideways. The **organizing type is the primary filter** — forty
  columns do not fit on a screen and "show me Infusion" is what the desk actually asks for.
- **Forty columns cannot be scanned, only searched.** Treatment alone has seventeen, and Carlos
  could not find the Erchonia laser by looking. A **Find a column** box beside the view select
  narrows the board by name or organizing type as you type.
- **The "busy elsewhere" block must not lead with a patient name.** It did, so those blocks read as
  appointments in that column and the board became unfollowable — Dr. Bakman - Other looked like
  eight appointments when it had one. It says **"Busy · <the column they are in>"**, and it is
  deliberately recessive: no card, no side bar, no shadow. It is the absence of availability, not a
  thing on the schedule. The patient is not in this column and their name here is noise at best.
- **Generate per RESOURCE, not per column.** The first pass filled every column independently at
  its own load, so a person with two columns came out over-subscribed and one column was almost
  entirely grey. A person has one day; the columns are views of it.
- **Separate columns for the same person is a display choice with a real hazard.** Dr. Drannikov is
  four columns and one man; four columns means the board can show him booked four times at once.
  So every column names the RESOURCE underneath it, two columns sharing a resource share its time,
  and the other columns render the hour as **"in another of their columns"** rather than leaving it
  blank. A blank hour reads as available, and that is exactly how somebody gets double-booked with
  themselves.
