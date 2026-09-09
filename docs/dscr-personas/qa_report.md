# QA report - DSCR subsection pages (2026-09-13, branch feat/dscr-persona-pages)

## Code validation (run, all passing)
- scripts/lint-dscr-personas.mjs: 17 pages; banned-claims scan scoped to main content
  (guaranteed approval/savings/proceeds, no-credit-check, no-doc, decimal rates, APR,
  nationwide, VA-backed DSCR, funding-speed, keep-your-first-mortgage, em dashes);
  uniqueness of h1/title/description across pages; canonical, Breadcrumb, FAQPage,
  both CTAs, disclosure presence; title <=62, description <=162; no heading periods.
  One real finding during development (68-char title) fixed; footer "nationwide"
  correctly excluded as pre-approved site-wide copy.
- JSON-LD: every block on the 17 pages + updated hub parses (0 errors).
- Internal link audit: every internal href on the 17 pages resolves to a real file.
- Existing suites unaffected: HELOC persona lint, ES casing lint, all calculator
  math fixtures still pass.

## Rendered inspection (local static server, PREVIEW_ONLY)
- All 17 pages iframe-rendered at 390px: h1 present, 6+ question blocks, both CTAs,
  unique module (table or steps) present, disclosure text present, footer present,
  zero horizontal overflow. 17/17 pass.
- Desktop + mobile screenshots of hub explorer and sample LP captured in review thread.
- Keyboard: FAQ/objection blocks are native details/summary (keyboard operable);
  navigation and CTAs are real anchors; no custom JS controls on these pages at all
  (static content), so focus order is document order.

## Preview checks
- Local server only (.claude/launch.json "website-static"). NOT deployed; production
  URLs in manifests are PROPOSED. .html->clean redirects added to _redirects and
  follow the proven pattern of existing sections (verified pattern live for /heloc/*).

## Form-path verification (production, 2026-09-13)
- /dscr-review (primary CTA of all 17 pages): form present with honeypot and consent
  text; empty submit blocked with field flagging; ONE labeled end-to-end submission
  ("TEST PREFLIGHT - please disregard") accepted, redirected to /thanks-dscr-review,
  and verified stored in the backend with all deal fields and preserved attribution
  (utm_content=DSCR-QA pattern, matching the planned angle-ID UTMs). Owner should
  disregard that lead notification.
- /dscr-analyzer (secondary CTA): form present with honeypot; empty submit blocked;
  live calculator computes (1.17x on test inputs); /thanks-dscr-analyzer returns 200.
- Final render sweep on the branch build: 17 pages x 2 widths (390px / 1200px), all
  pass single-h1, CTA, canonical and no-overflow checks.

## Not observable pre-launch (post-launch items)
- Google/Bing indexing, selected canonicals, AI-answer citation, real-user CWV field
  data. Lab note: pages are static HTML with the site's existing font/CSS budget and
  no new JS; the heaviest new asset is inline SVG-free text (hub cards). No new
  render-blocking resources added.

## Unresolved issues
1. Specialist/compliance review of all 17 pages pending (content_review_status).
2. Program facts in claims_register.md pending owner verification.
3. Native-Spanish read of /es/dscr recommended (existing page; audit found no defects).
