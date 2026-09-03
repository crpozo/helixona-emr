#!/usr/bin/env python3
"""THE BOOKING VOCABULARY, FROM THE SHEET (Carlos, 2026-09-02: "no te olvides de
agregar la nueva estructura a las otras pantallas").

The booking screen, the waitlist, request-an-order and four filters still spoke
the colour palette: ten categories and sixty-two subtypes keyed `newpt`,
`ff10`, `mc100`. The board and the filter bar had already moved to the clinic's
sheet — Department → Column → Appointment type → Sub type. This module is the
bridge: it emits ONE JavaScript block, generated from hierarchy.py, that every
one of those screens reads, and it maps each sheet subtype onto the palette key
the booking engine (L_TX) already knows, so durations, order links and the
protocol gate carry over instead of being retyped.

TWO TAXONOMIES, STILL. The sheet says "Follow-Up", the palette says "Follow Up";
the sheet has 109 subtypes, the palette 62. Where a name matches after
normalisation (plus the same alias map lResFollow uses) the engine key is
reused. Where it does not, the row's own minutes become the duration and the
entry is marked generated. The count of each is printed so the seam is visible.
"""
import re, json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import hierarchy as H, genboard as G

def norm(x): return re.sub(r'[^a-z0-9]', '', str(x).lower())

# the alias map lives in schedule.html (lResFollow); read it there so there is one
def read_alias(sched):
    blk = sched[sched.index('var ALIAS = {'):]
    blk = blk[:blk.index('};') + 2]
    return dict(re.findall(r"([a-z0-9]+)\s*:\s*'([^']+)'", blk))

def read_ltx_keys(sched):
    i = sched.index('var L_TX = {'); j = sched.index('\n  };', i)
    body = sched[i:j]
    keys = {}
    for m in re.finditer(r"^\s{4}([a-z0-9_]+):\s*\{\s*name:\s*'([^']+)'", body, re.M):
        keys[m.group(1)] = m.group(2)
    return keys

# SHEET NAME -> ENGINE KEY, for the ones the normaliser cannot see are the same
# thing: the sheet says "Trigger Point", the palette says "TPI"; "Female Pellet"
# against "Pellet Females"; "Mega C 100" against "Mega C 100g". Each of these is
# the same appointment under two names, and the engine entry — duration, order
# link, version — belongs to it under either.
SHEET_KEY = {
 'transferofcare': 'nptoc', 'telemedicine': 'npfu', 'triggerpoint': 'tpi',
 'femalepellet': 'pelf', 'malepellet': 'pelm', 'acupuncture': 'micro',
 'fpe': 'fpeie', 'medicarefpe': 'medifne', 'chiropracticvisit': 'dctx',
 'isolationappointment': 'eboosafe', 'mastcellbenadrylonly': 'mast',
 'essentialamino': 'amino', 'megac100': 'mc100', 'megac15': 'mc15', 'megac25': 'mc25',
 'megac50': 'mc50', 'megac75': 'mc75', 'minicust': 'minimbc', 'ebooboostiv': 'ebooiv',
 'diagnostictesting': 'diag', 'inbody': 'diag', 'questlabdraw': 'quest',
 'erchoniahandheld': 'erchlas', 'neuromusculartherapynmt': 'nmt', 'mead': 'mead',
}

