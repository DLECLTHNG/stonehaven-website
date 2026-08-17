# Spanish copy convention (es/)

## Casing: sentence case, always
Spanish does not use English-style Title Case. Headings, `<title>`s, meta
titles, eyebrow labels, buttons and form labels take **sentence case**:
capitalise the first word and proper nouns only.

    ✗ Corretaje Inmobiliario y Asesoría de Capital
    ✓ Corretaje inmobiliario y asesoría de capital

    ✗ Préstamos DSCR para Propiedades de Alquiler
    ✓ Préstamos DSCR para propiedades de alquiler

    ✗ Hable Con Nosotros          ✓ Hable con nosotros
    ✗ Por Qué Stonehaven          ✓ Por qué Stonehaven

Fix the *source* casing even for `.eyebrow` labels — the CSS uppercases
them today (`styles.css` `.eyebrow{text-transform:uppercase}`), so the
Title Case is invisible right now, but it surfaces the moment that rule
changes.

**Stays capitalised:** proper nouns (Stonehaven, Georgia, Alpharetta,
Dawn M. Muñoz), acronyms and program names (DSCR, SBA, FHA, VA, HELOC,
NMLS, LLC, PITI, EE. UU.), and formal document names (Política de
Privacidad). A capital is also fine at the start of a new sentence or
clause inside a string (after `.`, `?`, `!`, `:`, ` - `, `|`).

## Other house rules for Spanish pages
- Address the reader as **usted**, consistently (imperative: *Hable*, not *Hablar*).
- Spanish em dashes hug the enclosed text: `—y su tasa baja—`.
- Literal accented characters in source (á é í ó ú ñ ¿ ¡), not HTML entities.
- "Estado" alone reads as *condition*; for the US state say
  *Estado donde está la propiedad*.
- Time zone: *hora del Este de EE. UU.*
- Legal disclosures, consent lines, calculator small print and the trust
  band are reviewed text — do not edit them in copy passes.

## Lint
    node scripts/lint-es-casing.mjs
Scans every file under `es/` for Title Case in titles, H1–H3, og/twitter
titles, JSON-LD headlines and eyebrow labels; prints `file:line` and
exits 1 on findings. Heuristic on purpose. Add genuine proper nouns or
acronyms to `ALLOW` in the script rather than weakening the rule.
