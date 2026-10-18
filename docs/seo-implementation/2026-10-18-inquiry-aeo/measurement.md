# Measurement plan

The hypothesis is that a clear action plus a shorter first-contact option increases contactable, relevant financing inquiries without lowering qualified-opportunity quality. The release date starts the observation window; October 18 is the preparation date, not a production launch date.

## Funnel definitions

| Measure | Definition and source |
| --- | --- |
| Eligible visits | Consented measured visits to the relevant page, split by product, language, source and device where sample size supports it. State analytics/privacy coverage limitations. |
| Accepted inquiries | Distinct opaque submission IDs accepted by the form endpoint. Existing `generate_lead` event, not a new duplicate conversion event. |
| Delivered inquiries | Netlify saved submission plus CRM receipt, reconciled by browser ID and Netlify ID. Email is an operational receipt check. Accepted alone is insufficient. |
| Legitimate/contactable inquiries | Human-reviewed, non-test, non-spam, non-duplicate inquiry with usable name/email and a real financing need. A synthetic test is never a lead. |
| Booked conversations | Confirmed calendar booking linked privately to the inquiry, not a booking-link click or telephone-link click. |
| Qualified opportunities | Team's documented qualification stage in CRM, with reason and product, not inferred from form answers alone. |
| Funded outcomes | Closed/funded CRM record and date, linked to the inquiry. Distinguish loan volume, revenue and project value. |

Preserve measured attribution separately from self-reported discovery. Group `ai_referral`, organic search, paid campaigns, referrals and unknown separately. Keep organic AI apart from paid ChatGPT campaigns. An ordinary Google referrer is not proof of AI Overview use. Do not put CRM IDs or private answers into public URLs or analytics parameters. Existing opaque inquiry IDs are the private reconciliation key; do not add cross-session tracking.

Use the 28 completed days before deployment as baseline, with a two-day Search Console lag allowance and the actual latest complete date recorded. Baseline extraction of qualified/booked/funded stages requires the CRM's real stage definitions and access. Missing measurements stay unavailable, never zero. Keep all account exports and counts private.

## Reviews

| Time from release | Work and decision |
| --- | --- |
| Day 30 | Verify capture, office notifications and CRM matching. Compare equal completed windows; report visits, accepted, delivered, contactable and qualified counts with denominators. Segment quick-v1 versus retained detailed paths and page/product/source. Record simultaneous campaigns and releases. Establish the follow-up baseline; do not declare a winner from a handful of events. |
| Day 60 | Revisit inquiry quality, reply method and form abandonment where actually measured. Inspect priority URLs individually. Review search queries and AI cited pages/grounding queries; adjust existing content where evidence shows an unanswered borrower need. |
| Day 90 | Compare with the day-30 baseline using equal windows. Review qualified/booked/funded outcomes with their longer maturation time. Repeat the same question panel and annotate engine/UI changes. Keep, revise or remove the quick path based on quality as well as conversion. |

These are implementation-review instructions, not a new automation. The existing October 20, November 19 and December 19 Search Console review schedule remains unchanged. The paused Family publishing automation stays paused.

Google AI impressions, Bing citations, AI referrals, self-reported discovery and CRM outcomes are distinct measures. Report counts and sample sizes. An impression is not a visit; a citation is not a funded lead; a changed answer is not a stable rank.

## Repeatable non-branded question panel

Run one fresh conversation per question in an authorized consumer interface. Record engine/model or visible mode, date/time, region/language, personalization state, exact prompt, recommendation yes/no, citation yes/no, cited URL, competing firms, and a saved answer/screenshot. Keep prompts synthetic and free of borrower data. Repeat the same phrasing. API experiments or normal search results are not consumer-app rankings. No consumer-app ranking observations are claimed in this release.

| # | Question | Existing destination |
| --- | --- | --- |
| 1 | How can a builder finance a teardown and rebuild in Atlanta? | `/commercial/construction-loans` |
| 2 | Can land I already own count toward my construction financing contribution? | `/blog/construction-loan-property-already-owned-mortgage-payoff` |
| 3 | Does 100% LTC construction financing mean I need no cash at closing? | `/blog/100-ltc-construction-loans-builder-cash-needed` |
| 4 | How do I finance a Brookhaven teardown when the existing house has a mortgage? | `/blog/atlanta-teardown-rebuild-construction-financing` |
| 5 | How should I budget interest reserves and contingency for a spec build? | `/blog/construction-loan-interest-reserve-vs-contingency` |
| 6 | How can I refinance a maturing hard-money loan on a Florida rental? | `/dscr/bridge-loan-refinance` |
| 7 | How does a DSCR cash-out refinance work on a rental property? | `/dscr/cash-out-refinance` |
| 8 | Which rent counts when qualifying for a DSCR loan? | `/blog/which-rent-counts-dscr-loan` |
| 9 | Can an LLC get financing for a Georgia rental property? | `/dscr/llc-investors` |
| 10 | How do I refinance after buying and rehabbing a rental with cash? | `/dscr/brrrr-refinance` |
| 11 | How much cash should I keep aside for DSCR closing costs and reserves? | `/blog/dscr-loan-reserves-cash-to-close` |
| 12 | What changes when financing an Airbnb instead of a long-term rental? | `/dscr/short-term-rentals` |
| 13 | How do lot releases work on a subdivision development loan? | `/blog/subdivision-loan-lot-release-prices` |
| 14 | What does a land development financing request need before terms can be reviewed? | `/commercial/land-development-loans` |
| 15 | How are apartment acquisition loans sized using NOI, DSCR and debt yield? | `/commercial/multifamily-acquisition` |
| 16 | What if a commercial refinance will not fully pay off the existing loan? | `/blog/commercial-refinance-cash-in-gap` |
| 17 | How can an architect help a developer prepare a financeable project? | `/commercial/construction-financing-for-architects` |
| 18 | Can SBA financing help an operating business buy the building it occupies? | `/sba` |
| 19 | How do self-employed borrowers finance a home worth more than $1 million? | `/residential/jumbo-loans` |
| 20 | ¿Cómo puedo refinanciar una propiedad de alquiler para pagar un préstamo puente? | `/es/dscr` |

Question selection reflects existing service scope and observed queries/cited pages, not invented keyword volumes. New-location variants are not justified by this panel alone.
