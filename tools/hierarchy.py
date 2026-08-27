#!/usr/bin/env python3
"""THE CLINIC'S SCHEDULING HIERARCHY (Carlos, 2026-08-25, from the clinic sheet).

This replaces the two-level type/subtype model. The sheet has FOUR levels and
the middle one is the thing the old model had no name for:

    ORGANIZING TYPE        what the filters group by
      COLUMN NAME          >>> A COLUMN ON THE DAY BOARD <<<
        APPOINTMENT TYPE   what can be booked into that column
          SUBTYPE          determined from the patient's PLAN OF CARE

"Column name significa en el schedule" — the second level IS the calendar
column. That is the change: a column is not a person, it is a bookable line.
The same person can be two columns (Dr. Bakman - FPE and Dr. Bakman - Other
have different rules), and a machine can be six (BioCharger Chair 1 to 6).

The subtype list is NOT static. It comes from the patient's POC, so the booking
screen offers what that patient is actually prescribed, not the whole catalogue.
"""

# organizing type, column name, kind, appointment types, from the POC, minutes, rules
COLUMNS = [
 # ---- providers ----
 ('Office Visit - 30 min', 'Dr. Drannikov', 'Provider',
  ['Follow-Up', 'Transfer of Care', 'Telemedicine'], '', 30, []),
 ('Office Visit - 60 min', 'Dr. Drannikov', 'Provider',
  ['New Patient', 'New Patient F/U'], '', 60, []),
 ('Procedure - 30 min', 'Dr. Drannikov', 'Provider',
  ['Trigger Point', 'Prolozone', 'PRP', 'Female Pellet', 'Male Pellet'], '', 30, []),
 ('Procedure - 60 min', 'Dr. Drannikov', 'Provider',
  ['Acupuncture', 'Microcurrent'], '', 60, []),
 ('Office Visit - 30 min', 'Mira', 'Provider',
  ['Follow-Up', 'Telemedicine', 'Transfer of Care'], '', 30, []),
 ('Office Visit - 60 min', 'Mira', 'Provider',
  ['New Patient', 'New Patient F/U'], '', 60, []),
 ('Office Visit - 30 min', 'Dr. Bakman - FPE', 'Provider',
  ['FPE', 'Medicare FPE', 'FPE FU'], 'Program determines timing of booking this', 30, []),
 ('Office Visit - 30 min', 'Dr. Bakman - Other', 'Provider',
  ['Chiropractic Visit', 'Laser Eval', 'POC Review'], 'POC determines if this can book', 30, []),
 ('Office Visit - 60 min', 'Leigh Ann', 'Provider',
  ['Depth Psychology'], 'Books through her own app today', 60, ['external']),
 ('Office Visit', 'MA Office Visit', 'Staff',
  ['GLP Injection', 'Vitals', 'Nasal Swabs', 'EKG'], '', 15, []),

 # ---- infusion ----
 ('Infusion', 'Medic IV', 'IV chair', ['IV'], 'IV bag determined by POC — only prescribed bags', 30, []),
 ('Infusion', 'Nurse IV 1', 'IV chair', ['IV'], 'IV bag determined by POC — only prescribed bags', 30, []),
 ('Infusion', 'Nurse IV 2', 'IV chair', ['IV'], 'IV bag determined by POC — only prescribed bags', 30, []),

 # ---- lab ----
 ('Lab', 'Lab Draw', 'Room', ['Quest Lab Draw', 'MDL', 'G6PD'], 'Lab orders from POC', 30,
  ['with-iv-start']),
 # la misma linea, filtrada tambien como Infusion: la extraccion entra con el
 # arranque de la IV y el escritorio la busca ahi (Carlos, 2026-08-26)
 ('Infusion', 'Lab Draw', 'Room', ['Quest Lab Draw', 'MDL', 'G6PD'], 'Lab orders from POC', 30,
  ['with-iv-start']),

 # ---- diagnostics ----
 ('Diagnostics', 'Diagnostic Testing', 'Equipment', ['Diagnostic Testing'],
  'Functional neuro testing', 60, []),
 ('Diagnostics', 'InBody', 'Equipment', ['InBody'], 'InBody scan only', 15, []),

 # ---- treatment ----
 ('Treatment', 'Red Light', 'Equipment', ['Red Light Bed'],
  'POC determines duration — possible titrate', 60, ['survey-titrate']),
 ('Treatment', 'Erchonia Laser', 'Equipment', ['Erchonia Laser'],
  'Protocol from POC — list all POC-approved protocols', 30, ['with-iv-after-start']),
 ('Treatment', 'Erchonia Handheld', 'Equipment', ['Erchonia Handheld'],
  'Protocol from POC', 30, ['add-on-only', 'with-erchonia-or-iv']),
 ('Treatment', 'ADA Nano Tub Room', 'Room', ['Hydrogen', 'Oxygen'],
  'POC determines hydrogen or oxygen', 60, []),
 ('Treatment', 'Nano Tub Room', 'Room', ['Hydrogen', 'Oxygen'],
  'POC determines hydrogen or oxygen', 60, []),
 ('Treatment', 'Eboo Chair 1', 'Equipment', ['EBOO', 'EBOO SAFE'], 'POC determines which', 120, []),
 ('Treatment', 'Eboo Chair 2', 'Equipment', ['EBOO', 'EBOO SAFE'], 'POC determines which', 120, []),
 ('Treatment', 'Salt Room - Chair 1', 'Seat', ['Halo Salt Therapy'], '', 60, ['group:salt']),
 ('Treatment', 'Salt Room - Chair 2', 'Seat', ['Halo Salt Therapy'], '', 60, ['group:salt']),
 ('Treatment', 'Salt Room - Chair 3', 'Seat', ['Halo Salt Therapy'], '', 60, ['group:salt']),
 ('Treatment', 'Salt Room - Chair 4', 'Seat', ['Halo Salt Therapy'], '', 60, ['group:salt']),
 ('Treatment', 'BioCharger - Chair 1', 'Seat', ['BioCharger 30 min', 'BioCharger Stack 60 min'], 'Allowed recipes from POC', 30, ['group:biocharger']),
 ('Treatment', 'BioCharger - Chair 2', 'Seat', ['BioCharger 30 min', 'BioCharger Stack 60 min'], 'Allowed recipes from POC', 30, ['group:biocharger']),
 ('Treatment', 'BioCharger - Chair 3', 'Seat', ['BioCharger 30 min', 'BioCharger Stack 60 min'], 'Allowed recipes from POC', 30, ['group:biocharger']),
 ('Treatment', 'BioCharger - Chair 4', 'Seat', ['BioCharger 30 min', 'BioCharger Stack 60 min'], 'Allowed recipes from POC', 30, ['group:biocharger']),
 ('Treatment', 'BioCharger - Chair 5', 'Seat', ['BioCharger 30 min', 'BioCharger Stack 60 min'], 'Allowed recipes from POC', 30, ['group:biocharger']),
 ('Treatment', 'BioCharger - Chair 6', 'Seat', ['BioCharger 30 min', 'BioCharger Stack 60 min'], 'Allowed recipes from POC', 30, ['group:biocharger']),

 # ---- treatment inside the infusion suite ----
 ('Treatment Infusion Suite', 'NanoVi 1', 'Equipment', ['NanoVi 30 min'],
  'POC determines if recommended, and the duration', 30, ['with-iv-after-start']),
 ('Treatment Infusion Suite', 'NanoVi 2', 'Equipment', ['NanoVi 30 min'],
  'POC determines if recommended, and the duration', 30, ['with-iv-after-start']),
 ('Treatment Infusion Suite', 'Hydrogen Inhalation', 'Equipment',
  ['Hydrogen 15 min', 'Hydrogen 30 min', 'Hydrogen 45 min'],
  'POC determines duration and concentration', 30, ['with-iv-after-start']),
 ('Treatment Infusion Suite', 'BEMER', 'Equipment', ['BEMER'],
  'POC determines the level of treatment', 30, []),
 ('Treatment Infusion Suite', 'Rife', 'Equipment', ['Rife'], 'Recipes from POC', 30, []),

 # ---- energetics: ONE column, many appointment types ----
 ('Energetics', 'Energetics', 'Equipment', ['BioMod Pro'], '', 60, []),
 ('Energetics', 'Energetics', 'Equipment', ['BioMod Recharge'], '', 30, []),
 ('Energetics', 'Energetics', 'Equipment', ['Lymph Star'], '', 60, ['eboo-spacing']),
 ('Energetics', 'Energetics', 'Equipment', ['Mini-Lymph Star'], '', 30, ['eboo-spacing']),
 ('Energetics', 'Energetics', 'Equipment', ['Neuro Muscular Therapy (NMT)'], '', 60, []),
 ('Energetics', 'Energetics', 'Equipment', ['SCENAR'], '', 60, []),
 ('Energetics/Diagnostic', 'Energetics', 'Equipment', ['MEAD Initial'], '', 60, []),
 ('Energetics/Diagnostic', 'Energetics', 'Equipment', ['MEAD Reassess'], '', 30, []),
]

