# Spanish search title clarity

Date: 2026-09-20

Sixteen existing Spanish blog pages now use shorter, topic-first search titles. Each keeps the product or housing question recognizable and retains the Stonehaven Lending brand suffix. This improves clarity in search results and browser tabs; it does not guarantee rankings or the title a search engine chooses to display.

## Changes

All routes below are under `/es/blog/`. The table omits the common ` | Stonehaven Lending` suffix.

| Article slug | Search title | Source owner |
| --- | --- | --- |
| `5-8-unit-dscr-financing-charlotte` | Préstamos DSCR para 5–8 unidades en Charlotte | Title overrides |
| `condo-renovation-home-equity` | Patrimonio para renovar un condominio | Retained brief |
| `contractor-financing-vs-heloc` | Financiamiento del contratista o HELOC | Retained brief |
| `dscr-cash-out-refinance-georgia` | DSCR con retiro de efectivo en Georgia | Title overrides |
| `dscr-loans-georgia-investor-guide` | Préstamos DSCR en Georgia: guía | Retained brief |
| `dscr-too-low-restructure` | DSCR bajo: cómo ajustar el préstamo | Title overrides |
| `duplex-triplex-fourplex-dscr-atlanta` | DSCR para dúplex, tríplex y cuádruplex en Atlanta | Title overrides |
| `first-time-investor-dscr-loan-georgia` | DSCR para nuevos inversionistas en Georgia | Title overrides |
| `heloc-vs-cash-out-refinance` | HELOC o refinanciamiento con retiro de efectivo | Retained brief |
| `heloc-vs-home-equity-contract` | HELOC o contrato sobre patrimonio | Retained brief |
| `home-equity-before-buying-another-home` | Usar el patrimonio para comprar otra vivienda | Retained brief |
| `how-to-use-dscr-calculator` | Cómo usar la calculadora DSCR | Title overrides |
| `planning-separate-home-adult-child-disability` | Vivienda para un hijo adulto con discapacidad | Retained brief |
| `self-employed-heloc-income-documents` | HELOC para independientes: documentos de ingresos | Retained brief |
| `short-term-rental-dscr-tampa` | DSCR para alquileres a corto plazo en Tampa Bay | Title overrides |
| `which-rent-counts-dscr-loan` | ¿Qué renta cuenta para un préstamo DSCR? | Title overrides |

## Preserved content and behavior

Only the HTML title and its generated visible and structured breadcrumb label change on each page. The descriptive H1, article headline schema, body, description, social metadata, dates, canonical URL, language alternates, links and inquiry destinations remain unchanged. English pages are unchanged. Family privacy exclusions and all form, analytics and CRM behavior remain unchanged.

## Source ownership

Eight titles are stored as `es.metaTitle` in their retained publisher briefs: seven under `docs/blog-briefs/` and the Georgia investor guide under `docs/state-blog-rollout/briefs/`. The other eight legacy article titles are explicit entries in `scripts/search-title-overrides.json`.

`scripts/search_metadata.py` reads these sources, with retained `metaTitle` fields taking precedence. `scripts/build-search-navigation.py` applies the final search metadata and synchronizes breadcrumb labels. The existing `scripts/new-post.mjs` publisher also supports `metaTitle`, so a retained brief can reproduce its intended title without shortening the article H1.

## Validation

- `node scripts/check-site.mjs` passed: 110 tests and SEO checks across 402 pages and 340 sitemap URLs.
- All 13 generators ran in CI order. SHA-256 snapshots of all 743 tracked and nonignored untracked files matched before and after, with no changed, added or removed files. This comparison used the current pending edits as its baseline.
- A scoped comparison against `HEAD` confirmed exactly 16 HTML pages change only in their title and generated breadcrumb regions. The eight brief edits add only `es.metaTitle`; the overrides file adds only the eight intended Spanish routes.
- `git diff --check` passed. No unrelated drift or new behavior tests were needed for this metadata-only change.
