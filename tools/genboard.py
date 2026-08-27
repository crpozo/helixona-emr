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
 'BioCharger':'t-biochg','BioCharger 30 min':'t-biochg','BioCharger Stack 60 min':'t-biochg','NanoVi 30 min':'t-minilym','Hydrogen 15 min':'t-scenar',
 'Hydrogen 30 min':'t-scenar','Hydrogen 45 min':'t-scenar','BEMER':'t-biomodr','Rife':'t-nmt',
 'BioMod Pro':'t-biomodp','BioMod Recharge':'t-biomodr','Lymph Star':'t-lymph',
 'Mini-Lymph Star':'t-minilym','Neuro Muscular Therapy (NMT)':'t-nmt','SCENAR':'t-scenar',
 'MEAD Initial':'t-mead','MEAD Reassess':'t-meadre','IV':'t-ff10'}

def types_for(col):
    """Todo lo que entra en esa columna, con su duracion y su organizing type.

    Antes se preguntaba por (banda, columna) porque una columna era esa pareja.
    Ahora la columna es el nombre y atiende varias bandas: el Dr. Drannikov hace
    Office Visit de 30 y Procedure de 60 en la misma linea de su dia."""
    out = []
    for o, c, kind, types, poc, mins, rules in h.COLUMNS:
        if c == col: out += [(t, mins, o) for t in types]
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
            opts = types_for(c['name'])
            if not opts:
                t += 30
                continue
            what, dur, worg = random.choice(opts)
            dur = dur or 30
            # Si el tipo de cita pide un protocolo, el paciente NO puede ser
            # cualquiera: tiene que ser alguien a quien un proveedor se lo haya
            # aprobado en su plan de cuidado. Elegir primero la persona y luego
            # el protocolo es como el board acabo enseñando cuarenta y cuatro
            # reservas que la pantalla de reserva habria rechazado.
            proto = proto_label = None
            cfg = h.TAKES_PROTOCOL.get(what)
            if cfg:
                pool = poc_pool(cfg['catalogue'])
                if not pool:
                    t += 30
                    continue
                who, proto = random.choice(pool)
                proto_label = cfg['label']
            else:
                who = random.choice(PEOPLE)
            if any(t < e and t + dur > s2 for s2, e in taken):
                t += 30
                continue
            taken.append((t, t + dur))
            blocks[c['id']].append((t, dur, who, what, random.choice(ST), proto, proto_label, worg))
            # the SAME minutes are unavailable in this resource's other columns.
            # The held block has to say WHERE they are, and the column name only
            # says that when the columns are named differently. Dr. Drannikov is
            # four columns all called "Dr. Drannikov", so "Busy · Dr. Drannikov"
            # printed inside his own column named the column you were already
            # looking at. When the names collide, the organizing type is the only
            # thing that distinguishes them, so it is what gets shown.
            for other in mine:
                if other['id'] != c['id']:
                    # three steps, first one that actually distinguishes wins:
                    #   the column name  -> Dr. Bakman - FPE vs Dr. Bakman - Other
                    #   the band         -> Drannikov's four, all named the same
                    #   the treatment    -> Energetics, where the band collides too
                    where = c['name']
                    if where == other['name']: where = elsewhere_label(c['org'])
                    if where == other['name']: where = what
                    blocks[other['id']].append((t, dur, where, 'elsewhere', 'busy', None, None, worg))
            t += dur + random.choice([0, 0, 30, 60])
    return cols, blocks


def poc_pool(catalogue):
    """Los pares (paciente, protocolo) que un proveedor ha aprobado de verdad.
    Vacio no es un fallo: significa que nadie tiene ese catalogo aprobado y que
    esa cita no deberia existir en el board."""
    out = []
    for pt, plan in sorted(h.POC_PROTOCOLS.items()):
        for pr in plan.get(catalogue, []):
            out.append((pt, pr))
    return out