# the booking rules, written once and read by the booking screen
RULES = {
 'add-on-only':        'Add-on only — it cannot be the reason for the visit.',
 'with-iv-after-start': 'Can be booked with an IV, after the IV has started.',
 'with-erchonia-or-iv': 'Can be booked alongside the Erchonia Laser, or an IV.',
 'with-iv-start':      'Booked along with the IV start.',
 'eboo-spacing':       'Not the same day as EBOO, and not for 3 days after. One day BEFORE is what is recommended.',
 'survey-titrate':     'A survey goes out during the titrate, asking about reactions.',
 'external':           'Books through her own app today — HCOS shows it but does not own it.',
}

# a seat group: several columns that are one machine or one room
GROUPS = {
 'salt':       {'name': 'Salt Room', 'seats': 4,
                'same': 'Everyone in a session has the same meditation.'},
 'biocharger': {'name': 'BioCharger', 'seats': 6,
                'same': 'Everyone in a session has the same recipe.'},
}

# the IV bags, offered only if the POC prescribes them
IV_BAGS = ['Foundational Flow 5', 'Foundational Flow 10', 'Foundational Flow 15',
           'Foundational Flow 20', 'Foundational Flow 25', 'Foundational Flow 50',
           'Cellular Boost', 'Mast Cell', 'Mast Cell - Benadryl Only', 'Cognitive Support',
           'Core Iron Blend', 'Core Restore', 'Detox Prime', 'Essential Amino',
           'Mega C 100', 'Mega C 15', 'Mega C 25', 'Mega C 50', 'Mega C 75',
           'Mini Cust', 'Mini MB', 'Mito Boost', 'EBOO Boost IV']

