#!/bin/bash
# Validation gate for the HCOS wireframe. Run before every push.
cd "$(dirname "$0")"
fail=0
for f in *.html; do
  o=$(grep -o '<div' "$f"|wc -l|tr -d ' '); c=$(grep -o '</div>' "$f"|wc -l|tr -d ' ')
  [ "$o" != "$c" ] && { echo "DIV BAD  $f  $o/$c"; fail=1; }
done
python3 - <<'PY' || fail=1
import re, glob, collections, sys
ids={f:set(re.findall(r'class="screen" id="([^"]+)"', open(f).read())) for f in glob.glob('*.html')}
allids=[i for v in ids.values() for i in v]
bad=[]
for f in glob.glob('*.html'):
    s=open(f).read()
    anyid=set(re.findall(r' id="([^"]+)"', s))
    for t,sid in re.findall(r'([a-z0-9-]+\.html)#/([a-z0-9-]+)', s):
        if t not in ids: bad.append(f"{f}: página inexistente {t}")
        elif sid not in ids[t]: bad.append(f"{f}: deep-link roto {t}#/{sid}")
    for m in re.findall(r'data-activate="([^"]+)"', s):
        # a value built at runtime ("' + o.go + '") is a JS expression, not a
        # screen id — the check can only verify literals
        if "'" in m or '+' in m: continue
        if m not in ids[f]: bad.append(f"{f}: data-activate roto → {m}")
    for m in re.findall(r'data-open-modal="#([^"]+)"|data-open-drawer="#([^"]+)"', s):
        tgt=m[0] or m[1]
        if tgt and tgt not in anyid: bad.append(f"{f}: overlay inexistente #{tgt}")
    for m in re.findall(r'href="#/?([a-z0-9-]+)"', s):
        if m not in anyid: bad.append(f"{f}: ancla rota #{m}")
dups=[k for k,v in collections.Counter(allids).items() if v>1]
if dups: bad.append(f"ids de pantalla duplicados: {dups}")
print("\n".join(bad) if bad else f"OK · {len(allids)} pantallas · 0 enlaces rotos")
sys.exit(1 if bad else 0)
PY
node -e "new Function(require('fs').readFileSync('assets/hcos.js','utf8'))" || { 

echo "JS SYNTAX BAD"; fail=1; }

# --- botones que prometen un cambio que no ocurre ---
python3 - <<'PYCHK'
import re, glob, sys
bad = []
for f in sorted(glob.glob('*.html')):
    s = open(f).read()
    for m in re.finditer(r'<button([^>]*)>(.*?)</button>', s, re.S):
        attrs, label = m.group(1), re.sub(r'<[^>]+>', '', m.group(2)).strip()
        oc = re.search(r'onclick="([^"]*)"', attrs)
        if not oc: continue
        t = re.search(r"toast\('([^']{0,80})", oc.group(1))
        if not t: continue
        claim = t.group(1).lower()
        if not re.search(r'\b(added|removed|deleted|created)\b', claim): continue
        # lGo() is this repo's programmatic navigate — the same real outcome
        # data-activate produces, so a button that navigates is not lying
        if re.search(r'document\.|\.remove\(|insertBefore|appendChild|lGo\(', oc.group(1)): continue
        if 'data-row-add' in attrs or 'data-row-del' in attrs: continue
        if 'data-activate' in attrs or 'data-open-modal' in attrs: continue
        bad.append('%s: "%s" dice "%s"' % (f, label[:32], t.group(1)[:44]))
if bad:
    print('BOTONES QUE MIENTEN (%d):' % len(bad))
    for b in bad[:12]: print('  ' + b)
    sys.exit(1)
PYCHK
[ $? -ne 0 ] && fail=1

# --- la jerarquia y lo publicado, en el mismo numero ---
# tools/hierarchy.py es la fuente, pero nada la ejecuta al construir: el board
# se pego a mano. Esto no impide la deriva, la DETECTA, que es lo unico que un
# repo sin paso de build puede prometer honestamente.
python3 - <<'PYHIER'
import re, sys
sys.path.insert(0, 'tools')
try:
    import hierarchy as H
except Exception as e:
    print('NO SE PUDO LEER tools/hierarchy.py:', e); sys.exit(1)

want = len(H.board_columns())
bad = []

sched = open('schedule.html').read()
got = len(re.findall(r'<div class="daycal-col" data-col=', sched))
if got != want:
    bad.append('schedule.html tiene %d columnas en el board, hierarchy.py dice %d' % (got, want))

heads = len(re.findall(r'<div class="daycal-col-head" data-col=', sched))
if heads != want:
    bad.append('schedule.html tiene %d cabeceras, hierarchy.py dice %d' % (heads, want))

# ninguna columna puede anunciar que esta ocupada en si misma
meta = {c['id']: c for c in H.board_columns()}
COL = re.compile(r'<div class="daycal-col" data-col="([^"]+)"[^>]*>(.*?)\n            </div>', re.S)
for cid, body in COL.findall(sched):
    for lbl in re.findall(r'class="els-t">Busy &middot; ([^<]+)<', body):
        if cid in meta and lbl == meta[cid]['name']:
            bad.append('%s dice "Busy · %s" dentro de su propia columna' % (cid, lbl))

