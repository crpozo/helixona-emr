# Helixona EMR (HCOS) — collaborative wireframe

A high-level, browsable wireframe of the whole HCOS EMR, built so the entire Helixona team
can shape the software before any application code is written.

**Browse it:** https://crpozo.github.io/helixona-emr/

## How to give feedback (no account needed)

1. Open any screen and tap the floating **Feedback** button.
2. Pick your name, write the note, choose Idea / Problem / Question / Approved.
3. **Save note** keeps it in your browser instantly. **Send to Carlos** opens a prefilled
   email so it reaches the shared board. **Export my notes** downloads a file you can
   attach anywhere.
4. Carlos merges received notes into [`feedback/notes.json`](feedback/notes.json) — they
   then appear to everyone as badges and a notes drawer on the exact screen they refer to.
   GitHub-savvy teammates can PR that file directly.

## For contributors

- Static HTML/CSS/JS only — open `index.html` straight from the file system; it behaves
  identically to GitHub Pages.
- Domain truth lives in [`CLAUDE.md`](CLAUDE.md). The page contract and component
  vocabulary live in [`WIREFRAME_GUIDE.md`](WIREFRAME_GUIDE.md).
- No PHI, ever. All patients, appointments, and claims are synthetic.
