# Search and AI discovery review, October 15, 2026

Status: implementation prepared for review. This document does not establish a production release or an improvement in rankings.

## Scope and findings

The audit inspected all 444 public HTML pages in the current production source and requested every matching live URL. All 444 returned HTTP 200 at their intended URLs. All 381 intended-indexable pages had matching canonical URLs. Local checks covered titles, descriptions, one H1, structured-data syntax, reciprocal language alternates, sitemap membership, internal links, fragments and assets. Every indexable content page other than the two homepages had an incoming main-content link. This is evidence of technical availability and discovery, not proof that Google or an AI search engine has indexed a page.

A source-reference check covered 150 distinct external article/body URLs, excluding booking and NMLS lookup links. Results were 126 HTTP 200, 21 access-denied responses, two confirmed HTTP 404 responses and one certificate hostname failure. Access denial to an automated check is recorded as unverified, not evidence that the link is broken for readers. The three confirmed link defects are corrected in the existing Minnesota, New Mexico and Montana DSCR guides, in English and Spanish and in their retained publishing briefs. The replacement official government pages each returned HTTP 200.

Three visible language toggles led to a different program or back to the same language: the two cash-out pages and Spanish SBA guide. The metadata normalizer now aligns the visible toggle with the declared alternate. A regression test verifies the alternate target, unrelated-link preservation and repeat-build stability.

The existing site already permits OAI-SearchBot, Google and other search crawlers. Canonicals, organization identifiers, editorial disclosures, source-linked guides, static HTML content and privacy-conscious referral attribution were present before this change. These are retained, not claimed as new work. No crawler identity was spoofed, no challenge bypassed, and no firewall or form security rule was loosened.

## Implemented improvements

- Eight existing core pages, English and Spanish commercial, DSCR, HELOC and cash-out, receive visible financing explanations with accessible tables, explicit assumptions and contextual links. There is no new thin topic or location page.
- The commercial comparison distinguishes construction, renovation/bridge, stabilized commercial property and 1–4 unit rental underwriting. It defines DSCR, LTV and LTC and links to the detailed sizing and financing guides.
- The DSCR example separates a qualification ratio from investment profitability, explains PITIA and distinguishes residential rental DSCR from commercial NOI-based coverage.
- The HELOC summary exposes the owner-confirmed $50,000 and 640 inquiry floors and a clearly hypothetical combined-equity calculation. These are not stated as approval guarantees or universal program limits.
- Cash-out titles and H1s identify the actual product. Copy separates the new loan balance from spendable proceeds and removes the overstatement that the current rate alone decides the question. It removes an unsupported blanket appraisal-waiver suggestion and a broad program-limit statement. The main CTA leads to its own cash-out form rather than a HELOC wizard with HELOC eligibility rules.
- Home-equity-loan comparison wording now permits fixed or adjustable payments on cash-out and instant pages, consistent with the CFPB explanation.
- Cash-out answers distinguish owner-occupied, investment rental and commercial refinancing, linking to the existing appropriate guides. Spanish links use the Spanish equivalent when one exists; a few detailed sources remain English-only.
- Only eight substantively revised service pages receive an October 15 sitemap modification date. Historical article publication dates and source-link-only correction dates are not refreshed to simulate new content.
- The selected-pillar text export derives its content-update date from its actual source pages instead of retaining a hard-coded September date. It remains a convenience, not a claimed search ranking mechanism.

The maintained answer source is `scripts/search-answer-content.json`, rendered through `scripts/search_answers.py` in the final navigation generator. Styling is confined to the eight pages. Existing generated pages that borrow a header have the unused stylesheet removed during normalization.

## Validation and boundaries

All 187 tests, four content linters and the complete SEO checker passed. All 15 page generators were replayed and a second pass produced no changes. Responsive checks cover the eight revised service pages at 390 and 1440 pixels, including English and Spanish. Each has one H1, one answer block and no page-level horizontal overflow. Wide comparison tables scroll inside a labeled, keyboard-focusable region; a mobile hint explains that interaction. Desktop commercial and mobile Spanish cash-out layouts were visually inspected.

Form markup and external script tags are compared against the base commit. No lead fields, consent, validation thresholds, Netlify registration, email destination, CRM relay, tracking logic or private application code are changed. No synthetic leads are created by this SEO work. The earlier delivery audit remains a separate task and is not declared complete here.

Family publication remains paused. No new Family, FHA, VA, HELOC-persona or first-time-buyer content is created. No sitemap mass-submission, indexing request, IndexNow batch, backlink purchase, outreach, account permission change or advertising change is performed.

## Account-informed priorities

After the owner restored Search Console access, current Web, Google generative AI and indexing reports were reviewed. Account figures and query exports remain outside this repository. The reports support improving existing financing answers and internal paths: DSCR cash-out, home equity tools and the commercial refinance cash-in-gap article are among discovered URLs awaiting indexing. The core-page answers now link to those relevant resources. Existing indexing validation is left intact. No change is represented as a confirmed indexing fix or ranking gain.

## How to evaluate this work

Compare equal completed reporting periods after an approved production release. Annotate this release separately from the September changes. Use actual Search Console queries, page impressions, clicks and indexing; Bing AI citations where available; and qualified CRM inquiries with the existing attribution. A technically accessible page is not necessarily indexed. A citation is not necessarily a visit, and a visit is not necessarily a qualified lead. Sparse samples and reporting lag must remain explicit.

Google's guidance prioritizes useful original information and normal crawl/indexing fundamentals for AI search features. It does not require special AI schema or an llms file. OpenAI documents OAI-SearchBot access for ChatGPT search. Bing's AI Performance report can expose citations and referenced pages where available. None guarantees inclusion or higher rankings.

The largest remaining credibility opportunity is original, approved transaction evidence: the actual funded structure, challenge, figures, timing and outcome for a construction, renovation or refinance example. Do not turn a hypothetical scenario into a closing or assign a human review that did not happen. Existing sizing worksheets and architect guides can support legitimate editorial references from relevant professionals and publications, but outreach and external posting require authorization.

## Primary references

- https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.openai.com/api/docs/bots
- https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/
- https://www.consumerfinance.gov/ask-cfpb/what-is-a-home-equity-line-of-credit-heloc-en-107/
- https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-home-equity-loan-and-a-home-equity-line-of-credit-heloc-en-247/
- https://www.consumerfinance.gov/ask-cfpb/what-other-types-of-loans-are-similar-to-a-heloc-en-253/
- https://www.occ.treas.gov/publications-and-resources/publications/comptrollers-handbook/files/commercial-real-estate-lending/index-commercial-real-estate-lending.html
- https://visiolending.com/dscr-loans/ (formula context only, not a Stonehaven relationship or program promise)
- https://www.revenue.state.mn.us/property-tax-administrators-manual
- https://www.tax.newmexico.gov/businesses/state-assessed-property-bureau-overview/additional-info/
- https://revenue.mt.gov/property/property-tax-changes/homesteads-and-long-term-rentals