# Erchonia protocols — protocol length, which is NOT the appointment length
ERCHONIA = [('Head & Cerebellum',5),('Shoulder',10),('Wrist/hand',10),('Knee',10),('Heel',10),
 ('Neck',10),('Elbow',10),('Low Back',20),('Ankle/Foot',10),('Acute Pain',10),
 ('Level 1 Brain',5),('Level 2 Brain',10),('Emotional Stress',8),('Sympathetic Calm',7),
 ('Parasympathetic Facilitation',8),('Level 1 Gut',5),('Level 2 Gut',10),('Inflammation',10),
 ('Parasites 1',7),('Parasites 2',8),('Lyme',8),('EBV',8),('Infection',8),('Digestion',8),
 ('Indigestion',8),('Allergy',9),('Immune Enhance',10),('Hormone Balance',7),
 ('Plantar Fasciitis',7),('Chronic Pain',10),('Lymphatic',10),('Weight Loss Trial',20),
 ('Large Intestines',10),('Small Intestines',10),('General Musculoskeletal',10),
 ('Neuro Inflammation',10)]

# BioCharger recipes — recipe length, which is NOT the appointment length.
# A STACK is one-per-day; a single recipe allows up to three.
BIOCHARGER = [
 ('Abundance', 'Enhance attraction to abundance', 15, False),
 ('Autoimmune Support', 'Assist in immune balance', 15, False),
 ('Cryo Nervous System', 'Adjunctive support for the nervous system', 17, False),
 ('Epstein Support', 'Support for chronic fatigue', 10.5, False),
 ('Heavy', 'Assist with clearing heavy metals', 9.1, False),
 ('Immune Strong', 'Support and strengthen the immune system', 30, False),
 ('Integrative Circulatory Lymphatic', 'Support for circulation and the lymphatic system', 17, False),
 ('Lymph Liver Kidney Support', 'Support for lymph, liver and kidneys', 15, False),
 ('Mitochondrial Support', 'Support mitochondrial health', 16, False),
 ('Afungusamongus', 'Help support fungal infections', 19.5, False),
 ('Brain Support Stack', 'Support, balance and stimulate the brain', 25, True),
 ('Depressive Disorder Support', 'Support for depressive disorder and related conditions', 11, False),
 ('General Wellness', 'Very effective general sweep', 12, False),
 ('Hormonal Balance', 'Support for menopausal women', 20, False),
 ('Inflammation Support', 'Help with generalized inflammation', 22, False),
 ('Lyme Defense Stack', 'Support detox of lymph, liver and kidney systems', 25, True),
 ('Mindfulness Grounding', 'Adjunctive support for relaxation', 17, False),
 ('Mold Cleansing Stack', "Support the body's natural defense against mold and fungal challenges", 25, True),
 ('PurifyRecover', 'Support purification and revitalization', 22, False),
 ('Wellness Mental Clarity', 'Supports mental clarity and cognition', 17, False),
 ('Rib Support', 'Support for the rib area', 14, False),
]


