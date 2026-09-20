# Georgia commercial financing page: retained implementation brief

Prepared September 20, 2026. Initially held for placement confirmation, then implemented after the owner confirmed broad real estate and CRE placement through Stonehaven's lender panel. That statement establishes scope for review, not guaranteed approval, unrestricted loan amounts or expanded residential licensing.

## Page and audience

- English: `/commercial/georgia`
- Spanish: `/es/commercial/georgia`
- Primary intent: Georgia commercial loan broker and commercial real estate financing in metro Atlanta.
- Secondary intent: Atlanta construction financing, acquisition/renovation capital and Georgia multifamily review.
- Audience: builders and commercial property owners with a defined project, budget and exit. Preserve $2M-$10M total project cost as the preferred builder focus, not a loan amount range or eligibility cap.

The local page connects service options to the Georgia office and clearly labeled examples. It does not create thin city variants or duplicate the national service pages. Financing details link to construction, fix-and-flip, multifamily, bridge and commercial sizing resources.

## Factual grounding

| Fact | Existing evidence | Editorial treatment |
| --- | --- | --- |
| Alpharetta office | `management.html` and current site footer: 10 Roswell Street, Suite 102, Alpharetta, GA 30009 | State the published address. No invented Atlanta office or local lender relationship. |
| Company identity | Existing organization schema and NMLS disclosure #1752355 | Brokerage throughout. Georgia is the page's service area; nationwide availability remains qualified. Do not characterize NMLS as a separate commercial loan approval. |
| Brookhaven construction | `/blog/brookhaven-ga-100-ltc-ground-up-construction` | Company-reported funded example. Full stated construction-budget financing with land equity, not all-in 100% project financing. No rate is repeated outside the blog. |
| Atlanta teardown guide | `/blog/atlanta-teardown-rebuild-construction-financing` | Educational and hypothetical, never represented as a funded transaction. |
| Development structure | `/blog/residential-development-financing-georgia-florida-texas-case-study` | Supplied anonymized structure, original location undisclosed, closing unverified. The listed states are discussed markets rather than confirmed transaction locations. |

## Implementation

The retained copy is `docs/cre-financing/georgia-service.json`; `scripts/build-cre-local.py` owns both HTML outputs. It clones shared chrome from the relevant multifamily page, strips that page's body styles/schema, and renders scoped CRE components with `Service`, `WebPage` and `BreadcrumbList` data. Reciprocal language alternates and self-referencing canonicals are emitted by the generator.

The top and bottom calls to action reuse existing Commercial intake: `/commercial#inquire` and `/es/commercial#enquire`. No form fields, processing logic, analytics conversion events, lead routing or sensitive data collection were added. Public copy says follow-up by text. Spanish links to English-only resource guides are labeled as English.

Release integration must register this generator before final search-navigation normalization, add both routes to sitemap/redirect handling, and add contextual inbound links from appropriate commercial and Georgia content. The root task owns that integration.

## Checks completed before integration

- Local desktop at 1280px and mobile at 320px: English layout inspected; Spanish mobile inspected. No main-content overflow. Both English buttons centered at 640px desktop and 160px mobile; Spanish buttons centered at 160px mobile.
- The Spanish CTA was clicked and reached `/es/commercial#enquire`, where the existing form has `data-sh-product="Commercial"` and `data-netlify="true"`. No submission was made.
- The page uses existing CRE styles, shared responsive navigation and the current compact logo assets.
- Root release work handles full site checks, generator replay, production deployment and final live verification.

## Construction companion update

The construction source also closes four explanatory gaps without advertising terms: builder experience, draw milestones/deposit timing, maturity and written extension conditions, and interest calculated on advanced funds versus the commitment. It does not promise eligibility for first-time builders or publish standard term lengths.

Source review on September 20: [OCC Commercial Real Estate Lending handbook](https://www.occ.treas.gov/publications-and-resources/publications/comptrollers-handbook/files/commercial-real-estate-lending/pub-ch-commercial-real-estate.pdf), especially developer review, disbursements and interest reserves; [CFPB construction-loan overview](https://www.consumerfinance.gov/ask-cfpb/what-is-a-construction-loan-en-108/), used only as consumer background. Neither source establishes Stonehaven's available programs.
