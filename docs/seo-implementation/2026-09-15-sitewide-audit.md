# Site-wide search audit and implementation, September 15, 2026

Audited 380 HTML pages, including 318 intended-indexable sitemap URLs. Existing checks found no missing/duplicate titles or descriptions, incorrect canonicals, broken internal links, future dates or orphaned searchable pages. Missing language tags on English-only pages are not a defect; no nonexistent translations were invented.

Implemented:
- Visible breadcrumbs and matching BreadcrumbList data on 244 additional pages. Existing breadcrumb schemas remain intact. No new executable tracking scripts were added.
- English and Spanish blog navigation organized by HELOC, DSCR, builder financing, family housing and other mortgage/SBA options.
- Eight contextual program/resource link sections across both homepages, resource hubs and the new mortgage product pages.
- Reciprocal language-alternate validation in the release gate.
- A deterministic final navigation build step in CI. New article generation strips inherited navigation metadata before creating its own article shell.
- Family privacy tests continue to allow only the existing menu JavaScript, plus non-executable article and breadcrumb JSON-LD.

Maintenance: run `python3 scripts/build-search-navigation.py` after the existing generators and after publishing articles, before site checks. This script owns only SEARCH-NAV blocks and search-navigation.css references. It does not change financial claims, lead endpoints, noindex rules, canonicals, article dates or licensing. Do not rewrite sitemap dates solely because shared navigation changed.

Primary guidance reviewed:
- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- https://developers.google.com/search/docs/appearance/ai-features

Limits: this is a source-level site-wide audit with representative browser/live checks, not an account-level Search Console or field Core Web Vitals audit. Search Console query, index and conversion evidence is needed to prioritize consolidation and measure ranking changes. No ranking increase is claimed and no thin location pages or fake reviews were created.

Measured internal-link changes (distinct indexable referring pages): bank-statement loans 3 to 6; interest-only loans 2 to 6; HELOC 36 to 38. These are link counts, not traffic measurements. Validation: 65 tests, all content/SEO gates, deterministic navigation rebuild, full generator sequence and representative desktop/Spanish mobile inspection.
