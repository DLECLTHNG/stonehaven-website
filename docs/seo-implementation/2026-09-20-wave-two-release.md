# SEO and AI discovery implementation, September 20, 2026

Baseline: production and main commit `978bf8f`. Implements the supplied September 20 brief using the current checkout, not the older desktop copy. The owner subsequently confirmed broad RE/CRE placement capability and instructed work to continue without the requested questionnaire. This confirms a brokerage placement scope, not guaranteed approval, unlimited lender proceeds or expanded residential licensing.

## Delivered

| Area | Result |
| --- | --- |
| Logo delivery | Original approved 962,168-byte PNG retained. Versioned 120/240/360/512px WebP derivatives are 2,750 / 6,480 / 11,186 / 18,206 bytes. Responsive image markup respects actual 120px desktop, 100px mobile/campaign and 180px footer sizes. Dedicated favicon, Apple icon and 1200×630 sharing image use the same approved artwork. The old unused sharing image carried the previous logo, so it was not reused. |
| Performance delivery | Immutable cache headers apply only to versioned derivatives. Seven English and five Spanish calculator math dependencies are deferred safely. Removed two obsolete DSCR analyzer controllers that referenced nonexistent controls on the program calculator. |
| Page structure | Direct DSCR answer precedes the review introduction. The current baseline did not actually have a form above that answer. Replaced 1,049 footer `h5` labels across 345 pages and corrected the named heading gaps on 19 routes. |
| Contextual links | Regional DSCR disclosure panels contain real crawlable state links with article-specific context. Residential state pages link to the matching DSCR and Family guides. Commercial, SBA and home-loan decisions link to the appropriate resource explanations. All targeted state/Family/resource destinations now have qualifying inbound body links. Before/after tables exclude navigation, footer, blog indexes and mirror-only links. |
| Entity and sharing metadata | Stable Stonehaven organization nodes include company NMLS, organizational email and compact logo, including nested authors/providers. Human identities remain separate. Completed four missing Open Graph sets and added reciprocal sitemap language alternates wherever verified mirrors exist. |
| Search titles | Shortened 42 long English titles through retained publisher `metaTitle` values and an explicit legacy override map. Article H1s and authorship remain intact. No fixed title-length ranking threshold is asserted. |
| AI discovery files | Maintained `llms.txt` now points to the state series, all 17 DSCR situations, HELOC guides and editorial policy. Generated `llms-full.txt` retains public explanatory content from 18 pillars, excluding site navigation, form UI and hidden content. These are navigation aids, not special ranking signals. |
| Commercial services | Added English and Spanish multifamily acquisition, 5–8 unit financing and Georgia/metro Atlanta pages. Reused existing commercial inquiry destinations and delivery flow. Added useful contextual inbound links, redirects, canonical URLs and sitemap entries. |
| Construction depth | Added builder experience, advance-versus-commitment interest questions, draw timing, cash needs and extension planning without inventing program-specific terms. |
| Homepage | Commercial financing leads the title, hero and primary inquiry path. $2M–$10M remains a preferred total-project-cost focus, with other sizes reviewed. Home-loan and HELOC paths remain prominent. |

## Current-source correction

Freddie Mac launched **Conventional Small** on April 15, 2026 and stopped accepting applications to the prior SBL program after April 30. The acquisition guide explains this transition rather than advertising the old product. Current Freddie loan-size guidance and Fannie Mae Small Mortgage Loan parameters are attributed to their official sources. They are distinct from Stonehaven's preferred total project costs and do not establish a direct agency designation or approval.

Primary sources and checked facts are retained in `docs/cre-financing/multifamily-acquisition-service.json` and `small-multifamily-service.json`. Georgia content uses the confirmed Alpharetta address and carefully distinguishes the company-reported Brookhaven closing from educational or unconfirmed transaction scenarios. No new closing, reviewer, profile, team photo or review was invented.

## Performance evidence and limits

[PageSpeed baseline report](https://pagespeed.web.dev/analysis/https-stonehavencre-com/51gi7qlv9s?form_factor=mobile), September 20, 2026 at 15:17 BST:

| Lighthouse metric | Mobile | Desktop |
| --- | ---: | ---: |
| Performance score | 64 | 98 |
| First Contentful Paint | 2.9 s | 0.8 s |
| Largest Contentful Paint | 7.0 s | 0.8 s |
| Total Blocking Time | 300 ms | 40 ms |
| Cumulative Layout Shift | 0.007 | 0.003 |
| Speed Index | 3.6 s | 1.3 s |

These are one-run **lab** measurements, not real-user Core Web Vitals. PageSpeed explicitly reported **No Data** for real users on both form factors. Its public API also returned quota exceeded; the report above was obtained from the PageSpeed UI. Field before/after claims cannot be made without a sufficient CrUX or other appropriate real-user dataset. Post-publication measurements belong in the companion release verification report; asset savings alone do not prove a Core Web Vitals improvement.

## Validation

- All 109 automated tests and four content linters pass.
- SEO checks cover 396 public HTML pages and 334 sitemap URLs, with no broken local links/fragments or canonical errors.
- All 12 generators reproduce 730 tracked/new source and output files without drift. New CRE generators run before the final search-navigation/metadata/discovery pass in CI.
- The existing 390 routes passed desktop 1280px and mobile 320px checks for document overflow, header logo delivery, footer headings and visible form-submit alignment. Six new service pages passed 1280, 768 and 320px checks, with representative screenshots inspected.
- All 12 calculator routes were exercised with hypothetical inputs and recalculated without controller errors. No real inquiry was submitted.
- Netlify, email and CRM delivery implementations and accepted-submission conversions remain unchanged. Family navigation-only privacy behavior remains covered by existing tests.

## Measurement and evidence still unavailable

No account-backed Search Console, Bing, GA4, backlink or Business Profile baseline was obtained in this release. The attached brief's statement that no properties exist is not verified. The C01–C13 consumer-assistant benchmark has not been executed in 39 fresh product sessions, and no citation share or ranking improvement is claimed. The user asked to proceed without the account questions, so these gaps do not hold the engineering release open.

Monthly outcome reporting needs actual indexed-page, impression, click, citation and qualified-inquiry data. No fabricated baseline or empty monthly automation was created. The three additional consented closed case studies, exact external identity URLs, funded-volume supporting records, London-office verification and qualified Spanish reviewer remain absent; no new claims were added for them.

## Maintenance

Run `python3 scripts/build-cre-local.py` and `python3 scripts/build-small-multifamily.py` after the existing CRE generator, then `python3 scripts/build-search-navigation.py` last. The final pass owns branding markup, metadata, contextual links, sitemap alternates and discovery files. `scripts/resize-brand-assets.py` requires Pillow only when regenerating the approved image derivatives; normal CI uses the committed assets and the Python standard library.
