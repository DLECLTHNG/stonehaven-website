# Commercial resource guide expansion, September 18, 2026

Three existing guides now answer distinct borrower questions with original, explicitly hypothetical calculations:

- `/resources/how-lenders-size-commercial-loans`: DSCR, LTV and debt-yield limits, the binding constraint, sensitivity to changes in NOI and value, and construction versus stabilized-property sizing.
- `/resources/commercial-refinance-guide`: maturity planning, actual payoff requirements, prepayment structures, net proceeds, cash shortfalls and document preparation.
- `/resources/bridge-vs-permanent-financing`: financing fit, initial advances versus draws, contractual conversion versus a future refinance, and a stressed takeout example.

Published dates remain July 30, 2026. Article `dateModified` and visible update dates are September 18, 2026. Existing author attribution is retained. No new human review, closed transaction, current lender quote or guaranteed eligibility is claimed.

## Evidence and references checked

- [OCC Commercial Real Estate Lending handbook](https://www.occ.treas.gov/publications-and-resources/publications/comptrollers-handbook/files/commercial-real-estate-lending/pub-ch-commercial-real-estate.pdf), Version 2.0, March 2022, with the March 2025 notation: DSCR, debt yield and value analysis, printed pages 42–43. This supports the definitions, not the examples' invented thresholds.
- [OCC Bulletin 2024-29: Commercial Lending, Refinance Risk](https://www.occ.treas.gov/news-issuances/bulletins/2024/bulletin-2024-29.html): assessing payoff capacity and stress testing under changed borrower or market conditions.
- [Fannie Mae: Finding Prepayment Terms](https://multifamily.fanniemae.com/job-aid/payoff-calculator/finding-prepayment-terms): use the actual note, loan agreement and applicable notice provisions. The article expressly says Fannie Mae's document references are not universal lender terms.
- [Freddie Mac Value-Add program summary](https://mf.freddiemac.com/docs/product/value_add.pdf): a limited example of a rehabilitation product and then-current underwriting for a refinance. The guide does not claim this particular program is available for a reader's submission.

All public references were retrieved September 18, 2026. The new prose and numerical scenarios are original. No actual borrower, property address or closing is invented.

## Arithmetic verified

### Sizing example

Assumptions: $400,000 NOI; $6 million value; minimum 1.25x DSCR; 8% annual debt-service constant; maximum 70% LTV; minimum 9% debt yield.

- DSCR limit: $400,000 / 1.25 / 0.08 = $4,000,000.
- LTV limit: $6,000,000 * 0.70 = $4,200,000.
- Debt-yield limit: $400,000 / 0.09 = $4,444,444.44.
- Lowest modeled limit: $4,000,000. Resulting DSCR 1.25x, LTV 66.6667%, debt yield 10%.
- $360,000 NOI sensitivity: lowest limit $3,600,000.
- $5.5 million value sensitivity: lowest limit $3,850,000.
- 11% debt-yield sensitivity: lowest limit $3,636,363.64.
- Increasing value to $6.5 million leaves the $4 million DSCR limit unchanged.

The annual debt-service constant is expressly not an advertised interest rate or APR. The existing commercial calculator is described accurately as a DSCR/LTV model, with lender-specific debt-yield tests checked separately.

### Refinance example

$4,000,000 new loan minus $3,900,000 principal, $20,000 accrued interest and payoff charges, $78,000 illustrative prepayment premium, $60,000 closing costs and $42,000 reserves = negative $100,000. The 2% premium is explicitly hypothetical and assumed to apply before the existing loan's prepayment period ends.

$140,000 nonrecoverable costs / $5,000 monthly savings = 28-month simple cash-flow break-even. At 24 months savings are $120,000, or $20,000 below costs. The text explains the assumptions and limitations of this screen.

### Bridge exit example

Base case: minimum of $500,000 / 1.25 / 0.08, $7,000,000 * 0.70, and $500,000 / 0.09 = $4,900,000. Subtract $150,000 closing costs and reserves, then $4,600,000 total bridge payoff, leaving $150,000.

Downside: minimum of $450,000 / 1.25 / 0.085, $6,300,000 * 0.70, and $450,000 / 0.09 = $4,235,294.12. Subtract $150,000 and $4,600,000, leaving a $514,705.88 shortfall, shown as $514,706.

## Implementation and validation

- Tables use semantic captions, row/column headers and horizontally scrollable, keyboard-focusable labeled regions.
- Body copy uses a readable maximum width and left alignment; all bottom CTA buttons use a centered flex container and wrap on small screens.
- Existing header, footer, canonical paths and publication dates are preserved.
- No shared CSS, shared JavaScript, sitemap or CI files changed by this subtask.
- One H1, unique IDs, valid internal section anchors and valid Article/Breadcrumb JSON-LD checked on all three pages.
- All example arithmetic was independently verified with Python assertions.
- The site test command passed 89 tests and its lint checks at this stage. Its SEO stage flagged only the nine links to the three new product destinations being built in parallel. Integration must create those destinations and rerun the complete release gate.
- Desktop/mobile browser inspection remains an integration check; source validation alone is not a visual verification.
