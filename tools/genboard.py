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
    cols = h.board_columns()
    busy = {}          # resource -> [(start, end, column id, patient, what)]
    blocks = {c['id']: [] for c in cols}

    def free(res, s, e):
        return all(e <= b[0] or s >= b[1] for b in busy.get(res, []))

    for c in cols:
        opts = types_for(c['org'], c['name'])
        if not opts: continue
        # how full this line runs — a provider is busy, a Rife machine is not
        load = {'Provider': .72, 'Staff': .55, 'IV chair': .8, 'Equipment': .4,
                'Room': .35, 'Seat': .3}.get(c['kind'], .4)
        if c['name'] == 'Leigh Ann': load = .25
        t = OPEN * 60
        while t < CLOSE * 60:
            what, dur = random.choice(opts)
            dur = dur or 30
            if random.random() > load or not free(c['res'], t, t + dur):
                t += 30
                continue
            pt = random.choice(PEOPLE)
            st = random.choice(ST)
            busy.setdefault(c['res'], []).append((t, t + dur, c['id'], pt, what))
            blocks[c['id']].append((t, dur, pt, what, st))
            t += dur + random.choice([0, 0, 30])

    # a person's OTHER columns show the time as taken, and say where
    for c in cols:
        for b in busy.get(c['res'], []):
            if b[2] == c['id']: continue
            blocks[c['id']].append((b[0], b[1] - b[0], b[3], 'elsewhere', 'busy'))
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
                inner.append('''              <div class="cal-appt is-elsewhere" style="top:%dpx;height:%dpx" data-blocked="1" data-st="Elsewhere" data-when="%s">
                <div class="cal-appt-name">%s</div>
                <div class="cal-appt-note">In another of their columns</div>
              </div>''' % (top(t), height(dur), fmt(t), pt))
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
