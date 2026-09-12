# HELOC and DSCR search improvements

Implements the September 12 Google ranking report. No new lender pricing, invented human reviews, fictional closings, or borrower outreach is introduced.

## Website changes

- Four new HELOC guides in English and Spanish: product comparison, borrowing-capacity example, printable preparation checklist, and Georgia questions. Eight article URLs total, with retained source briefs and product-specific inquiry links.
- Direct HELOC link in both homepage heroes, plus contextual resource blocks on the homepages, residential pages, cash-out pages, the English residential resource page, and both HELOC hubs. English /heloc now has nine distinct intended-indexable referring pages, up from three.
- Existing DSCR rental-income, Georgia, and cash-out articles gain practical preparation sections in both languages. DSCR product and calculator pages link to those resources. No state pages were deleted or made duplicate city pages.
- English and Spanish editorial policies, with correction contact and links from articles and management. Organization authorship is retained; no person is represented as having reviewed content when they have not.
- The HELOC estimator now includes requested amount, carries user-entered figures into the existing required form fields, preserves manual form edits, accepts a zero mortgage balance, and clears invalid results. Calculator-use measurement requires actual interaction and contains no borrower figures.
- South Carolina added to the main HELOC Service markup to match existing visible coverage; organization identifier aligned.
- All 57 legacy FAQPage instances removed, including generator sources. Useful visible questions remain.
- Sixteen future sitemap dates corrected, with substantive changed pages and ten new pages reflected in the sitemap. Other article dates were not bumped for a shared editorial note.
- Fixed an existing mobile homepage overflow caused by the three-item grid selector overriding its responsive rule.
- Added printable article styling without introducing a download gate or third-party script.

## Maintenance

`python3 scripts/build-seo-resources.py` owns only marked `SEO:*` blocks and the two editorial-policy pages. Content is in `scripts/seo-content.json`. Run it after the four existing Python page generators. CI verifies output matches these sources.

For a new guide, retain its JSON brief and publish through `scripts/new-post.mjs`, then run the SEO resource builder. The publisher refuses future publication dates and duplicate posts. Set `product: "HELOC"` for the HELOC-specific call to action.

Use `python3 scripts/update-sitemap.py YYYY-MM-DD 'reason' /changed-path` for significant content changes. This is an explicit editorial operation, never an automatic build timestamp. `content-changes.json` records this release's updates.

`node scripts/check-site.mjs` now runs `check-seo.py` as part of the release gate. It rejects broken local links and fragments, unsafe link schemes, missing or duplicated search metadata, incorrect canonicals, future sitemap dates, noindex sitemap leakage, and retired FAQ markup. An HTTP 200 and passing metadata check are not proof of Google indexing.

## Validation

- 50 tests pass, including new estimator state and SEO-boundary regressions; all existing lead-delivery tests remain intact.
- All four content/language linters pass.
- 293 pages and 240 sitemap URLs pass the static SEO gate.
- All five generators reproduce the working output without drift.
- Browser checks at 320, 390, 768, and 1440 pixels pass across eight representative English/Spanish routes: no page overflow, one H1, and no page-script errors. Calculator field carry-forward, zero balance, manual edits, and invalid-value clearing were exercised without submitting a lead.
- Browser snapshots and synthetic performance records are retained outside the public repository in the research implementation-qa folder. Local timings are not field Core Web Vitals or ranking predictions.

## Remaining external dependencies

- Search Console, GA4 key-event configuration, Business Profile inspection, and real conversion baselines need the correct owner-managed Google account.
- Three fully signed partnership email drafts and an anonymous lead-reporting helper are prepared in the private outputs/seo-implementation-2026-09-12 folder. Messages were not sent; membership purchases and referral arrangements were not made.
- Authentic team photos, identifiable expert review, real closing case studies, and videos need actual owner-supplied material or participation. No substitutes were fabricated.
- Future state-page consolidation and topic expansion should use actual query and qualified-lead evidence. No ongoing monitor was created.

## Content sources

The new guides link to the relevant source directly. Sources checked September 12, 2026:

- CFPB: https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-home-equity-loan-and-a-home-equity-line-of-credit-heloc-en-247/
- CFPB: https://www.consumerfinance.gov/ask-cfpb/what-is-a-home-equity-line-of-credit-heloc-en-107/
- CFPB: https://www.consumerfinance.gov/ask-cfpb/what-is-a-home-equity-loan-en-106/
- CFPB mortgage glossary: https://www.consumerfinance.gov/consumer-tools/mortgages/answers/key-terms/
- Georgia Department of Banking and Finance: https://dbf.georgia.gov/home-equity-loans-and-lines-credit
- Google FAQ retirement notice: https://developers.google.com/search/updates (May 8, 2026 entry)

Examples are educational and do not quote an offered interest rate or establish a lender's eligibility limit. Existing service coverage and business identities are carried forward from the website's approved context.
