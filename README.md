# Stonehaven Lending — Website

The live marketing site for Stonehaven Lending (residential • commercial),
serving stonehavencre.com via Netlify. Navy/gold logo, gold accent palette
(`#B08230`). Bilingual (EN/ES). Pure static HTML/CSS/JS — **no build step,
no framework.** Push to `main` auto-deploys.

Rebranded from "Stonehaven Commercial" on 2026-07-13: brand name everywhere
(titles, meta, JSON-LD schema, headers, footers, alt text, EN + ES), header
subtitle COMMERCIAL → LENDING, logo assets (`assets/mark.png` emblem crop,
`assets/logo-full.png`, `assets/og-logo.png` 1200×630), accent copper → gold,
and positioning copy repositioned to residential & commercial. Product pages
still describe the Commercial / SBA / DSCR programs.

## Files
- `index.html` — home
- `commercial.html`, `sba.html`, `dscr.html` — product pages
- `contact.html` — contact
- funnel pages: `book.html`, `dscr-analyzer.html`, `sba-guide.html`,
  `terms-sheet.html`, `thanks-*.html`
- `styles.css` / `funnel.css` — shared styles
- `es/` — Spanish versions

## Preview locally
Any static server works, e.g.:
```
npx serve .
```
Then open the URL it prints.

## Going live with this variant (when decided)
Do NOT drag-and-drop onto the existing Netlify site — that would replace
stonehavencre.com. Create a new Netlify site (or a new branch + branch
deploy) and decide the domain question first. The canonical URLs, OG tags,
and sitemap still reference `stonehavencre.com` and must be updated to the
final domain before launch.

## Known placeholders / to-dos
- **Phone:** `(800) 555-0100` placeholder, same as production.
- **Contact email:** `office@stonehavencre.com` (live via Google Workspace).
- Forms POST to Netlify Forms per `js/funnel.js` (same contract as production);
  the CRM cutover is the `INTAKE_ENDPOINT` constant at the top of that file.
