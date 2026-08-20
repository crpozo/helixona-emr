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

exit $fail
