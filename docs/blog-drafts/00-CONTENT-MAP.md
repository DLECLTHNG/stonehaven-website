# DSCR article series: content map (drafts, not published)

Prepared 2026-09-11. Ten articles. Markets confirmed by owner on 2026-09-11:
primary state Georgia; Priority Market A metro Atlanta; Priority Market B Tampa Bay,
Florida; Priority Market C Charlotte, North Carolina.

## Standing constraints applied to every article

- Stonehaven Lending is a mortgage brokerage, not a direct lender. Financing is
  "arranged through third-party capital providers."
- No borrower names, addresses, invented deals, testimonials, or first-person experience.
- Every worked example is labeled hypothetical. The illustrative rate is 7.25%,
  reused from the figure already published on /dscr rather than invented for these drafts.
  It is labeled illustrative at every appearance and never presented as available.
- No universal minimum FICO, DSCR, LTV, or down payment is asserted. Program rules are
  described as the rules modeled in Stonehaven's calculator, with an explicit note that
  lender guidelines differ.
- Every figure was computed in code against the site's own engines
  (js/dscr-programs.js, js/dscr-calc.js), then rounded for display only.
- No em dashes.

## Differentiation against content already published

| Existing page | Its role | How the series avoids overlap |
|---|---|---|
| /dscr | Commercial pillar for the DSCR product | Articles link to it for the offer, never restate it |
| /dscr-program-calculator | The tool itself | Articles send readers to it; only Article 2 describes the interface |
| /dscr-analyzer | Sizing tool | Introduced in Articles 2, 3, 5 where target-ratio sizing matters |
| /blog/dscr-loans-explained | National explainer of what DSCR financing is | Article 1 is Georgia-specific and process-led, not a second explainer |
| /blog/dscr-program-calculator-qualifying-rent | Rule reference, one illustration per program | Article 4 covers where the numbers come from (appraisal forms, leases, receipts) and the advertised-versus-qualifying gap, not a rule catalog |
| /dscr/* persona pages | Conversion pages by borrower type | Articles carry the arithmetic those pages deliberately omit |

## The ten articles

| # | Slug | Primary query | Geography | Distinct job | Worked example result |
|---|---|---|---|---|---|
| 1 | dscr-loans-georgia-investor-guide | dscr loan georgia | Georgia | Series hub: what DSCR measures, the Georgia process, when to use the calculator | SFR purchase, 1.21x |
| 2 | how-to-use-dscr-calculator | dscr calculator how to use | None | Input-by-input walkthrough of the two public tools, monthly versus annual expenses | 1.14x, plus the annual-in-monthly-field error at 0.34x |
| 3 | dscr-loan-down-payment-ltv | dscr loan down payment | None | The leverage tradeoff at 70/75/80 percent, rate held constant | 1.22x / 1.16x / 1.10x |
| 4 | which-rent-counts-dscr-loan | qualifying rent dscr loan | None | Where each rent number comes from and why advertised gross overstates it | Triplex: $5,650 advertised, $5,300 qualifying |
| 5 | dscr-too-low-restructure | dscr too low | None | Four structures compared before and after, with the cash each requires | 0.84x to 1.04x / 0.93x / 1.08x |
| 6 | dscr-cash-out-refinance-georgia | dscr cash out refinance georgia | Georgia | Refinance sizing: gross cash out versus money received | $75,000 gross, net after costs |
| 7 | first-time-investor-dscr-loan-georgia | first time investor dscr loan | Georgia | Eligibility question plus the full cash stack | 1.10x, cash stack itemized |
| 8 | duplex-triplex-fourplex-dscr-atlanta | fourplex financing atlanta | Metro Atlanta | Unit-by-unit schedule plus the Georgia post-sale assessment mechanic | Fourplex, 1.43x |
| 9 | short-term-rental-dscr-tampa | short term rental loan tampa | Tampa Bay | Rental legality versus lender qualification | 0.91x on market rent, what changes it |
| 10 | 5-8-unit-dscr-financing-charlotte | 5 to 8 unit financing charlotte | Charlotte | Rental-income math versus commercial NOI underwriting on one building | 1.39x rental math, 1.10x NOI view |

## Link graph

Every article links to the calculator, to /dscr, to the deal submission at /dscr-review,
and to two or three siblings. Article 1 is the hub and links to all nine others.
Articles 8, 9 and 10 link back to Article 1 and to Article 4.

## Publication prerequisites

These are drafts. Before any of them publish:
1. Each needs its Spanish mirror. The house rule is that every English post ships with its
   Spanish mirror in the same commit, and scripts/new-post.mjs requires both.
2. The illustrative 7.25% rate needs owner sign-off for reuse in evergreen educational posts.
3. Local facts flagged in each article's editor notes need owner or counsel confirmation.