def elsewhere_label(org):
    """The organizing type, trimmed for a narrow held block: 'Office Visit - 30'."""
    return org.replace(' min', '').replace(' - ', ' ')


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
    for area in h.AREA_ORDER:
        n = len([c for c in cols if c['area'] == area])
        if not n: continue
        bands.append('            <div class="daycal-band" data-area="%s" style="grid-column:%d / span %d">%s</div>'
                     % (area, i + 1, n, area))
        i += n
    for c in cols:
        heads.append('            <div class="daycal-col-head" data-col="%s" data-area="%s" data-orgs="%s" data-res="%s">%s<span class="sub">%s</span></div>'
                     % (c['id'], c['area'], '|'.join(c['orgs']), c['res'], c['name'], c['who'] or c['kind']))
    for c in cols:
        inner = []
        for t, dur, pt, what, st, proto, proto_label, worg in sorted(blocks[c['id']], key=lambda b: b[:5]):
            ty = TY_OF_ORG.get(worg, 'ty-chiro')
            if st == 'busy':
                # `pt` here carries the COLUMN they are in, not a patient. Naming
                # the patient made these read as appointments in this column,
                # which is exactly what nobody could follow.
                inner.append('''              <div class="cal-appt is-elsewhere" style="top:%dpx;height:%dpx" data-blocked="1" data-st="Elsewhere" data-when="%s" title="Busy in %s">
                <span class="els-t">Busy &middot; %s</span>
              </div>''' % (top(t), height(dur), fmt(t), pt, pt))
                continue
            sub = SUB_OF_TYPE.get(what, 't-fu')
            pattr = (' data-proto="%s" data-proto-label="%s"' % (proto, proto_label)) if proto else ''
            tpl = ('              <div class="cal-appt %s %s %s" style="top:%dpx;height:%dpx"'
                   ' data-appt="A-9%04d" data-open-drawer="#l-appt-drawer" data-st="%s"'
                   ' data-sub="%s" data-days="2" data-pt="%s" data-when="%s" data-tx="%s"'
                   ' data-org="%s"' + pattr + '>\n'
                   '                <span class="cal-appt-sub">%s</span>\n'
                   '                <div class="cal-appt-name">%s</div>\n'
                   '                <div class="cal-appt-time">%s</div>\n'
                   '              </div>')
            inner.append(tpl % (st, sub, ty, top(t), height(dur), random.randint(1000, 9999),
                                st.replace('st-', '').title(), sub, pt, fmt(t), what, worg,
                                what, pt, fmt(t)))
        grid.append('            <div class="daycal-col" data-col="%s" data-area="%s" data-orgs="%s" data-res="%s">\n%s\n            </div>'
                    % (c['id'], c['area'], '|'.join(c['orgs']), c['res'], '\n'.join(inner)))

    hours = []
    for hh in range(OPEN, CLOSE + 1):
        ap = 'AM' if hh < 12 else 'PM'
        h12 = hh if hh <= 12 else hh - 12
        hours.append('              <div class="daycal-hour">%d %s</div>' % (h12, ap))

    tmpl = '64px ' + ' '.join('minmax(158px, 1fr)' for _ in cols)
    return cols, bands, heads, grid, hours, tmpl


if __name__ == '__main__':
    # No escribe schedule.html. El board se pega a mano y a proposito: el fichero
    # tiene diez mil lineas y la ultima vez que un script empalmo a ciegas se
    # llevo la leyenda por delante. Esto imprime el marcado para revisarlo.
    #   python3 tools/genboard.py heads   -> las cabeceras
    #   python3 tools/genboard.py grid    -> las columnas con sus citas
    #   python3 tools/genboard.py check   -> cuenta y valida contra los planes
    import sys as _s
    cols, bands, heads, grid, hours, tmpl = render()
    arg = _s.argv[1] if len(_s.argv) > 1 else 'check'
    if arg == 'heads':  print('\n'.join(bands)); print('\n'.join(heads))
    elif arg == 'grid': print('\n'.join(grid))
    else:
        import re as _re
        html = '\n'.join(grid)
        erch = {n for n, _ in h.ERCHONIA}
        bad = []
        for m in _re.finditer(r'data-pt="([^"]*)"[^>]*data-proto="([^"]*)"', html):
            pt, pr = m.group(1), m.group(2)
            cat = 'erchonia' if pr in erch else 'biocharger'
            if pr not in h.POC_PROTOCOLS.get(pt, {}).get(cat, []):
                bad.append('%s no tiene aprobado "%s"' % (pt, pr))
        print('columnas   : %d (hierarchy.py dice %d)' % (len(grid), len(h.board_columns())))
        print('citas      : %d' % len(_re.findall(r'data-appt=', html)))
        print('protocolos : %d' % len(_re.findall(r'data-proto=', html)))
        print('ocupados   : %d' % len(_re.findall(r'els-t', html)))
        print('sin aprobar: %d' % len(bad))
        for b in bad[:5]: print('   ' + b)
