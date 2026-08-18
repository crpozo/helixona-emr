# tools

The generators. These are the **source** for things that appear in five or six
places at once, and the repo is where they belong — a single source that only
exists in a temp directory is not one. (The originals lived in a session
scratchpad until it was wiped on 2026-08-12, which is how we found out.)

| File | Owns |
|---|---|
| `palette.py` | The clinic's calendar code: 10 types, 62 subtypes, 10 statuses, with their colours and labels. |

Everything downstream reads from it: the CSS tokens and class rules in
`assets/hcos.css`, the status watermarks, the three legends on `schedule.html`,
the type and subtype filter lists, the capacity rows, the codes screen and the
types-and-subtypes screen on `treatments.html`, and the `L_SUBS` / `L_TX`
dictionaries the booking screen reads.

**A colour only has to be unique within its type.** The type owns the background,
so two subtypes that share a side-bar colour under different types still read
apart on the board. That is the clinic's own rule, and it is why the sheet has
repeats in it.

To change the taxonomy: edit `palette.py`, then regenerate the places above and
run `bash check.sh`. Retiring a subtype by hand in one file and not the others is
the mistake this directory exists to prevent.
