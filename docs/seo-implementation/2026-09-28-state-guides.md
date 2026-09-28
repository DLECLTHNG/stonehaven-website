# State pages and residential guide directory

Dependent review PR: builds on the September 28 three-line positioning PR. Awaiting owner approval, not released to production.

- Repositions the English and Spanish openings for Georgia, Alabama, Tennessee, Florida, North Carolina and South Carolina toward homes valued at $1 million and above.
- Preserves every state licensing section verbatim, along with existing inquiry fields, values and routing IDs.
- Replaces the broad program promotion with conforming/jumbo guidance and a quiet FHA/VA/other-program link to the residential resource directory.
- Removes Family promotion from the state-page contextual blocks. Family articles stay live and the residential directories link to them.
- Puts high-value-home guides first in the English directory while preserving every existing guide link. Adds a Spanish directory with Spanish destinations where already available and clearly labeled English links otherwise.
- Connects the Spanish Residential pages to that translated directory. The English guide directory gains reciprocal language links.

Verification: 181 tests, all four linters and the SEO checks pass. All 15 generators run in CI order and a second pass is unchanged. All 378 original sitemap URLs remain. Across both PRs, three URLs are added: the two jumbo guides and the Spanish residential directory. No noindex campaign page or HELOC application changed. No live forms submitted.

Browser QA: 28 cases covering all six state pages and the guide directory in both languages at 390 and 1440 pixels, with no horizontal overflow. Representative Florida and directory screenshots, plus measurements, are in `2026-09-28-state-screenshots/`. See the updated `2026-09-28-link-audit.md` for before/after links and remaining indexable sources.

Changed routes in this PR:

- `/residential/{georgia,alabama,tennessee,florida,north-carolina,south-carolina}` and their `/es` counterparts.
- `/resources/residential` and new `/es/resources/residential`.
- `/es/residential`, `/es/residential/buy`, `/es/residential/refinance`, `/es/residential/jumbo-loans` (directory destination only).

Release date remains pending. After an approved merge and verified production deployment, record the date and use the existing IndexNow step. No other search-console or ad-account changes are part of this PR.

Review PRs: [#48](https://github.com/DLECLTHNG/stonehaven-website/pull/48) and [#49](https://github.com/DLECLTHNG/stonehaven-website/pull/49). [First preview](https://deploy-preview-48--splendid-tulumba-0cbb01.netlify.app/) and [combined preview](https://deploy-preview-49--splendid-tulumba-0cbb01.netlify.app/). Both require owner approval before merging.
