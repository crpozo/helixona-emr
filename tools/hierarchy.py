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
 ('Treatment', 'BioCharger - Chair 1', 'Seat', ['BioCharger'], 'Allowed recipes from POC', 30, ['group:biocharger']),
 ('Treatment', 'BioCharger - Chair 2', 'Seat', ['BioCharger'], 'Allowed recipes from POC', 30, ['group:biocharger']),
 ('Treatment', 'BioCharger - Chair 3', 'Seat', ['BioCharger'], 'Allowed recipes from POC', 30, ['group:biocharger']),
 ('Treatment', 'BioCharger - Chair 4', 'Seat', ['BioCharger'], 'Allowed recipes from POC', 30, ['group:biocharger']),
 ('Treatment', 'BioCharger - Chair 5', 'Seat', ['BioCharger'], 'Allowed recipes from POC', 30, ['group:biocharger']),
 ('Treatment', 'BioCharger - Chair 6', 'Seat', ['BioCharger'], 'Allowed recipes from POC', 30, ['group:biocharger']),

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
