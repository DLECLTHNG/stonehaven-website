# Family publication: September 25, 2026

Status: published and verified. September 25, 2026 is complete. Do not publish another topic for this Eastern calendar date.

- Eastern trigger: September 25, 2026, 9:00 a.m.
- Topic: Family Opportunity mortgage versus co-signing for a parent.
- Slug: family-opportunity-mortgage-vs-cosigning
- Audience: parents. Distinct adult-child guide linked separately.
- Duplicate checks: remote main and PR history, retained briefs, Family growth directory and current live blog index showed no publication for this date or existing comparison article.
- Adapted the retained draft against current Fannie Mae occupancy, non-occupant borrower and personal gift guidance. Corrected the draft's assumption that a non-occupant borrower must normally be on title; removed unsupported universal claims and unverified Freddie Mac comparisons.
- Primary sources checked September 25: B2-1.1-01, B2-2-04, B3-4.3-04 at selling-guide.fanniemae.com. Linked in both language versions.
- No rates, approval promises, customer stories or new licensing claims. Examples explicitly hypothetical.
- Generated both articles with scripts/new-post.mjs, product Family, familyAudience parents. Existing navigation-only script and parent inquiry destination preserved. No new form or tracking.
- Updated English/Spanish indexes, sitemap, redirects, retained brief and contextual links from the existing keep-your-home article.
- No backfill. Next planned angle: buying before a parent sells their current home.
- No SEO review due before October 20, 2026.

## Pre-release validation

- All 181 automated tests and four content linters passed.
- SEO validation: 439 HTML pages, 376 sitemap URLs, no broken local links or future dates.
- Both language versions checked in Chromium at 390px and 1440px with loaded fonts and settled responsive transitions. No horizontal overflow; headings and CTA visually reviewed.
- Confirmed exactly one external script, local blog-ui.js; no advertising, analytics or lead endpoint requests, no embedded form, and the parent inquiry destination remains /buy-a-home-for-parents.

## Verified release

- PR: https://github.com/DLECLTHNG/stonehaven-website/pull/45 (merged).
- Article release commit: 5efd7fd87bc6df36bfee94a08c873074bb22b887.
- Exact-commit CI passed: https://github.com/DLECLTHNG/stonehaven-website/actions/runs/36139018658.
- Netlify production deployment 6ab67223c862520008cadcea, ready and published September 25, 2026 at 13:08:07 UTC (9:08 a.m. Eastern).
- Verified HTTP 200, matching canonical, visible article heading, mobile width and parent CTA for both live URLs:
  - https://stonehavencre.com/blog/family-opportunity-mortgage-vs-cosigning
  - https://stonehavencre.com/es/blog/family-opportunity-mortgage-vs-cosigning
- Live browser checks found no advertising or analytics requests. No inquiry or outreach was sent.
