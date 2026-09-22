# Website audit and article release, September 22, 2026

Baseline: main `cc732db`. Scope: the public English/Spanish website, forms, delivery code, search/AI discovery, article copy, shared formatting and desktop/mobile rendering. The earlier message about a recurring issue was confirmed by the owner to belong to another chat.

## Completed fixes

- Hardened contact syntax checks against visually blank names, control characters and malformed email addresses. Added a cross-site browser form guard without changing successful Netlify capture, office alerts or CRM delivery.
- Corrected a substring match that incorrectly treated Commercial multifamily routes as sensitive Family housing pages. Multifamily inquiries can retain source attribution; actual Family routes keep their privacy boundary.
- Secured Family relay destinations and redirect behavior, constrained dry runs to local development, and moved the optional Meta token out of request URLs. See the separate security audit for evidence and limits.
- Replaced legacy blog call-booking invitations with product-appropriate review links and text follow-up copy. New DSCR posts go to DSCR intake; Commercial posts use a general project review. First-mortgage refinance/subordination readers use Residential intake without having to request a new HELOC.
- Renamed footer blog links from “Closings” to “Guides and articles” and the Spanish equivalent. Added native, collapsible contents and stable heading anchors to 244 article pages. These require no JavaScript and preserve Family navigation-only behavior.
- Corrected 18 pages with skipped heading levels while preserving their visual sizing. Improved secondary text contrast, article link visibility, list spacing and table/caption formatting. Shared CSS and changed form scripts have updated cache keys in both generators and output.
- Clarified the existing bilingual DSCR explainer: business-purpose classification depends on the transaction and property use, not merely the qualifying-income formula. Added the relevant CFPB reference and an accurate modified date.
- Added relevant body links from product pages and existing guides to all 20 new article URLs. Added bilingual canonicals, reciprocal language alternates, schema, sitemap entries and maintained public discovery text.
- Fixed a hidden void-control edge case in the public text exporter so a hidden input cannot silently remove the remainder of an article. Added release checks for duplicate element IDs, missing document languages, missing image alternatives and missing embedded local assets.

## Ten new topics

- [Commercial loan refinance: how to calculate a cash-in gap before maturity](https://stonehavencre.com/blog/commercial-refinance-cash-in-gap) ([Spanish](https://stonehavencre.com/es/blog/commercial-refinance-cash-in-gap)).
- [Construction loan interest reserves vs. contingency: budget for both](https://stonehavencre.com/blog/construction-loan-interest-reserve-vs-contingency) ([Spanish](https://stonehavencre.com/es/blog/construction-loan-interest-reserve-vs-contingency)).
- [Fix-and-flip rehab draws: how much cash do you need between payments?](https://stonehavencre.com/blog/fix-and-flip-rehab-draw-cash-flow) ([Spanish](https://stonehavencre.com/es/blog/fix-and-flip-rehab-draw-cash-flow)).
- [What if your flip does not sell? Plan a rental refinance exit early](https://stonehavencre.com/blog/fix-and-flip-rental-exit-refinance) ([Spanish](https://stonehavencre.com/es/blog/fix-and-flip-rental-exit-refinance)).
- [Subdivision financing: how lot release prices affect developer cash flow](https://stonehavencre.com/blog/subdivision-loan-lot-release-prices) ([Spanish](https://stonehavencre.com/es/blog/subdivision-loan-lot-release-prices)).
- [DSCR loan reserves: how much cash should remain after closing?](https://stonehavencre.com/blog/dscr-loan-reserves-cash-to-close) ([Spanish](https://stonehavencre.com/es/blog/dscr-loan-reserves-cash-to-close)).
- [DSCR prepayment penalties: compare the cost of selling or refinancing early](https://stonehavencre.com/blog/dscr-prepayment-penalty-exit-planning) ([Spanish](https://stonehavencre.com/es/blog/dscr-prepayment-penalty-exit-planning)).
- [When can you use your HELOC after closing?](https://stonehavencre.com/blog/heloc-closing-timeline-cancellation-period) ([Spanish](https://stonehavencre.com/es/blog/heloc-closing-timeline-cancellation-period)).
- [Can a lender freeze your HELOC? Plan for a reduced credit line](https://stonehavencre.com/blog/heloc-freeze-credit-line-reduction-plan) ([Spanish](https://stonehavencre.com/es/blog/heloc-freeze-credit-line-reduction-plan)).
- [Can you refinance your first mortgage and keep your HELOC?](https://stonehavencre.com/blog/refinance-first-mortgage-keep-heloc-subordination) ([Spanish](https://stonehavencre.com/es/blog/refinance-first-mortgage-keep-heloc-subordination)).

Each article uses original worked examples, practical preparation questions and current primary sources. Examples are explicitly hypothetical, not invented closings or available offers. Full bilingual briefs and source registers are retained under `docs/blog-batch-2026-09-22/`; publisher briefs are under `docs/blog-briefs/`. The authors cross-reviewed the opposite product group. Final edits clarified land equity, carrying costs, annual commercial DSCR and Spanish payoff-charge wording.

## Verification

- Baseline: 416 HTML pages and 354 sitemap entries. Release: 436 HTML pages and 374 sitemap entries. Intentional campaign/confirmation noindex boundaries remain in place.
- Full gate: 138 tests pass, all four content linters pass, and every local link, fragment, canonical, language alternate, embedded asset and JSON-LD block passes validation.
- All 14 generators reproduce their sources without drift on a second complete run.
- Browser layout sweeps: all 416 existing routes at 390px and 1440px, then all 436 final routes at 320px. No page-wide horizontal overflow, missing routes, unlabelled visible fields or off-center visible form submission buttons were found.
- All 20 new article pages also pass at 1440px, 768px and 320px. Reviewed representative desktop/mobile screenshots, tables, expanded article navigation and the Commercial inquiry destination.
- All 20 new article URLs have a qualifying inbound main-content link beyond the blog indexes. Maintained source briefs match the reviewed batch.
- No valid production lead or borrower message was sent. Delivery and conversion regression tests use mocked integrations.
- Live release verification follows the tested preview and exact GitHub merge commit. Final production results are reported with completion, not inferred from local checks.

## SEO and AI-search interpretation

The site serves explanatory content in crawlable HTML with useful internal links, clear entities and source references. Google states that its normal search eligibility and helpful-content practices apply to AI features; special AI markup or text files are not required. The maintained `llms.txt` and `llms-full.txt` are navigation aids, not proof of rankings or citations. No keyword stuffing, hidden AI instructions, fabricated reviews or unsupported organization claims were added.

Sources checked during this audit:
- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a)
- [CFPB: business-purpose exemptions](https://www.consumerfinance.gov/rules-policy/regulations/1026/3/)

This release is an application/content audit and regression pass. It does not establish a ranking increase, a change in qualified lead volume, legal certification, email ownership or the absence of every possible vulnerability. Search Console/Bing outcome comparisons remain separate from code and rendering checks. Existing account metrics stay outside the public repository. Browser coverage is the available Chromium engine, not physical-device Safari/Firefox testing. Historical business claims, rates in prior closed-deal reports and unprovided owner records were not independently re-certified.
