#!/usr/bin/env python3
"""CMS / payer COVERAGE RULES, per CPT code.

Carlos, 2026-08-13, after a run of denials on 20553: the clinic needs the rules
in the software, at the moment the doctor orders the thing, not discovered on a
remittance six weeks later.

Two kinds of rule, because the two denials the clinic is getting are different:
  · a DIAGNOSIS rule — only these ICD-10 codes are considered medically
    necessary for this CPT, so the order must carry one of them;
  · a FREQUENCY rule — this many in a rolling window, counted per patient.

Every rule cites its SOURCE and an "as of" date. A coverage rule with no source
is a rumour, and these get revised and retired — the article below has to be
re-checked against the CMS Medicare Coverage Database before anyone relies on
it. The wireframe says so on the screen rather than pretending otherwise.
"""

RULES = [
 {
  'cpt': '20553',
  'name': 'Trigger point injections — three or more muscles',
  'also': [('20552', 'One or two muscles — a different code with its own rules. '
                     'If the note supports two muscles, 20553 is the wrong code.')],
  'payers': 'Medicare, and the commercial payers that follow CMS',
  'source': 'CMS Billing and Coding Article A57701 — Trigger Point Injections (TPI)',
  'asof': 'As given by Tom, 13 Aug 2026 — NOT yet verified against the live CMS database',
  'freq': {'max': 3, 'window': '12 months', 'basis': 'rolling, per patient, all providers'},
  'dx': [
   ('G44.201', 'Tension-type headache, unspecified, intractable'),
   ('G44.209', 'Tension-type headache, unspecified, not intractable'),
   ('G44.211', 'Episodic tension-type headache, intractable'),
   ('G44.219', 'Episodic tension-type headache, not intractable'),
   ('G44.221', 'Chronic tension-type headache, intractable'),
   ('G44.229', 'Chronic tension-type headache, not intractable'),
   ('M79.10',  'Myalgia, unspecified site'),
   ('M79.11',  'Myalgia of mastication muscle'),
   ('M79.12',  'Myalgia of auxiliary muscles, head and neck'),
   ('M79.18',  'Myalgia, other site'),
  ],
  'treatments': ['tpi'],
 },
]
