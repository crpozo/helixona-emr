#!/usr/bin/env python3
"""THE CALENDAR CODE — the clinic's own colour sheet, and the only source for it.

This lived in the session scratchpad until 2026-08-12, when the scratchpad was
wiped and took it with it. CLAUDE.md calls it the single source for the tokens,
the class rules, the status watermarks, the three legends, both filter lists, the
codes screen and the booking dictionaries — a single source that only exists in a
temp directory is not one. Reconstructed from the generated output and committed.

Add or retire a subtype here and re-run, so all of those change together.

A colour only has to be unique WITHIN its type: the type owns the background, so
two subtypes sharing a colour under different types still read apart.
"""

# key, label, background colour
TYPES = [
    ('visit', 'Office Visit', '#B7CDB0'),
    ('proc', 'Procedure', '#A9B9E2'),
    ('energ', 'Energetics', '#F9F0D4'),
    ('lab', 'Labs', '#C5C9E8'),
    ('diag', 'Diagnostics', '#B8CCE4'),
    ('fpe', 'FPE', '#F0C9A0'),
    ('chiro', 'Chiro', '#BDD7EE'),
    ('eboo', 'EBOO', '#E8B4A8'),
    ('laser', 'Laser', '#8B1A1A'),
    ('iv', 'IV', '#FFFFFF'),
]

# type key, subtype key, label, side-bar colour
SUBS = [
    ('visit', 'newpt', 'New patient', '#F02CE0'),
    ('visit', 'npfu', 'New patient FU', '#E4D2DE'),
    ('visit', 'nptoc', 'New patient TOC', '#9E5C78'),
    ('visit', 'fu', 'Follow Up', '#FCFC50'),
    ('proc', 'prp', 'PRP', '#F0982E'),
    ('proc', 'tpi', 'TPI', '#F5D5AE'),
    ('proc', 'pelm', 'Pellet Males', '#7392DA'),
    ('proc', 'pelf', 'Pellet Females', '#D2836E'),
    ('proc', 'proloz', 'Prolozone', '#66FFFF'),
    ('proc', 'micro', 'Microcurrent', '#C0D2A8'),
    ('energ', 'biochg', 'BioCharger', '#E8C24A'),
    ('energ', 'lymph', 'LymphStar', '#3E7A2E'),
    ('energ', 'scenar', 'SCENAR', '#C4472E'),
    ('energ', 'minilym', 'Mini-LymphStar', '#8ABA76'),
    ('energ', 'biomodp', 'BioMod Pro', '#DEE6D2'),
    ('energ', 'biomodr', 'BioMod Recharge', '#C0A028'),
    ('energ', 'nmt', 'NMT', '#4A86DC'),
    ('energ', 'mead', 'MEAD', '#4E8290'),
    ('energ', 'meadre', 'MEAD ReAssessment', '#A8C4CC'),
    ('lab', 'mdl', 'MDL', '#2E1A6E'),
    ('lab', 'quest', 'Quest', '#4E8290'),
    ('lab', 'g6pd', 'G6PD', '#0000F0'),
    ('lab', 'igenex', 'iGenex', '#66FFFF'),
    ('diag', 'diag', 'Diagnostics', '#3E7A2E'),
    ('fpe', 'fpeie', 'FPE - IE', '#F5E4D2'),
    ('fpe', 'fpefu', 'FPE F/U', '#F0982E'),
    ('chiro', 'dcintx', 'DC IN - TX', '#DCB4AC'),
    ('chiro', 'dctx', 'DC - TX', '#B0AED8'),
    ('chiro', 'lasereval', 'Laser Eval', '#5A4A9E'),
    ('chiro', 'medifne', 'MediFNE', '#66FFFF'),
    ('chiro', 'pocrev', 'POC Review', '#9E5C78'),
    ('eboo', 'eboosafe', 'EBOO Safe', '#BA8098'),
    ('eboo', 'ebootx', 'EBOO', '#D2836E'),
    ('laser', 'erchlas', 'Erch Laser', '#8A2CE0'),
    ('laser', 'erccemp', 'ErcCompEmp', '#D8B0A8'),
    ('laser', 'erccpt', 'ErcCompPt', '#EED8D2'),
    ('laser', 'erccvip', 'ErcCompVIP', '#F5EAD2'),
    ('laser', 'erccref', 'ErcCompRef', '#FAF0DC'),
    ('iv', 'cell', 'Cellular Boost', '#2E4450'),
    ('iv', 'chel', 'Chelation', '#F0982E'),
    ('iv', 'cog', 'Cognitive Support', '#C0A028'),
    ('iv', 'iron', 'Core Iron Blend', '#F02CE0'),
    ('iv', 'rest', 'Core Restore', '#DCC0BA'),
    ('iv', 'detox', 'Detox Prime', '#B4CCA0'),
    ('iv', 'ebooiv', 'Eboo Boost', '#0000F0'),
    ('iv', 'amino', 'Essential Aminos', '#D8DCE8'),
    ('iv', 'ff5', 'Foundational Flow 5', '#C4E8E8'),
    ('iv', 'ff10', 'Foundational Flow 10', '#A8E4E8'),
    ('iv', 'ff15', 'Foundational Flow 15', '#66F0F0'),
    ('iv', 'ff20', 'Foundational Flow 20', '#68C4C4'),
    ('iv', 'ff25', 'Foundational Flow 25', '#5AAAAA'),
    ('iv', 'ff50', 'Foundational Flow 50', '#4E8290'),
    ('iv', 'mast', 'Mast Cell', '#FCFC50'),
    ('iv', 'mc15', 'Mega C 15g', '#FAEADC'),
    ('iv', 'mc25', 'Mega C 25g', '#F5D8B4'),
    ('iv', 'mc50', 'Mega C 50g', '#EEC088'),
    ('iv', 'mc75', 'Mega C 75g', '#E8A84E'),
    ('iv', 'mc100', 'Mega C 100g', '#C87824'),
    ('iv', 'migraine', 'Migraine', '#5A4A9E'),
    ('iv', 'mito', 'Mito Boost', '#6E2A4E'),
    ('iv', 'minimb', 'Mini Mito Boost', '#B07A96'),
    ('iv', 'minimbc', 'Mini Mito Boost - Custom', '#C49AAE'),
]

# --sb-none is the fallback for blocked time, which belongs to no type at all
NO_TYPE = '#B4B4B4'

STATES = [('scheduled', 'Scheduled'), ('confirmed', 'Confirmed'), ('arrived', 'Arrived'),
          ('inroom', 'In Progress'), ('inchair', 'In Progress'), ('done', 'Complete'),
          ('locked', 'Locked'), ('rescheduled', 'Rescheduled'), ('cancelled', 'Cancelled'),
          ('noshow', 'No show')]

