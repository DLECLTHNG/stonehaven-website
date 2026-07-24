# SBA + Commercial mega-build — implementation record (2026-07-24)

Scope executed from the one-sitting mega prompt, honest-scoping variant:
Phase-1 harm-stopping in full, shared product/booking/language state, both
hub P0s, Spanish utility routes, honest funnel decisions. Calculators,
resource hubs, and guides are gated backlog (below). Local-only; nothing
pushed without owner authorization.

## Phase 1 — harm-stopping

- All three `downloads/*.pdf` withdrawn from the deployed build. Verified
  defects in `sba-own-your-building.pdf` (via direct render): fake phone
  "+1 (800) 555-0100" on every page, "Stonehaven Commercial is a
  commercial real estate lender" disclosure, legacy `book.html` CTA,
  unsourced July-2026 indicative rates, overstated first-year-principal
  claim on the $1.2M example, unqualified 10%-down and credit-band
  claims, old branding. The other two PDFs are same-batch. Files stay in
  git; `netlify.toml` now rm's `downloads` at build, `_redirects` serves
  410 for `/downloads/*`, and the monitor asserts the 410s.
- Build sentinel gate extended: build fails if any rendered HTML contains
  `STONEHAVEN_OWNER_FACT_REQUIRED`, `555-0100`, `Call ,` / `call  to` /
  `Llame al ,` (empty-phone artifacts), `is a commercial real estate
  lender`, or `prestamos de forma directa`.
- Live Spanish direct-lender claim removed from `es/commercial.html`
  ("Como prestamos de forma directa…" → advisory phrasing).
- Empty-phone artifacts ("Call , business hours ET" / "Llame al ,")
  removed from all thanks pages.
- Every download/emailed-asset promise rewritten to truthful
  personal-follow-up copy (EN+ES): sba-guide, terms-sheet, dscr-analyzer
  funnels and their thanks pages. No page now promises an attachment,
  emailed report, or quarterly sheet.

## Product/booking/language state

- `/book`: "Not sure yet" is now the default first option; `?product=`
  (allowlisted DSCR|SBA|Commercial) preselects; inline sync script
  replaced by a generic `product_choice` → `data-sh-product` sync in
  `js/funnel.js` (applies to any form; cache-bust `funnel.js?v=3`
  sitewide).
- Product-page book links now carry product: dscr pages → 
  `/book?product=DSCR` (EN) / `/es/book?product=DSCR` (ES); hub CTAs
  carry SBA/Commercial.
- New ES utility routes: `/es/book`, `/es/thanks-book`,
  `/es/thanks-quote` (translated, product-aware, ES form attrs, 301!
  rules added). ES forms that posted thanks to English pages now target
  `/es/thanks-quote`. ES pages with Spanish labels but English nav/brand
  targets fixed to `/es/…`. `es/sba*` guide links → `/es/sba-guide`.

## Hub P0s

- `/sba`: title "SBA 7(a) and 504 Loans | Stonehaven"; H1 "…for business
  growth."; role-accurate hero (arranges through third-party providers);
  above-fold CTAs (Build my SBA capital plan → /book?product=SBA;
  readiness check → /sba-guide); three path cards (Buy a business / Buy
  your building / Grow or refinance); underwriting step re-attributed to
  the selected lender; serviceType → "SBA loan advisory and brokerage".
  10%-down claims qualified ("for qualifying projects"; 504 matrix noted
  in guide copy: special-purpose or newer businesses typically +5% each).
- `/commercial`: H1 "Commercial real estate financing built around the
  constraint."; advisory hero; above-fold CTAs (deal feedback in 48h →
  /terms-sheet#deal-review; 15-min call → /book?product=Commercial);
  serviceType → "Commercial real estate capital advisory"; "feedback
  from a lender" → "from a capital specialist".
- Both mirrored in ES (incl. path cards, CTAs, serviceType).
- funnel.css added to all four hub pages (CTA button styles).

## Funnel decisions (Model B)

- `/sba-guide`, `/es/sba-guide`, `/terms-sheet`: now conversion-only —
  `noindex,follow`, removed from sitemap.xml (20 → 17 URLs). Copy
  reframed from asset delivery to specialist reply within one business
  day. "Eligibility check" language → "readiness check" (EN/ES);
  quiz result-view analytics event renamed `readiness_result_view` so
  `quiz_complete` fires only on actual lead submission.

## Monitoring

- `site-monitor.yml`: dropped the 200-check on the withdrawn PDF, added
  410 assertions for all three PDF URLs, added `/es/book` to the 200s.

## Gated backlog (blocked on owner facts / named author+reviewer / counsel)

- /sba-loan-calculator, /commercial-loan-calculator (deterministic math
  + fixtures, same pattern as dscr-calc).
- /resources/sba hub + 3 guides; /resources/commercial hub + 3 guides.
- Re-issue of any downloadable assets only after counsel-reviewed,
  owner-fact-complete versions exist.
- Standing owner items: real phone, legal entity/NMLS/licensing/address,
  GA4/Pixel/intake IDs, scheduler embed, native-Spanish review, counsel
  review of disclosures.
