# Sitewide responsive cleanup

Scope: all 384 public HTML pages, including English, Spanish, articles, product pages, resource pages, landing pages, forms and thank-you pages.

## Changes

- Bounded and balanced shared hero headlines, with phone gutters.
- Moved legacy breadcrumbs below the current header height.
- Collapsed tablet navigation at 1000px, with scrollable menus that fit short screens and hide closed links from keyboard navigation.
- Added link-click and Escape closing to shared menus.
- Kept anchored sections clear of fixed headers.
- Stacked calculator and DSCR review fields on small phones; fixed the Spanish calculator view selector and tooltip bounds.
- Used 16px mobile form controls to avoid iOS focus zoom.
- Centered standalone article conversion buttons and improved consent/disclosure contrast on light backgrounds.
- Removed obsolete 42px full-logo overrides from HELOC pages.
- Fixed Family typography token and stylesheet version, with appropriate anchor clearance.
- Localized Spanish header call/menu labels and synchronized template asset versions.

## Verification

Rendered all 384 pages at 1280px desktop and 390px mobile widths; then checked every page at 320px. Final full desktop and small-phone passes reported zero uncontained horizontal overflow. Intentional horizontally scrollable comparison tables and hidden controls are excluded from overflow failures. Rechecked the corrected Spanish calculator at 390px. Spot-checked 10 main page variants at 768px and 1024px with no overflow.

Visually inspected homepage, article headings, tablet header/breadcrumbs and mobile calculator layouts. Tested mobile menu open and Escape close. Static audit found no missing local images, scripts or stylesheets, no missing image alt attributes and no duplicate IDs. All 67 tests, content checks, local link/SEO checks and generator replay passed before publication. No live lead submissions were made.

These checks cover responsive rendering in the available Chromium browser. They do not represent a physical-device Safari/Firefox test or a full financial/legal content review.
