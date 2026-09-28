# Three-line website positioning

Owner direction, 28 September 2026: the homepage, navigation and Residential section focus on commercial real estate, SBA financing and homes valued at $1 million and above. Other programs remain live but are no longer promoted from those places. Supersedes the 20 September homepage correction.

Release status: awaiting owner approval. No production release date yet. Each PR requires approval before merging. Submit changed URLs through the existing IndexNow step only after an approved deployment.

## Scope and sources

PR 1 updates the English and Spanish homepage, shared standard footer, Residential overview, purchase and refinance pages, and adds the bilingual jumbo guide. It updates bank-statement and interest-only openings, calculator example inputs, company structured data and AI discovery files. Homepage guides remain near the top and the scenario form remains at the bottom, as in PR 46. The funded counter and founder section are preserved.

Maintained page sources are in `scripts/positioning-templates`, rebuilt by `site_positioning.py` through the final navigation generator. The shared footer normalizer is also used by `new-post.mjs`. Campaign generators retain a legacy footer source so their noindex pages do not inherit this repositioning. No tracking logic, form fields, option values, routing IDs, minimums or application code changed. The new jumbo page uses the existing `residential` form ID. The organization description spells out one million dollars to keep the existing Family content safeguards intact.

Daily Family publishing was paused in the existing automation on September 28. Its authorized October, November and December SEO reviews remain scheduled. No new article batches were written. The September 25 wave-three brief was not present in the current repository or the older supplied docs directory; this change does not claim to complete its other tasks.

Market sources checked September 28, 2026:

- [FHFA 2026 conforming limits](https://www.fhfa.gov/news/news-release/fhfa-announces-conforming-loan-limit-values-for-2026): one-unit baseline of $832,750, with higher county limits where applicable.
- [CFPB jumbo definition](https://www.consumerfinance.gov/ask-cfpb/what-is-a-jumbo-loan-en-116/).
- [Chase jumbo preparation](https://www.chase.com/personal/mortgage/education/financing-a-home/how-to-prepare-for-jumbo-mortgage): general documentation and reserves context.
- [Chase jumbo application process](https://www.chase.com/personal/mortgage/education/financing-a-home/jumbo-loan-application-process): additional appraisal review can depend on the lender and transaction. Its older loan-limit figure is not used.

These sources are educational references, not claims about a Stonehaven lender relationship or available program terms.

## Verification and review material

See [before/after links and reachability](2026-09-28-link-audit.md). All 378 original sitemap URLs remain, with two jumbo URLs added in PR 1. The audit checks preserved existing form control tags and script tags, and unchanged noindex pages. HELOC application code and content remain untouched.

The full CI generator sequence is replayed twice, with a clean second pass, followed by `node scripts/check-site.mjs`. Browser checks cover `/`, `/residential` and `/residential/jumbo-loans`, English and Spanish, at 390 and 1440 pixels. Screenshot files are in `2026-09-28-screenshots/`. No live inquiries are submitted.

## Article proposals, not drafts

| Proposed topic | Owner facts needed before writing |
| --- | --- |
| Construction financing with owned land: equity, payoff and draw timing | Current placement paths, treatment of land equity, approved anonymized example if desired |
| Bridge-to-permanent financing for a mixed-use acquisition | Current eligible property uses and exit paths; approved example and transaction facts |
| DSCR refinance planning across several rental properties | Available single-property or portfolio structures, ownership requirements and approved examples |
| SBA 7(a) versus 504 for an owner-occupied commercial purchase | Current placement process, who coordinates CDC involvement, and an approved example if used |
| A $1 million home does not always need a jumbo mortgage | Confirm the financing structures Stonehaven can currently arrange; no new facts needed for the FHFA explanation alone |
| Documenting business income for a high-value home purchase | Confirm available full-documentation, bank-statement and other income-review paths before naming programs |

## Owner decisions

Approve or request edits to the two PR previews. No new form ID is needed. Program-specific claims remain omitted pending confirmed capabilities. Ad campaigns, account access, licensing claims, the funded total, London wording and legal identity are outside this change.

Changed page URLs for post-deploy verification and IndexNow: [release URL list](2026-09-28-changed-urls.txt). Shared footer and organization updates affect all listed standard pages. Release date remains pending.
