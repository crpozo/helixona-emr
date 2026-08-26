#!/usr/bin/env python3
"""Regenerate the day board from the clinic's hierarchy.

Columns are (organizing type, column name) pairs — 40 of them — grouped under
organizing-type bands, which is what Carlos asked for: "por organizing type,
verlas separadas".

The awkward part this has to get right: several columns share one PERSON.
Dr. Drannikov is four columns. Booking him in one has to block the same minutes
in the other three, and those three must SAY why rather than looking free.
"""
import sys, random
sys.path.insert(0, 'tools')
import hierarchy as h

random.seed(825)
ROW = 96                 # px per hour
OPEN, CLOSE = 6, 19      # 6 AM to 7 PM

def top(mins):   return int((mins - OPEN * 60) * ROW / 60)
def height(dur): return int(dur * ROW / 60) - 2

PEOPLE = ['Maya Reyes','Priya Natarajan','Marcus Webb','Hana Sato','Grace Lindqvist',
 'Walter Hsu','Ben Okonkwo','Amara Diallo','Owen Delacroix','Nina Kowalski','Yuki Tanaka',
 'Sofia Ramos','Tom Alvarez','Rosa Iglesias','Victor Reyes','Daniel Okafor','Liam Fitzgerald',
 'Elena Petrova','Nadia Boulos','Katherine Olsen','Samir Haddad','Nina Kowalski']
ST = ['st-done','st-done','st-inchair','st-arrived','st-confirmed','st-confirmed',
      'st-scheduled','st-scheduled','st-scheduled']

# how the clinic's appointment types map onto the colour code we already have
TY_OF_ORG = {
 'Office Visit - 30 min':'ty-visit','Office Visit - 60 min':'ty-visit','Office Visit':'ty-visit',
 'Procedure - 30 min':'ty-proc','Procedure - 60 min':'ty-proc','Infusion':'ty-iv','Lab':'ty-lab',
 'Diagnostics':'ty-diag','Treatment':'ty-chiro','Treatment Infusion Suite':'ty-chiro',
 'Energetics':'ty-energ','Energetics/Diagnostic':'ty-energ'}
SUB_OF_TYPE = {
 'Follow-Up':'t-fu','Transfer of Care':'t-nptoc','Telemedicine':'t-npfu','New Patient':'t-newpt',
 'New Patient F/U':'t-npfu','Trigger Point':'t-tpi','Prolozone':'t-proloz','PRP':'t-prp',
 'Female Pellet':'t-pelf','Male Pellet':'t-pelm','Acupuncture':'t-micro','Microcurrent':'t-micro',
 'FPE':'t-fpeie','Medicare FPE':'t-fpeie','FPE FU':'t-fpefu','Chiropractic Visit':'t-dctx',
 'Laser Eval':'t-lasereval','POC Review':'t-pocrev','Depth Psychology':'t-fu',
 'GLP Injection':'t-fu','Vitals':'t-fu','Nasal Swabs':'t-fu','EKG':'t-fu',
 'Quest Lab Draw':'t-quest','MDL':'t-mdl','G6PD':'t-g6pd','Diagnostic Testing':'t-nmt',
 'InBody':'t-nmt','Red Light Bed':'t-micro','Erchonia Laser':'t-erchlas',
 'Erchonia Handheld':'t-erchlas','Hydrogen':'t-scenar','Oxygen':'t-scenar',
 'EBOO':'t-ebootx','EBOO SAFE':'t-eboosafe','Halo Salt Therapy':'t-scenar',
 'BioCharger':'t-biochg','NanoVi 30 min':'t-minilym','Hydrogen 15 min':'t-scenar',
 'Hydrogen 30 min':'t-scenar','Hydrogen 45 min':'t-scenar','BEMER':'t-biomodr','Rife':'t-nmt',
 'BioMod Pro':'t-biomodp','BioMod Recharge':'t-biomodr','Lymph Star':'t-lymph',
 'Mini-Lymph Star':'t-minilym','Neuro Muscular Therapy (NMT)':'t-nmt','SCENAR':'t-scenar',
 'MEAD Initial':'t-mead','MEAD Reassess':'t-meadre','IV':'t-ff10'}

def types_for(org, col):
    out = []
    for o, c, kind, types, poc, mins, rules in h.COLUMNS:
        if o == org and c == col: out += [(t, mins) for t in types]
    return out