# la pantalla de estructura no puede citar otro numero
tr = open('treatments.html').read()
i = tr.find('t-08-hierarchy')
if i > -1:
    seg = tr[i:i+3000]
    m = re.search(r'A column on the day board\.\s*([A-Za-z-]+)\.', seg)
    WORDS = {32: 'Thirty-two', 33: 'Thirty-three', 34: 'Thirty-four', 35: 'Thirty-five', 36: 'Thirty-six'}
    if m and m.group(1) != WORDS.get(want, ''):
        bad.append('treatments.html dice "%s" columnas, hierarchy.py dice %d' % (m.group(1), want))

# ningun bloque del board puede llevar un protocolo que el paciente no tiene
# aprobado: el board estaria enseñando una reserva que la pantalla de reserva
# habria rechazado, y el wireframe se contradiria a si mismo
ERCH = {n for n, _ in H.ERCHONIA}
for m in re.finditer(r'<div class="cal-appt (?!is-elsewhere)[^"]*"[^>]*>', sched):
    tag = m.group(0)
    pt = re.search(r'data-pt="([^"]*)"', tag)
    pr = re.search(r'data-proto="([^"]*)"', tag)
    if not (pt and pr and pr.group(1)): continue
    who, proto = pt.group(1), pr.group(1)
    plan = H.POC_PROTOCOLS.get(who)
    if plan is None:
        bad.append('%s esta en el board con "%s" y no tiene plan de cuidado' % (who, proto))
        continue
    cat = 'erchonia' if proto in ERCH else 'biocharger'
    if proto not in plan[cat]:
        bad.append('%s esta en el board con "%s", que su plan no aprueba' % (who, proto))

# el filtro de organizing type no puede repetir una entrada (Carlos: "no hagas
# que se repita"), y tiene que ofrecer los doce
# se cuenta POR SELECT: dia, semana y mes llevan el mismo filtro, y contar sobre
# el archivo entero daba doce por tres y parecia una repeticion que no lo era
for sid in ('l-view', 'l-view-w', 'l-view-m'):
    k = sched.find('id="%s"' % sid)
    if k < 0:
        bad.append('falta el filtro %s' % sid); continue
    blk = sched[k:sched.index('</select>', k)]
    opts = re.findall(r'<option value="org:([^"]+)"', blk)
    if len(opts) != len(set(opts)):
        from collections import Counter
        dup = [x for x, v in Counter(opts).items() if v > 1]
        bad.append('%s repite organizing types: %s' % (sid, ', '.join(dup)))
    if len(opts) != len(H.org_types()):
        bad.append('%s ofrece %d organizing types, hierarchy.py dice %d'
                   % (sid, len(opts), len(H.org_types())))
    cols = re.findall(r'<option value="([a-z0-9]+)">Only ', blk)
    if len(cols) != len(H.board_columns()):
        bad.append('%s ofrece %d columnas por nombre, el tablero tiene %d'
                   % (sid, len(cols), len(H.board_columns())))

# ninguna columna puede salir dos veces en el tablero
heads_ids = re.findall(r'<div class="daycal-col-head" data-col="([^"]+)"', sched)
if len(heads_ids) != len(set(heads_ids)):
    bad.append('el tablero repite columnas: %d cabeceras, %d distintas' % (len(heads_ids), len(set(heads_ids))))

# y al reves: una cita cuyo tipo EXIGE protocolo no puede estar sin el. El
# comprobante anterior solo validaba los protocolos presentes, que es como
# ocho citas de Rife se quedaron sin ninguno sin que nadie se enterara.
NOCAT = {k for k, v in H.TAKES_PROTOCOL.items() if not H.protocols(v['catalogue'])}
for m in re.finditer(r'<div class="cal-appt (?!is-elsewhere)[^"]*"[^>]*>', sched):
    tag = m.group(0)
    tx = re.search(r'data-tx="([^"]*)"', tag)
    if not tx: continue
    cfg = H.TAKES_PROTOCOL.get(tx.group(1))
    if not cfg or not cfg.get('required'): continue
    if 'data-proto=' in tag: continue
    if tx.group(1) in NOCAT:
        bad.append('%s exige %s y no hay catalogo: el board no puede mostrarlo'
                   % (tx.group(1), cfg['label'].lower()))
    else:
        pt = re.search(r'data-pt="([^"]*)"', tag)
        bad.append('cita de %s (%s) sin %s, y su tipo lo exige'
                   % (tx.group(1), pt.group(1) if pt else '?', cfg['label'].lower()))

# y el mismo plan tiene que estar en la pantalla de reserva
for who in H.POC_PROTOCOLS:
    if ("'%s': { erchonia:" % who) not in sched:
        bad.append('%s tiene plan en hierarchy.py y no en L_POC' % who)

if bad:
    print('LA JERARQUIA SE DESVIO (%d):' % len(bad))
    for b in bad[:10]: print('  ' + b)
    sys.exit(1)
PYHIER
[ $? -ne 0 ] && fail=1

exit $fail
