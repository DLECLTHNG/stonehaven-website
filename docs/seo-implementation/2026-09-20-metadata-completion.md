# Metadata completion, September 20, 2026

This implements Part A6 and A7 of the supplied next-phase brief. It does not change financing eligibility, authorship or the homepage's business positioning.

## Changes

- The final search-navigation generator now applies `scripts/search_metadata.py`. It gives every named Stonehaven Organization or FinancialService node the same organization ID, company NMLS identifier, office email and compact approved logo. This includes nested article authors, publishers and service providers. Person email addresses and identifiers remain separate. No external profile, credential or reviewer is invented.
- Four indexable canonical pages lacked Open Graph tags: residential, calculation methodology, bank statement loans and interest-only loans. These now receive title, description, canonical sharing URL and the approved 1200 by 630 social image. Existing sharing images use that versioned image. Blog sharing type is article. Descriptive social titles, H1s and JSON-LD article headlines are preserved.
- Forty-two English search titles are shortened with curated wording. Thirty-three retained publishing briefs now have `en.metaTitle`. Nine older posts have no retained original brief, so their explicit title decisions live in `scripts/search-title-overrides.json`. The generator reads publisher `metaTitle` values first when a retained brief exists. It does not truncate text mechanically. The homepage title uses the full business name, Stonehaven Lending. The separately authorized homepage revision leads with commercial real estate financing in both languages.
- Sitemap alternates are generated only when both English and Spanish destinations exist, are indexable, have matching canonical URLs, appear in the sitemap and link reciprocally through page-level hreflang. Every language entry includes itself, the other language and the English x-default. Dates, URL order and priorities are retained. Missing translations are never manufactured.

## Before and expected generated output

The supplied brief understated the sitemap baseline. The current checkout has 42 entries with alternates, rather than 14.

| Check | Before | After pure transform |
| --- | ---: | ---: |
| Public HTML pages | 390 | 390 |
| Stonehaven organization/service nodes missing NMLS | 255 | 0 |
| Organization nodes using a personal company email | 3 | 0 |
| Indexable pages missing Open Graph title | 4 | 0 |
| Indexable English titles longer than 70 characters | 42 | 0 |
| Sitemap URLs | 328 | 328 |
| Sitemap entries with complete reciprocal alternates | 42 | 294 |

There are 147 real language pairs and 34 unpaired sitemap pages. The count excludes intentional noindex pages. Search engines may choose a different title or ignore a submitted alternate; this work makes the site's own signals consistent and does not establish indexing or a ranking gain.

## Validation

Six regression tests in `tests/search-metadata.test.mjs` passed. They exercise nested identity completion while preserving human identities and unrelated IDs; search-title versus H1 separation; canonical and noindex safeguards; social image replacement; reciprocal language sitemap validation; and publisher title precedence. The metadata and sitemap transforms also reproduced byte-identical output when applied twice to all 390 current pages in memory. No public HTML was written during those checks. The release's integrated generator, site and browser checks remain the final verification.