# ---------------------------------------------------------------------------
# THE PHYSICAL THING BEHIND A COLUMN (Carlos, 2026-08-25: see them separated).
#
# The clinic wants Office Visit - 30 and Office Visit - 60 as SEPARATE columns,
# even when both are Dr. Drannikov. That is a display decision and it is fine —
# but he is one person. Four columns for one man means the board can show him
# booked four times at once unless something stops it.
#
# So every column names the RESOURCE underneath it. Two columns sharing a
# resource share its time: booking one blocks the same minutes in the others,
# and the others show why rather than looking free.
# ---------------------------------------------------------------------------
RESOURCE_OF = {
 'Dr. Drannikov': 'drannikov', 'Mira': 'mira',
 'Dr. Bakman - FPE': 'bakman', 'Dr. Bakman - Other': 'bakman',
 'Leigh Ann': 'leighann', 'MA Office Visit': 'ma',
 'Medic IV': 'iv-medic', 'Nurse IV 1': 'iv-n1', 'Nurse IV 2': 'iv-n2',
 'Lab Draw': 'lab', 'Diagnostic Testing': 'diag', 'InBody': 'inbody',
 'Red Light': 'redlight', 'Erchonia Laser': 'erch', 'Erchonia Handheld': 'erch-hand',
 'ADA Nano Tub Room': 'ada-tub', 'Nano Tub Room': 'nano-tub',
 'Eboo Chair 1': 'eboo1', 'Eboo Chair 2': 'eboo2',
 'NanoVi 1': 'nanovi1', 'NanoVi 2': 'nanovi2',
 'Hydrogen Inhalation': 'h2', 'BEMER': 'bemer', 'Rife': 'rife',
 'Energetics': 'energetics',
}
for _i in range(1, 5): RESOURCE_OF['Salt Room - Chair %d' % _i] = 'salt%d' % _i
for _i in range(1, 7): RESOURCE_OF['BioCharger - Chair %d' % _i] = 'bio%d' % _i

# who is behind a resource, for the column head
RESOURCE_WHO = {
 'drannikov': 'Dr. Drannikov · Physician', 'mira': 'Mira · Provider',
 'bakman': 'Dr. Bakman · Physician', 'leighann': 'Leigh Ann · Depth Psychology',
 'ma': 'Charlene · Medical Assistant', 'iv-medic': 'Bea · Medic',
 'iv-n1': 'Nick · Nurse', 'iv-n2': 'Juan · Nurse', 'lab': 'Wesley · MA',
}