def build():
    """Fill each RESOURCE's day once, then place each appointment in whichever of
    that resource's columns can take it.

    The first version filled every COLUMN independently and then marked the
    clashes. With two columns per person at 72% each, the person came out
    over-subscribed and one column ended up almost entirely "busy elsewhere" —
    Dr. Bakman - Other had one real appointment and seven grey blocks, which is
    unreadable and is not what the clinic's day looks like. A person has one
    day; the columns are views of it.
    """
    cols = h.board_columns()
    by_res = {}
    for c in cols:
        by_res.setdefault(c['res'], []).append(c)

    blocks = {c['id']: [] for c in cols}
    for res, mine in by_res.items():
        kind = mine[0]['kind']
        load = {'Provider': .62, 'Staff': .5, 'IV chair': .78, 'Equipment': .38,
                'Room': .3, 'Seat': .28}.get(kind, .35)
        if mine[0]['name'] == 'Leigh Ann': load = .22
        taken = []
        t = OPEN * 60
        while t < CLOSE * 60:
            if random.random() > load:
                t += 30
                continue
            # pick a column of this resource, and something it can actually take
            c = random.choice(mine)
            opts = types_for(c['org'], c['name'])
            if not opts:
                t += 30
                continue
            what, dur = random.choice(opts)
            dur = dur or 30
            if any(t < e and t + dur > s2 for s2, e in taken):
                t += 30
                continue
            taken.append((t, t + dur))
            blocks[c['id']].append((t, dur, random.choice(PEOPLE), what, random.choice(ST)))
            # the SAME minutes are unavailable in this resource's other columns
            for other in mine:
                if other['id'] != c['id']:
                    blocks[other['id']].append((t, dur, c['name'], 'elsewhere', 'busy'))
            t += dur + random.choice([0, 0, 30, 60])
    return cols, blocks


def fmt(m):
    hh = m // 60; mm = m % 60
    ap = 'AM' if hh < 12 else 'PM'
    h12 = hh if hh <= 12 else hh - 12
    return '%d:%02d %s' % (h12, mm, ap)


def render():
    cols, blocks = build()
    heads, bands, grid = [], [], []
    # the band row: one per organizing type, spanning its columns
    i = 1
    for org in h.ORG_ORDER:
        n = len([c for c in cols if c['org'] == org])
        if not n: continue
        bands.append('            <div class="daycal-band" data-org="%s" style="grid-column:%d / span %d">%s</div>'
                     % (org, i + 1, n, org))
        i += n
    for c in cols:
        heads.append('            <div class="daycal-col-head" data-col="%s" data-org="%s" data-res="%s">%s<span class="sub">%s</span></div>'
                     % (c['id'], c['org'], c['res'], c['name'], c['who'] or c['kind']))
    for c in cols:
        inner = []
        for t, dur, pt, what, st in sorted(blocks[c['id']]):
            ty = TY_OF_ORG[c['org']]
            if st == 'busy':
                # `pt` here carries the COLUMN they are in, not a patient. Naming
                # the patient made these read as appointments in this column,
                # which is exactly what nobody could follow.
                inner.append('''              <div class="cal-appt is-elsewhere" style="top:%dpx;height:%dpx" data-blocked="1" data-st="Elsewhere" data-when="%s" title="Busy in %s">
                <span class="els-t">Busy &middot; %s</span>
              </div>''' % (top(t), height(dur), fmt(t), pt, pt))
                continue
            sub = SUB_OF_TYPE.get(what, 't-fu')
            inner.append('''              <div class="cal-appt %s %s %s" style="top:%dpx;height:%dpx" data-appt="A-9%04d" data-open-drawer="#l-appt-drawer" data-st="%s" data-sub="%s" data-days="2" data-pt="%s" data-when="%s" data-tx="%s" data-org="%s">
                <span class="cal-appt-sub">%s</span>
                <div class="cal-appt-name">%s</div>
                <div class="cal-appt-time">%s</div>
              </div>''' % (st, sub, ty, top(t), height(dur), random.randint(1000, 9999),
                           st.replace('st-', '').title(), sub, pt, fmt(t), what, c['org'],
                           what, pt, fmt(t)))
        grid.append('            <div class="daycal-col" data-col="%s" data-org="%s" data-res="%s">\n%s\n            </div>'
                    % (c['id'], c['org'], c['res'], '\n'.join(inner)))

    hours = []
    for hh in range(OPEN, CLOSE + 1):
        ap = 'AM' if hh < 12 else 'PM'
        h12 = hh if hh <= 12 else hh - 12
        hours.append('              <div class="daycal-hour">%d %s</div>' % (h12, ap))

    tmpl = '64px ' + ' '.join('minmax(158px, 1fr)' for _ in cols)
    return cols, bands, heads, grid, hours, tmpl
