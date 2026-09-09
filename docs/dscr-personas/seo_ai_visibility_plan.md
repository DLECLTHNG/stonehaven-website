# SEO and AI-visibility plan - DSCR subsection pages (2026-09-13)

## Query-intent map
Recorded in lp_manifest.csv (primary_query per page). Evidence status: HYPOTHESIS for all;
this environment has no Search Console/Bing access. Post-launch: pull actual queries per
page and replace hypotheses; do not treat the hypotheses as observed data.

## Overlap decisions (per register)
- LP002 bridge vs LP006 BRRRR: LP002 = readiness to replace maturing debt (timeline module
  keyed to maturity date); LP006 = planning the refi across the buy/rehab/rent sequence
  (stage checkpoints module). Cross-linked, not merged.
- LP003 cash-out vs LP012 rate-and-term vs LP015 cash-purchase: proceeds economics vs
  restructure break-even vs acquisition-history classification. Each has a distinct module
  (proceeds table / break-even worksheet / paper-trail checklist) and says explicitly which
  question belongs on which page.
- LP001 vs LP009 vs LP010: next-acquisition sensitivity vs financing architecture vs lease
  evidence. Distinct modules; cross-linked.
- LP007 working-professionals: genuinely useful ad LP; organic intent overlaps LP001/LP004,
  so shipped noindex,follow with a documented revisit path.
- LP017 veteran: indexable because the VA-vs-investment distinction is a real, heavily
  searched question answered accurately; page states no veteran DSCR advantage exists.

## Indexation and canonicals
16 EN pages PROPOSED_INDEX with self-referencing absolute canonicals; LP007 noindex,follow;
LP018 is the existing /es/dscr (already indexed, reciprocal hreflang with /dscr verified).
Persona pages carry NO hreflang (no ES twins; not marked as translations). Sitemap adds the
16 intended-index URLs only; noindex page and tracking params excluded.

## Internal links
Hub /dscr gained a "Find your situation" explorer (6 financing-need + 11 situation cards,
descriptive anchors). Every LP links 3 related LPs + hub + program calculator; CTAs to
/dscr-review and /dscr-analyzer. No orphans (link audit in qa_report).

## Schema rationale
BreadcrumbList + WebPage + FAQPage per page, all content-backed and JSON-validated. No
Service/Offer/ratings schema on subsection pages (no offer terms exist to mark up). No
rich-result or ranking promises attached.

## Crawler findings
robots.txt allows major search/AI crawlers and lists the sitemap (pre-existing). Pages are
static HTML: full content in initial response, no client-side gating, no login, no chatbot
requirement. No CDN challenge observed on same-class pages in production. llms.txt exists
site-wide as a courtesy index; not treated as a ranking requirement.

## Measurement plan (post-launch, when tooling is connected)
Search Console: queries/impressions per /dscr/* page monthly; Bing Webmaster + AI
Performance (public preview) for supported citation reporting, recorded with its limits.
Conversion: dscr-review submissions attributed via preserved UTMs (utm_content carries
angle ID). No traffic forecasts are made anywhere in this package.