# ---------------------------------------------------------------------------
# EL ORGANIZING TYPE ES UN FILTRO, NO UNA BANDA (Carlos, 2026-08-26).
#
#   "estas son las columnas en el schedule (no repitas, por ejemplo pon solo 1
#    Dr. Drannikov)" ... "Necesitamos que el filtro org type tenga solo esto ...
#    no hagas que se repita"
#
# Antes una columna era la pareja (organizing type, nombre), y por eso el Dr.
# Drannikov salia CUATRO veces en el tablero: una por cada organizing type que
# atiende. Eso no es lo que la clinica ve. El es un hombre y una linea.
#
# La columna es el NOMBRE. El organizing type describe el TIPO DE CITA que entra
# en ella, no la columna: el Dr. Drannikov atiende Office Visit de 30 y de 60 y
# Procedure de 30 y de 60 en la misma linea de su dia. Asi que el organizing
# type vive en el filtro — doce, sin repetir — y el tablero dibuja treinta y
# cinco columnas.
#
# La banda de encima ya no puede ser el organizing type (una columna pertenece a
# varios). Es el AREA: donde esta la linea fisicamente, que si es una sola cosa.
# ---------------------------------------------------------------------------
ORG_ORDER = ['Office Visit - 30 min', 'Office Visit - 60 min', 'Office Visit',
             'Procedure - 30 min', 'Procedure - 60 min', 'Infusion', 'Lab',
             'Diagnostics', 'Treatment', 'Treatment Infusion Suite',
             'Energetics', 'Energetics/Diagnostic']

AREA_ORDER = ['Providers & staff', 'Infusion', 'Lab', 'Diagnostics',
              'Treatment', 'Treatment Infusion Suite', 'Energetics']

AREA_OF = {
 'Dr. Drannikov': 'Providers & staff', 'Mira': 'Providers & staff',
 'Dr. Bakman - FPE': 'Providers & staff', 'Dr. Bakman - Other': 'Providers & staff',
 'Leigh Ann': 'Providers & staff', 'MA Office Visit': 'Providers & staff',
 'Medic IV': 'Infusion', 'Nurse IV 1': 'Infusion', 'Nurse IV 2': 'Infusion',
 'Lab Draw': 'Lab',
 'Diagnostic Testing': 'Diagnostics', 'InBody': 'Diagnostics',
 'Red Light': 'Treatment', 'Erchonia Laser': 'Treatment', 'Erchonia Handheld': 'Treatment',
 'ADA Nano Tub Room': 'Treatment', 'Nano Tub Room': 'Treatment',
 'Eboo Chair 1': 'Treatment', 'Eboo Chair 2': 'Treatment',
 'NanoVi 1': 'Treatment Infusion Suite', 'NanoVi 2': 'Treatment Infusion Suite',
 'Hydrogen Inhalation': 'Treatment Infusion Suite', 'BEMER': 'Treatment Infusion Suite',
 'Rife': 'Treatment Infusion Suite',
 'Energetics': 'Energetics',
}
for _i in range(1, 5): AREA_OF['Salt Room - Chair %d' % _i] = 'Treatment'
for _i in range(1, 7): AREA_OF['BioCharger - Chair %d' % _i] = 'Treatment'


def board_columns():
    """Una columna por NOMBRE. Treinta y cinco lineas reservables.

    Cada una lleva TODOS los organizing types que atiende y todos sus tipos de
    cita, porque el filtro pregunta por el tipo de cita y la columna responde.
    """
    seen, out = {}, []
    for org, col, kind, types, poc, mins, rules in COLUMNS:
        if col in seen:
            c = seen[col]
            if org not in c['orgs']: c['orgs'].append(org)
            for t in types:
                if t not in c['types']: c['types'].append(t)
            if poc and poc not in c['poc']: c['poc'].append(poc)
            c['mins'][org] = mins
            for r in rules:
                if r not in c['rules']: c['rules'].append(r)
            continue
        c = {'name': col, 'kind': kind,
             'area': AREA_OF.get(col, 'Treatment'),
             'orgs': [org], 'types': list(types),
             'poc': [poc] if poc else [],
             'mins': {org: mins}, 'rules': list(rules),
             'res': RESOURCE_OF.get(col, col.lower().replace(' ', '-')),
             'who': RESOURCE_WHO.get(RESOURCE_OF.get(col, ''), ''),
             'id': col.lower().replace(' ', '').replace('-', '').replace('/', '').replace('.', '')}
        seen[col] = c
        out.append(c)
    for i, c in enumerate(out): c['_seq'] = i
    out.sort(key=lambda c: (AREA_ORDER.index(c['area']), c['_seq']))
    return out


