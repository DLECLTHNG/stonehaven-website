# Draft handoff: DSCR series (10) and Family Opportunity series (4)

Prepared 2026-09-12. Nothing has been published, committed, or pushed. All fourteen articles
plus two editorial maps sit in `docs/`, which the Netlify build deletes before deploy, so none
of it can reach stonehavencre.com by accident.

- DSCR series: `docs/blog-drafts/` (10 articles, content map, QA script)
- Family series: `docs/family-drafts/` (4 posts, editorial map, QA script)

Re-run the gates any time:

    bash docs/blog-drafts/qa-drafts.sh
    bash docs/family-drafts/qa-family.sh

Both currently report GATE: PASS.

---

## Recommended publication order

### DSCR series

Publish the two foundation pieces first so the hub's internal links resolve, then the rest.

| Order | Slug | Why here |
|---|---|---|
| 1 | how-to-use-dscr-calculator | Supports the calculator page directly; every other article links to it |
| 2 | which-rent-counts-dscr-loan | The concept the local articles depend on |
| 3 | dscr-loan-down-payment-ltv | Referenced by 5, 6, 8 |
| 4 | dscr-too-low-restructure | Completes the arithmetic set |
| 5 | dscr-loans-georgia-investor-guide | The hub. Publishing it fifth means most of its links already resolve |
| 6 | first-time-investor-dscr-loan-georgia | Highest-intent commercial query in the set |
| 7 | dscr-cash-out-refinance-georgia | Pairs with the existing Florida cash-out closing post |
| 8 | duplex-triplex-fourplex-dscr-atlanta | Strongest local authority piece |
| 9 | short-term-rental-dscr-tampa | Second local piece |
| 10 | 5-8-unit-dscr-financing-charlotte | Longest and most specialized |

Alternative: publish 1 through 5 as a batch, then 6 through 10 as a second batch, so the hub
ships with a working link graph.

### Family series

Publish 1 first, then 2 and 3 in either order, then 4.

| Order | Slug |
|---|---|
| 1 | what-is-a-family-opportunity-mortgage |
| 2 | buy-house-for-parents-keep-own-home |
| 3 | home-for-adult-child-with-disability |
| 4 | family-opportunity-mortgage-vs-cosigning |

---

## Items needing business confirmation before anything publishes

### Blocking for the DSCR series

1. **The 7.25 percent illustrative rate.** Reused from the figure already published on /dscr
   rather than invented. It is labeled illustrative at every appearance in every body and
   disclaimed as not available. Confirm you are comfortable reusing it in evergreen educational
   posts, since the standing site rule reserves rates for closed-deal write-ups.
2. **Placeholder cost figures.** Three articles carry unverified placeholders that should either
   be confirmed or replaced with "quoted separately":
   - Article 6: $7,800 other closing costs
   - Article 7: $6,900 closing costs
   - Article 8: $340 per month hazard insurance
   - Article 9: $525 taxes and $290 insurance per month
3. **Spanish mirrors.** House rule is that every English post ships with its Spanish mirror in
   the same commit, and `scripts/new-post.mjs` requires both. Ten mirrors are not written. This
   is the single largest remaining task before publication.
4. **Article 10 does not claim Stonehaven offers a 5 to 8 unit product.** It says the rule set is
   modeled in the calculator and availability varies. Confirm that framing is what you want.

### Blocking for the Family series

5. **Freddie Mac divergence.** Freddie's parent provision carries no ability-to-work or income
   condition, while Fannie's does. The drafts state this difference plainly. Most competitor
   content states Fannie's test as though it applied to both. Confirm you want to publish the
   accurate version, because it will read as unusual next to other sites.
6. **Byline and review.** Nothing is labeled as reviewed by Chris De Leeuw, and no article is
   written from personal experience, because none was supplied. If you want a reviewer credit,
   it needs an actual review first.
7. **Spanish mirrors.** The two family landing pages have no Spanish versions (both /es/ URLs
   return 404), so there is no existing convention to follow for this series. Decide whether the
   family series is English only.

### Non-blocking, but worth knowing

8. **Georgia DOR pages carry no publication dates.** Substance is reliable; the dates are not
   citable. Articles 1, 6, 7, and 8 depend on them.
9. **A Georgia rule changed and most published guidance is wrong about it.** House Bill 581
   repealed the cap that set the prior sale price as the maximum fair market value, effective
   January 1, 2025. The drafts state the current position. Competing content does not.
10. **A Florida rule change and a pending ballot measure.** The vacation rental definition was
    rewritten effective July 1, 2025, and a November 2026 constitutional amendment would cut the
    non-homestead assessment cap from 10 percent to 5 percent effective January 1, 2027. Article
    9 flags the amendment as pending, not law. If it passes, Article 9 needs an update.
11. **Deliberately omitted as unverified**, recorded in each article's editor notes: numeric City
    of Atlanta and Atlanta Public Schools millage; whether a small Atlanta landlord needs an
    occupation tax certificate; whether Atlanta has any rental registration requirement; Tampa
    and Pinellas millage and tourist development tax rates; whether Mecklenburg imposes a local
    transfer tax; Charlotte Water's multifamily metering policy; and specific North Carolina
    building code section numbers, which sit behind a paywalled viewer.
12. **Article 9's St. Petersburg grandfathering** is attributed to the city as its own position
    rather than stated as settled law, which is how the research came back.
13. **Gift fund documentation rules** in family Post 4 are described only in general terms. They
    were not verified and should not be expanded without a verification pass.

---

## What was verified

- Every internal link target in the DSCR series was checked live on 2026-09-11. All 28
  destinations returned 200. The only non-resolving links are the sibling drafts, which resolve
  once the series publishes.
- Both family landing pages were checked live and return 200, so they are verified destinations
  rather than proposed ones. All eight blog URLs across both series are proposed.
- Every number in the DSCR series was computed in code against the site's own engines
  (`js/dscr-programs.js` and `js/dscr-calc.js`) and cross-checked against an independent
  amortization function, then rounded for display only. The Atlanta and Charlotte tax figures
  were derived from published millage rather than assumed.
- The family series contains no rate, APR, payment amount, payment period, down payment figure,
  or loan-to-value percentage in any article body, so no Regulation Z trigger term under
  12 CFR 1026.24(d) is used and no additional advertising disclosure is required.
- Zero em dashes across all sixteen files.
