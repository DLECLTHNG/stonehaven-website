# Website takeover, September 12, 2026

## Working context

Original website revision: `b11f583ae30ea74676796cfac94bad2d2a81de20`.
Working branch: `codex/website-takeover` in `/Users/c/Documents/ChatGPT/STONEHAVEN CODING/stonehaven-website`.

The supplied handoff and brief were treated as project context. The original checkout and production have not been changed. This first improvement pass covers blog usability and publishing reliability; it does not claim to finish every open item in the handoff.

## What was learned

The site is a static bilingual mortgage brokerage website with product pages, calculators, Netlify lead forms, and four Python landing-page generators. The generators reproduce their original outputs without changes. Shared footer and asset dependencies make isolated edits to generated HTML unsafe. The release path is a direct main-branch Netlify deployment.

## Changes prepared

- Fixed invisible blog articles and index cards. The shared animation requires 16 percent of an element to intersect the viewport. Long articles and the entire post list cannot meet that threshold on small screens. Blog content now renders immediately. Other page animations retain their behavior.
- Reduced article padding on phones and allowed table cells to wrap. English and Spanish article previews at 390 pixels showed visible content and no page overflow.
- Reframed both blog indexes as guides and closings, including titles, descriptions and introductory copy.
- Corrected educational disclosures on twelve guides in both languages, including two older explainers beyond the ten in the handoff. Three actual closing stories retain their closing disclosure. Eligibility and equal-housing language remains in place. Spanish copy has not received native human review.
- Restored concise booking button labels across the blog and routed Spanish booking buttons to the Spanish booking page.
- Added explicit guide/closing classification to new post briefs, validated both languages before writing, rejected duplicate publication, and retained future source briefs under `docs/blog-briefs/`. Existing posts still require manual bilingual editing because their original briefs are missing.
- Added one check command for all tests, four content linters and a case-insensitive release content gate. Netlify now runs it before stripping internal files. GitHub checks run on pushes and pull requests, including generator drift detection.
- Replaced the stale README with current development and publishing instructions.

## Validation

- All existing test files and five new publishing regression tests pass.
- All four content linters pass.
- All four generators produce unchanged landing pages.
- The exact Netlify build command passed in a disposable copy. Internal files were removed and headers, routes and server functions retained.
- Browser inspection covered the desktop index and English/Spanish mobile article visibility, wrapping and booking text.
- `git diff --check` passes.

The build was tested locally. Remote GitHub Actions and a Netlify cloud deployment have not run for this branch. The checks enforce existing rules; they do not establish legal approval of every article.

## Next priorities

1. Connect and verify the website-to-CRM lead path after establishing the CRM's deployment and server authentication contract.
2. Resolve the handoff's unverified illustrative figures and rate assumptions with the owner. No numeric assumptions were changed in this pass.
3. Review homepage and product-page conversion paths, accessibility and performance, using the working design as the baseline.
4. Decide the Family content rollout and Spanish review process. Tracking, indexing and unpublished Family articles were not changed.

Review the prepared changes before publishing. A push to upstream main is a production release.