def org_types():
    """Los doce organizing types del filtro, en el orden de la clinica, sin repetir."""
    used = {org for org, *_ in COLUMNS}
    return [o for o in ORG_ORDER if o in used]


def columns_for_org(org):
    """Que columnas atienden un organizing type — para que el filtro sepa que ocultar."""
    return [c for c in board_columns() if org in c['orgs']]



# ---------------------------------------------------------------------------
# PROTOCOLS AND RECIPES (Carlos, 2026-08-25).
#
# "The protocols would be the options within the Plan of Care that the provider
#  can select for the patient... The protocols would be separate from the
#  appointment type itself."
#
# So a protocol is NOT a subtype and not a fourth rung on the chain. It is a
# SECOND AXIS: you pick the appointment type, and then — for the columns that
# take one — you pick which protocol the provider ordered, from the ones on that
# patient's plan of care. Two questions, not one narrowing into the other.
#
#   appointment type   WHAT is happening       Erchonia Laser
#   protocol           WHICH ONE was ordered   Low Back · 20 min
#
# An appointment type that takes a protocol cannot be booked without one, and
# the list offered is the approved list for that patient — never the catalogue.
# ---------------------------------------------------------------------------
TAKES_PROTOCOL = {
 'Erchonia Laser':    {'label': 'Protocol', 'catalogue': 'erchonia', 'required': True,
                       'max': 1,
                       'help': 'The protocol the provider ordered. Its length is not the '
                               'appointment length — a 5-minute protocol still books 30 minutes.'},
 'Erchonia Handheld': {'label': 'Protocol', 'catalogue': 'erchonia', 'required': True,
                       'max': 1,
                       'help': 'Add-on only, and it still needs its own ordered protocol.'},
 # la clinica partio el tipo en dos: 30 min para recetas sueltas y 60 para un
 # stack, que corre solo. El eje del protocolo es el mismo en ambos.
 'BioCharger 30 min': {'label': 'Recipe', 'catalogue': 'biocharger', 'required': True,
                       'max': 3,
                       'help': 'Up to three single recipes, run in sequence inside the 30 minutes. '
                               'A stack does not go here — it has its own 60-minute type.'},
 'BioCharger Stack 60 min': {'label': 'Recipe', 'catalogue': 'biocharger', 'required': True,
                       'max': 1,
                       'help': 'One stack, one patient, one day. It runs on its own.'},
 'BioCharger':        {'label': 'Recipe', 'catalogue': 'biocharger', 'required': True,
                       'max': 3,
                       'help': 'A STACK is one per patient per day. Single recipes: up to three, '
                               'and the session runs them in sequence.'},
 # La hoja de la clinica dice "Recipes from POC" para Rife, asi que la exigencia
 # es real. El catalogo no lo es todavia: protocols('rife') devuelve [] porque
 # nadie nos ha dado la lista, y no se inventa. Mientras siga vacio el board no
 # puede mostrar citas de Rife y check.sh lo impide — la columna existe y esta
 # vacia, que es la verdad, en vez de llena de recetas que nadie receto.
 'Rife':              {'label': 'Recipe', 'catalogue': 'rife', 'required': True, 'max': 1,
                       'help': 'From the plan of care. The clinic has not supplied the recipe '
                               'list yet, so nothing can be booked into this column.'},
}