def build(sched):
    ALIAS = read_alias(sched)
    LTX = read_ltx_keys(sched)                      # key -> palette name
    by_norm = {norm(v): k for k, v in LTX.items()}   # normalised palette name -> key
    by_norm.update({k: k for k in LTX})              # a key is its own name too
    by_norm.update({k: v for k, v in SHEET_KEY.items() if v in LTX})
    bc = H.board_columns()
    depts = H.departments()
    cols = [{'id': c['id'], 'name': c['name'], 'dept': c['dept'], 'kind': c['kind'],
             'orgs': c['orgs'], 'types': c['types'], 'mins': c['mins'], 'res': c['res']} for c in bc]
    # appointment types with their columns and departments
    types = []
    for o in H.appt_types():
        cs = [c for c in bc if o in c['orgs']]
        types.append({'name': o, 'cols': [c['id'] for c in cs], 'depts': sorted({c['dept'] for c in cs}),
                      'mins': cs[0]['mins'].get(o, 30) if cs else 30, 'ty': G.TY_OF_ORG.get(o, 'ty-chiro')})
    # subtypes: every sheet row's types, with the engine key where the palette knows it
    subs = []; seen = set(); matched = generated = 0
    for org, col, kind, ts, poc, mins, rules in H.COLUMNS + H._erchonia_rows():
        for t in ts:
            if t in seen: continue
            seen.add(t)
            n = norm(t); key = by_norm.get(ALIAS.get(n, n))
            in_types = sorted({o2 for o2, c2, k2, ts2, p2, m2, r2 in H.COLUMNS + H._erchonia_rows() if t in ts2})
            inherited = False
            if not key:
                # a protocol is a subtype of a type the engine knows (Erchonia Laser
                # -> erchlas): it inherits that entry rather than being invented
                for o2 in in_types:
                    k2 = by_norm.get(ALIAS.get(norm(o2), norm(o2)))
                    if k2: key = k2; inherited = True; break
            if key: matched += 1
            else: generated += 1
            in_cols = sorted({c2['id'] for c2 in bc if t in c2['types']})
            subs.append({'name': t, 'key': key or ('gen_' + n), 'gen': not key, 'inh': inherited, 'types': in_types,
                         'cols': in_cols, 'mins': mins, 'iv': org == 'Infusion' and t in H.IV_BAGS,
                         'proto': next((o2 for o2 in in_types if o2 in H.TAKES_PROTOCOL), None),
                         'sb': G.SUB_OF_TYPE.get(t, 't-fu')})
    # a type with no subtypes on the sheet (BioCharger chairs, Rife) is still
    # bookable: what goes in it is the recipe from the plan of care. It gets one
    # pseudo-subtype so the booking cascade always has something to hold.
    have = {t2 for x in subs for t2 in x['types']}
    for t in types:
        if t['name'] in have: continue
        n = norm(t['name']); key = by_norm.get(ALIAS.get(n, n)) or by_norm.get(norm(t['name'].split(' - ')[0]))
        subs.append({'name': t['name'], 'key': key or ('gen_' + n), 'gen': not key, 'inh': bool(key),
                     'types': [t['name']], 'cols': t['cols'], 'mins': t['mins'], 'iv': False,
                     'proto': None, 'sb': G.SUB_OF_TYPE.get(t['name'].split(' - ')[0], 't-fu'), 'pseudo': True})
        if key: matched += 1
        else: generated += 1
    # the protocol gate: a subtype takes one when any of its types matches a
    # TAKES_PROTOCOL entry by prefix ("BioCharger - Chair 3" -> "BioCharger")
    def proto_of(type_names):
        for o in type_names:
            for k in H.TAKES_PROTOCOL:
                if o == k or o.startswith(k + ' '): return k
        return None
    for x in subs: x['proto'] = proto_of(x['types'])
    return {'depts': depts, 'cols': cols, 'types': types, 'subs': subs,
            'matched': matched, 'generated': generated}

def js_block(d):
    return ('  /* THE BOOKING VOCABULARY — generated by tools/genbook.py from hierarchy.py.\n'
            '     Department -> column -> appointment type -> sub type. `key` is the L_TX\n'
            '     entry the engine already knows; `gen` marks a sheet subtype the palette\n'
            '     never had, whose duration is the row\'s own minutes. Do not edit by hand. */\n'
            '  var L_BOOK = ' + json.dumps({k: d[k] for k in ('depts', 'cols', 'types', 'subs')}, ensure_ascii=False) + ';\n')

if __name__ == '__main__':
    sched = open(os.path.join(os.path.dirname(__file__), '..', 'schedule.html')).read()
    d = build(sched)
    print('departamentos %d · columnas %d · tipos %d · subtipos %d' % (len(d['depts']), len(d['cols']), len(d['types']), len(d['subs'])))
    print('subtipos con clave del motor: %d · generados: %d' % (d['matched'], d['generated']))
    print('  de los emparejados, heredados de su tipo: %d' % sum(1 for x in d['subs'] if x['inh']))
    if '--show-gen' in sys.argv:
        for s in d['subs']:
            if s['gen']: print('   gen:', s['name'], '·', ', '.join(s['types']))
