# First-time investor resource library

Prepared September 21, 2026.

## Purpose and routes

Help someone considering their first investment understand financing before selecting a property or requesting terms. Five substantive guides sit under one learning hub, with complete English and Spanish versions. Spanish uses the same slugs under `/es`.

- `/resources/first-time-property-investor`: learning hub and investment journey.
- `/resources/first-investment-property-financing`: financing by intended use, condition, borrower circumstances and exit.
- `/resources/first-fix-and-flip-financing`: acquisition advances, holdbacks, LTC versus ARV, cash needs and sale sensitivity.
- `/resources/first-dscr-loan`: qualifying rent versus cash flow, underwriting preparation and refinance shortfalls.
- `/resources/first-rehab-loan`: scope, contractor payments, draw timing, contingency and repayment.
- `/resources/investment-property-deal-checklist`: scenario summary, staged documents and written-term comparisons.

The general guide includes residential rentals, owner-occupied multifamily, mixed-use, commercial acquisitions and development. It directs readers toward existing specialist guides where the financing question needs more detail.

## Editorial basis

`guides.json` is the retained bilingual source. All monetary examples are hypothetical. No invented borrower stories, closed transactions, rates or universal first-time-investor eligibility thresholds appear in these guides. Stonehaven's role is brokerage, structuring support and lender placement; lender underwriting remains separate. Up to 100% of eligible costs is described as a scenario-dependent possibility, not a promise of no cash needed or first-time eligibility.

Primary references reviewed on September 21, 2026:

- [Fannie Mae rental income](https://selling-guide.fanniemae.com/sel/b3-3.8-01/rental-income), including the September 2, 2026 update. Conventional rental-income treatment is distinguished from private DSCR underwriting.
- [Fannie Mae HomeStyle Renovation](https://singlefamily.fanniemae.com/originating-underwriting/mortgage-products/homestyle-renovation), for the distinction between renovation financing routes.
- [Lima One fix-and-flip financing](https://www.limaone.com/hard-money-fix-n-flip/) and [draw process](https://www.limaone.com/construction-draw-process-explained/), as examples of lender-specific criteria and administration, not Stonehaven product terms.
- [Kiavi rental financing](https://www.kiavi.com/loans/rental) and [first rental DSCR guide](https://www.kiavi.com/blog/dscr-loan-guide-how-to-finance-your-first-rental-property), as program-specific context.
- [OCC Bulletin 2024-29](https://www.occ.treas.gov/news-issuances/bulletins/2024/bulletin-2024-29.html), for the need to evaluate refinance risk separately.

Spanish content has automated structural and casing validation. No independent native-language or licensed professional review is claimed.

## Maintenance and discovery

Edit `guides.json`, run `python3 scripts/build-investor-guides.py`, then `python3 scripts/build-search-navigation.py`. Update the retained modification date when content materially changes. The guide generator owns the twelve pages, sitemap additions and `.html` canonical redirects; the shared navigation build maintains metadata and language alternates.

The library has contextual links from the homepage, product pages, resource hubs, calculators and relevant blog posts. Guides link to one another and to existing product resources. Each page has a canonical URL, reciprocal language alternates, visible breadcrumbs and corresponding structured data. The hub has a five-item list; guides have Article markup. Public discovery files include the English content. These are discovery aids and do not guarantee indexing, citations or rankings.

## Inquiry behavior

The guides link to existing contact, fix-and-flip, bridge and DSCR review forms. Spanish links use the corresponding Spanish routes, including the contact page's `#enquire` anchor. No new form or collection endpoint is introduced. Public CTAs ask for a scenario and explain text or email follow-up. Existing Netlify, email, CRM, consent and conversion behavior remains unchanged.

## Validation

- All fourteen generators regenerated without drift.
- `node scripts/check-site.mjs`: 110 tests passed; 414 HTML pages and 352 sitemap URLs checked with no broken local links or future dates.
- All twelve pages checked at 320, 390, 768 and 1440 pixel widths. No page or heading overflow. Tables scroll inside focusable labeled regions on small screens.
- One H1 per page, no missing section anchors, no broken loaded images, centered CTA buttons, desktop sticky contents and mobile static contents verified.
- Mobile menu and English-to-Spanish navigation verified. All eight distinct language/product CTA destinations opened the intended existing form without submitting a lead.
- Visual inspection covered the hub hero, reading layout, cards, mobile example and desktop CTA. The full-page screenshot stitch was unreliable in the browser, so viewport screenshots and DOM dimensions were used for layout conclusions.
- Twelve example calculations checked, including purchase equity, draw gap, LTC, ARV ratio, flip profit sensitivity, DSCR, operating cash flow and refinance proceeds.

The pull request and deployment checks provide the release record. Verify the live canonical pages after deployment before reporting publication complete.

## Formatting QA follow-up, September 21, 2026

A fresh review of all twelve published pages confirmed heading wrapping, centered CTAs, table containment and 16px article text at small-phone and laptop sizes. It identified two refinements: the longest Spanish contents menu extended below a 600px-high laptop viewport, and narrow tables offered no visible swipe instruction. On short desktop windows, the contents menu now scrolls naturally with the page. Phone tables include a localized instruction to reveal remaining columns. Small hero and CTA labels also use darker text for easier reading.

The stylesheet version is advanced to `v=2` through the retained generator. Article content, metadata, inquiry destinations and lead routing remain unchanged.

Follow-up validation covered all twelve pages at 320×640, 390×844, 600×900, 768×1024, 1024×600 and 1440×900: 72 layouts with no page or heading overflow, off-center CTA, undersized CTA target or missing mobile table cue. Viewport screenshots confirmed the short-window Spanish menu and mobile table layout; horizontal scrolling exposes the remaining columns without scrolling the page. All 110 site tests and fourteen generator drift checks passed.