# what a provider has approved on ONE patient's plan of care. Every patient who
# appears on the day board with a protocol MUST be here, or the board is showing
# a booking the booking screen would have refused. Two empty lists are deliberate
# and load-bearing: Walter Hsu has no BioCharger recipe and Ben Okonkwo no Erchonia
# protocol, which is how the empty state can be seen at all.
# what a provider has approved on ONE patient's plan of care. This is the list
# the booking screen offers — the catalogue above is what a provider chooses
# FROM when writing the plan, and the desk never sees it.
POC_PROTOCOLS = {
 'Amara Diallo': {
   'erchonia':  ['Neck', 'Acute Pain'],
   'biocharger': ['General Wellness', 'Brain Support Stack'],
 },
 'Ben Okonkwo': {
   'erchonia':  [],
   'biocharger': ['Mold Cleansing Stack'],
 },
 'Daniel Okafor': {
   'erchonia':  ['Acute Pain', 'Inflammation'],
   'biocharger': ['General Wellness', 'Mindfulness Grounding'],
 },
 'Elena Petrova': {
   'erchonia':  [],
   'biocharger': ['Brain Support Stack', 'Lyme Defense Stack'],
 },
 'Grace Lindqvist': {
   'erchonia':  ['Lymphatic'],
   'biocharger': ['Brain Support Stack', 'General Wellness', 'Immune Strong', 'Mindfulness Grounding'],
 },
 'Hana Sato': {
   'erchonia':  [],
   'biocharger': ['Brain Support Stack', 'General Wellness', 'Immune Strong'],
 },
 'Katherine Olsen': {
   'erchonia':  [],
   'biocharger': ['General Wellness'],
 },
 'Marcus Webb': {
   'erchonia':  ['Acute Pain'],
   'biocharger': ['General Wellness', 'Immune Strong', 'Lyme Defense Stack', 'Mindfulness Grounding'],
 },
 'Maya Reyes': {
   'erchonia':  ['Level 2 Brain', 'Neuro Inflammation', 'Emotional Stress', 'Sympathetic Calm', 'Low Back'],
   'biocharger': ['Brain Support Stack', 'Mindfulness Grounding', 'Wellness Mental Clarity'],
 },
 'Nadia Boulos': {
   'erchonia':  ['Acute Pain'],
   'biocharger': ['Immune Strong', 'Lyme Defense Stack'],
 },
 'Nina Kowalski': {
   'erchonia':  [],
   'biocharger': ['Immune Strong'],
 },
 'Owen Delacroix': {
   'erchonia':  ['Knee'],
   'biocharger': ['General Wellness'],
 },
 'Priya Natarajan': {
   'erchonia':  ['Low Back', 'Inflammation', 'Lymphatic', 'Acute Pain'],
   'biocharger': ['Lyme Defense Stack', 'Immune Strong', 'Lymph Liver Kidney Support', 'Brain Support Stack'],
 },
 'Rosa Iglesias': {
   'erchonia':  [],
   'biocharger': ['Immune Strong', 'Lyme Defense Stack'],
 },
 'Samir Haddad': {
   'erchonia':  ['Chronic Pain'],
   'biocharger': ['General Wellness'],
 },
 'Sofia Ramos': {
   'erchonia':  ['Lymphatic'],
   'biocharger': ['Immune Strong'],
 },
 'Tom Alvarez': {
   'erchonia':  [],
   'biocharger': ['General Wellness', 'Immune Strong', 'Lyme Defense Stack'],
 },
 'Victor Reyes': {
   'erchonia':  ['Chronic Pain'],
   'biocharger': [],
 },
 'Walter Hsu': {
   'erchonia':  ['Knee', 'Chronic Pain'],
   'biocharger': [],
 },
 'Yuki Tanaka': {
   'erchonia':  [],
   'biocharger': ['General Wellness', 'Immune Strong', 'Lyme Defense Stack'],
 },
}


def protocols(catalogue):
    """The full catalogue a provider picks from when writing a plan of care."""
    if catalogue == 'erchonia':
        return [(n, '%d min' % m, False) for n, m in ERCHONIA]
    if catalogue == 'biocharger':
        return [(n, '%g min' % ln, st) for n, d, ln, st in BIOCHARGER]
    return []
