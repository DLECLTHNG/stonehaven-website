# Stonehaven Lending: SEO and AI search audit

Audited September 18, 2026. Baseline: production and repository commit `6ded1bb`, following the sitewide desktop/mobile cleanup. Small corrective changes from this audit are listed separately below.

## Decision

The strongest next investment is a focused commercial real estate financing library built around actual borrower decisions and documented transactions. Stonehaven already has a sound crawlable foundation and substantially more developed DSCR and HELOC coverage. CRE has the clearest gap between the business opportunity and the depth of its pages.

Prioritize three durable service pages, three expanded existing guides, and verified deal evidence. Connect them to the existing calculators, team identities and lead forms. Measure qualified CRE inquiries and funded outcomes alongside search visibility.

There is no evidence here of a sitewide technical indexing failure. There is also no basis to claim that the site ranks highly in AI answers yet. Search Console, Bing, analytics account reports, backlinks and actual assistant citations require a separate account-backed baseline.

## Scope and confidence

| Area | Work completed | Boundary |
| --- | --- | --- |
| Technical SEO | All 384 public HTML pages, sitemap, metadata, canonicalization, language alternates, schema, internal link graph, robots and headers | Source eligibility does not prove indexing |
| Live availability | All 322 sitemap URLs fetched successfully with HTTP 200; representative redirects, 404, thank-you headers and bot user agents checked | Requests originated from this audit, not verified crawler IPs |
| Content | Sitewide inventory; detailed CRE review; comparison with existing DSCR/HELOC content and two relevant competing construction pages | No keyword-volume or rank-tracking dataset |
| AI discovery | Current primary guidance from Google, OpenAI, Microsoft, Perplexity and IndexNow | No controlled ChatGPT, Gemini, Copilot or Perplexity citation benchmark executed |
| Entity and evidence | On-site company, author, licensing, track-record and program-claim consistency | No independent re-verification of licenses or private closing records |
| Measurement | Source-code review of analytics events, lead success handling and CRM attribution | No production lead submitted; no GA4 or CRM outcome records inspected |
| Experience | Prior cleanup verified 384 pages at desktop and narrow mobile widths, plus representative tablet layouts | Browser layout checks are not field Core Web Vitals |
| External authority | Public discovery spot checks and a recommended authority plan | No complete backlink export or verified Business Profile account audit |

Search Console opened to its signed-out introduction. Account-only findings are explicitly marked pending. A missing search result in a sampled query is not evidence that a URL is unindexed.

## 1. Technical baseline

| Check | Result |
| --- | --- |
| Public HTML pages | 384 |
| Intended-indexable sitemap URLs | 322 |
| Deliberate noindex pages | 62 |
| Live sitemap responses | 322 of 322 returned 200 |
| Missing or duplicate titles/descriptions on indexable pages | 0 |
| Incorrect self-canonicals | 0 |
| Broken visible local links/fragments | 0 |
| Orphaned or unreachable indexable pages | 0 |
| Maximum internal depth from home | 3 links |
| Depth distribution, excluding home | 19 at depth 1; 173 at depth 2; 129 at depth 3 |
| Indexable pages with reciprocal language alternates | 288 |
| Remaining indexable pages | 34 without translated counterparts, not a hreflang error |
| Invalid JSON-LD syntax or future sitemap dates | 0 |

Canonical variants of `/commercial` using HTTP, www, trailing slash and `.html` each redirect to the HTTPS canonical destination. A deliberately missing route returns 404. The receipt page sends `noindex, nofollow` and `no-store` headers.

Keep the existing noindex decisions for receipts, conversion-only forms and overlapping campaign pages. Removing them across the board would not be a sound indexing strategy. The earlier September 15 “discovered, currently not indexed” examples need fresh URL Inspection data before any current diagnosis.

### Corrective work included with this audit

| Issue | Correction |
| --- | --- |
| Three resource hub breadcrumb schemas pointed to nonexistent `/resources` | Removed the nonexistent level and renumbered the real destinations |
| SEO checks validated visible links but missed breadcrumb destinations | Added recursive local breadcrumb URL validation with regression tests |
| Three Family campaign pages used unsupported `MortgageBroker` schema type | Replaced it with `FinancialService` in generated pages and their source generator |
| `llms.txt` used a general one-business-day response statement and omitted recent builder material | Clarified the commercial preliminary-response expectation and added the dated capital announcement and construction example |
| Commercial/SBA financing selectors did not update the top-level lead product | Fixed both supported selector names, checked known product lanes and synchronized the saved selection before submission |
| Prefilled calculator examples were counted as engagement | Commercial and SBA calculator-use events now require valid user interaction |

These are correctness and maintenance fixes. They do not constitute an indexing or ranking result. The Family schema correction has low CRE search impact because those campaign pages are intentionally noindex.

Validation: 77 tests and all site/content checks passed. All nine generators reproduce the edited output without drift. Browser checks confirmed that an English Commercial selection of DSCR and a Spanish SBA selection of Commercial update the form's lead classification. No live test inquiry was submitted. The shared runtime is versioned as `funnel.js?v=12`. The complete canonical HTTP result list is retained in `docs/seo-implementation/2026-09-18-live-http-results.json`.

### Remaining technical priorities

1. **Optimize the existing logo delivery.** The 1254-pixel PNG is 962,168 bytes and is reused in small header/footer/icon placements. Create appropriately sized derivatives from the approved original, retain the original artwork, supply explicit dimensions and use versioned caching. Measure before and after. Do not infer a Core Web Vitals failure from asset size alone.
2. **Connect structured entities.** Reuse a stable organization identifier such as `https://stonehavencre.com/#org` for publishers and providers. The current site has 493 inline Organization/FinancialService instances without IDs, versus 16 with that ID. Add external `sameAs` links only after verifying the exact company/person profile.
3. **Complete article identity where useful.** All 224 blog article pages omit `BlogPosting.image`; 204 omit `mainEntityOfPage`. These are optional completeness opportunities, not indexing blockers. Use relevant, genuine images when available, not a fabricated closing photograph.
4. **Shorten selected search titles.** Thirty-five indexable titles exceed 85 characters. Three builder guides are around 90 to 105 characters. Use the publisher's separate `metaTitle` field while keeping descriptive H1s. Search titles have no fixed character cutoff, so prioritize clarity over an arbitrary limit.
5. **Consider IndexNow after publication.** No implementation was found in the checked publishing workflow. Submit changed canonical public URLs after a successful production deploy, not every page on every run. Receipt confirms notification, not indexing. This is for participating engines, not a substitute for Google's sitemap and Search Console. [IndexNow documentation](https://www.indexnow.org/documentation)

## 2. What AI search visibility actually requires

Google's current guidance emphasizes established SEO, useful original material and search eligibility. It explicitly says that Google ignores `llms.txt`, requires no special AI schema and has no prescribed content length or tiny-section format. The practical implication here is to invest in substantive financing information and real evidence before additional AI-specific files. [Google AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

| Surface | Current site position | Next verification |
| --- | --- | --- |
| Google Search, AI Overviews and AI Mode | Crawlable HTML, sitemap, internal links and snippet-eligible content are present | Verify actual indexing and the property's Search generative AI setting |
| ChatGPT search | `OAI-SearchBot` is allowed in robots.txt; a synthetic request to `/commercial` succeeds | Check real verified bot access and run a repeatable citation sample |
| Microsoft Copilot and Bing AI | Public pages are accessible | Verify Bing property, index coverage and AI Performance reporting |
| Perplexity | `PerplexityBot` is allowed | Check verified bot traffic and sample citations |
| Claude and other assistants | Several relevant agents are allowed | Test discovery by platform; do not assume one crawler setting covers every answer source |

OpenAI distinguishes `OAI-SearchBot` for search from `GPTBot` for potential training use. Allowing training is not a prerequisite for ChatGPT search inclusion. User-triggered fetching is another distinct mechanism. Existing robot preferences were preserved. [OpenAI crawler documentation](https://developers.openai.com/api/docs/bots)

Perplexity likewise documents search crawling and user-triggered fetching separately. If a firewall blocks real crawlers, verify both the published IP ranges and user agent before creating a narrow exception. A user-agent string alone is spoofable. [Perplexity crawler documentation](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)

### Current reporting to use

Google now documents a **Generative AI performance report** for Search, including AI Overview and AI Mode impressions, with page, country, date and device views. Its documentation states worldwide rollout as of August 31, 2026, while noting that low impression volume can prevent a report from appearing. Do not describe this as an AI-specific click or conversion report. [Google report documentation](https://support.google.com/webmasters/answer/16984139)

Check **Settings → Search generative AI** in the correct Search Console property. Inclusion is documented as the default, and child properties can inherit a parent setting. This audit did not inspect Stonehaven's setting. [Google control documentation](https://support.google.com/webmasters/answer/16908024)

Bing's AI Performance report provides citations, cited URLs and sampled grounding queries across supported Microsoft AI surfaces. Its citation counts do not represent rank, placement or all AI platforms. Export them alongside search data. [Microsoft announcement](https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview)

## 3. CRE content gaps

The current commercial pillar has roughly 626 words of main content; the three asset-type pages have approximately 263 to 295 each, excluding navigation, footer and forms. The three key commercial resource articles have approximately 230 to 270 each. Counts vary with extraction rules and are diagnostic only. The issue is the small number of financing decisions answered, not a required word count.

These pages currently lack substantive external references and detailed worked underwriting examples. By comparison, several newer DSCR and HELOC resources already contain calculations, explicit assumptions, sources and practical checklists.

### First three evergreen service pages

These are proposed destinations, not published pages or newly confirmed product terms.

| Proposed destination | Primary prospect and intent | Required substance |
| --- | --- | --- |
| `/commercial/construction-loans` | Experienced builders seeking capital for $2M to $10M total-cost projects, including teardown/rebuild | Acquisition versus owned land, payoff, eligible costs, land equity, LTC and completed-value constraints, draw sequence, liquidity, experience, permits, sale/refinance exit |
| `/commercial/fix-and-flip` | Investors funding acquisition and substantial renovation | Purchase/rehab/value distinctions, initial advance versus rehab holdback, cash timing, contingency, resale assumptions and fallback exit |
| `/commercial/bridge-loans` | Owners acquiring or repositioning income-producing property before permanent financing | Occupancy, in-place versus stabilized NOI, reserves, recourse, interest structure, lease-up, maturity and takeout readiness |

Each page should explain Stonehaven's brokerage role, state/program limitations, the actual review process, and which deals are outside its focus. Use the existing text-follow-up form path and collect enough project information to route the inquiry correctly.

The $2M to $10M target refers to **total project cost** in the current approved announcement. It must not silently become a loan-size range or projected-value range. The existing general commercial page advertises a broader $1M to $50M+ loan range; distinguish the focused builder campaign from the overall commercial business.

### Improve these existing URLs before creating overlapping articles

| Existing URL | Missing value to add |
| --- | --- |
| `/resources/how-lenders-size-commercial-loans` | One complete example showing NOI, allowable debt service, amortization assumption, LTV limit, debt yield and the binding constraint; connect to the calculator and methodology |
| `/resources/commercial-refinance-guide` | A maturity timeline; payoff and prepayment costs; refinance-proceeds shortfall example; comparison of equity injection, extension, bridge and sale where relevant |
| `/resources/bridge-vs-permanent-financing` | Clear comparison of readiness, term, cash flow, reserves, recourse, exit requirements and total costs; two contrasting asset scenarios |
| `/commercial/multifamily` | Stabilized versus value-add cases, property scale, occupancy, NOI adjustments, recourse and agency-versus-bank-versus-bridge distinctions with current references |
| `/commercial/mixed-use` | Residential/commercial income mix, tenant rollover, owner occupancy, lease terms and appraisal considerations |
| `/commercial/commercial-property` | Asset-specific differences for retail, office, industrial and self-storage; replace undated market-appetite generalizations with dated evidence or qualified explanations |

Do not change `/dscr/bridge-loan-refinance` into the general CRE bridge page. It answers a different intent: taking a rental property out of short-term debt into longer-term DSCR financing.

### Internal links that would help immediately

- Add the expanded commercial refinance guide to relevant refinance, bridge and maturity sections. It currently has only one distinct incoming internal page.
- Link the new service pages from `/commercial`, relevant homepage commercial content, the commercial resource hub and matching builder articles.
- Link from each service page to a calculator, a practical guide and a relevant documented transaction, then link those resources back to the service page.
- The $45M announcement currently has two English in-content referring pages, `/blog` and `/commercial`. Add relevant links from the builder guides and commercial resource hub. Keep a durable service destination useful after the allocation changes.
- Add meaningful context around links. A heading, title and explanation are more useful than a long row of keyword links.

### Competitive comparison

Two construction-finance pages returned in the public discovery sample provide useful structural comparisons. This is not a claim that they outrank Stonehaven for every target query.

| Page reviewed | Useful feature | Stonehaven response |
| --- | --- | --- |
| [Cape Henry Capital construction loans](https://capehenrycapital.com/construction-loans) | Separate teardown, build-to-rent, build-to-sell and development scenarios; underwriting parameters and draw questions | Explain the decisions for Stonehaven's own confirmed programs and use its own examples |
| [Black Rock Mortgage spec construction](https://www.blackrockmortgage.com/spec-construction-loans/) | Identifiable professional author, dated program context and detailed builder cash-flow questions | Connect real expert identity and verified terms to the proposed construction page |

Do not copy competitor prose or transfer their pricing, leverage, geography or eligibility to Stonehaven.

## 4. Evidence, claims and entity consistency

### Give important claims an evidence record

| Claim or inconsistency | Required treatment |
| --- | --- |
| $220M+ funded transactions on the homepage | Maintain an internal definition, period and supporting record; clarify whether company or team experience where appropriate |
| $300M+ prior deal flow in Chris's biography | Keep separate from Stonehaven funded volume; facilitated deal flow is not the same metric |
| $45M capital deployment focus | Retain the September 18, 2026 announcement date and third-party capital-provider role; update availability when it changes |
| 100% LTC | Identify the eligible-cost denominator and other constraints; do not equate this with no cash required or 100% of completed value |
| Brookhaven case-study wording | The title says 100% LTC while the table describes 100% of construction costs with land equity. Confirm actual total-cost treatment, loan amount and build budget before expanding or syndicating the claim |
| Under-one-hour feedback | Distinguish an initial response from lender approval, a term sheet or closing. Reconcile product-specific expectations across pages rather than making a universal timing promise |
| Agency multifamily described as non-recourse | Review with the actual program qualifications and exceptions; do not generalize to every agency or commercial loan |

The case-study denominator review is a content-precision finding, not a conclusion that the funded transaction was misrepresented. This audit did not inspect closing documents or invent missing figures.

### Make professional identity traceable

Six resource articles name **Christiaan De Leeuw**; the management page uses **Chris De Leeuw**. Connect the preferred public name and genuine name variants to one visible profile and stable Person identifier. Maintain a consistent company identifier throughout schema.

All 224 blog articles use an Organization author. That is valid. A named author or reviewer should be added only when that person actually authored or reviewed the material. Profiles should describe relevant experience, link verified credentials and include a real photograph when available. Link the existing industry-recognition claim to its original source if verified.

### Build an original evidence library

Prioritize three consented, anonymized closed CRE cases, subject to actual available transactions:

1. Ground-up construction with owned land or an existing mortgage payoff.
2. Acquisition and heavy renovation with a defined draw structure.
3. Commercial refinance or bridge takeout with a proceeds or timing constraint.

For each, document property type, approximate region, original problem, cost, loan, value, funded structure, material conditions, timing and outcome. Keep the borrower's identity and exact property private unless expressly cleared. Separate closed facts, projected outcomes and hypothetical illustrations.

A later quarterly “what makes builder deals financeable” analysis could be valuable if built from sufficient real, anonymized records with a disclosed period, sample size and methodology. Do not invent aggregate approval rates or market statistics.

## 5. Whole-site priorities outside CRE

| Area | Assessment and next action |
| --- | --- |
| DSCR | Stronger developed content and calculators. There are 50 English state guides, with median main content about 535 words; 49 share a common calculation/CTA framework but include local references. Review queries, indexing and qualified leads before consolidation. No blanket noindex or another location-swapped batch |
| HELOC | Existing comparison, planning tools and program angles provide a useful foundation. Prioritize conversion and search data on existing pages, accurate current program statements, and continued collection of home value, balance and requested amount |
| Residential and Family | Preserve legitimate state boundaries, language alternates and privacy protections. Improve articles only where a real borrower question is unanswered. Do not add ad tracking to sensitive Family pages for SEO measurement |
| SBA | Expand existing 7(a)/504, down-payment and process guides with current SBA primary references. Clearly distinguish total project cost, lender loan and SBA debenture components |
| Spanish | Reciprocal alternates pass. Keep substantive changes synchronized and have financial terminology reviewed by a qualified fluent reviewer. English success does not establish Spanish query demand |
| Homepage and management | Clear brokerage identity is present. Improve the supporting evidence and paths into the new CRE service pages without displacing useful residential navigation |
| Blog and campaign LPs | Let educational articles and evergreen service pages carry organic discovery. Keep duplicated conversion-only campaigns out of the sitemap unless they earn a distinct durable purpose |

The recent visual cleanup is documented separately in `docs/qa/2026-09-18-responsive-cleanup.md`. Mobile and desktop presentation have been checked; field loading and interaction metrics remain pending.

## 6. Lead attribution and conversion quality

The source review found configured GA4 and the shared funnel on 358 of 384 public HTML pages, including the CRE pages checked. Successful accepted form delivery triggers `generate_lead`, which is more meaningful than counting a button click. The page count difference is not automatically a defect; some pages intentionally have different privacy or tracking requirements.

Current lead payloads preserve session UTMs and the submission page. They do **not** preserve the initial landing page, referrer origin, first-touch channel or a consistent analytics-to-CRM join. Untagged visits from search and assistants therefore cannot be reliably attributed to qualified CRE outcomes from this code alone.

### Recommended attribution change

- Save a sanitized first landing path and referrer origin, plus the existing allowlisted campaign values, under the site's applicable consent/privacy rules.
- Keep first-touch source separate from the page where the prospect submits. Record last-touch source separately if useful.
- Classify known assistant referral hosts conservatively and keep “unknown/direct” available. Missing referrers and user copying of links make AI attribution incomplete.
- Add an optional “How did you find us?” source field with search, ChatGPT/AI, referral and other choices. Keep the answer in the CRM, not in ad-event payloads.
- Use an internal random lead identifier for deduplication and outcome joins. Send approved aggregate events only, never borrower names, property addresses, financial figures or free-text scenarios to analytics or ad platforms.
- Report commercial leads by scenario type, financing fit, documents received, term sheet, funded outcome and source. A lead being delivered to the CRM does not establish that it is qualified.

An additional source finding concerned product selectors on the English/Spanish commercial and SBA pages: they use `name="product"`, while the shared listener only recognized `product_choice`. The selected choice could remain in extra fields while the top-level CRM/analytics product stayed at the page default. This is corrected with regression coverage in this audit's release. Historical product-level totals may still reflect the old classification.

The commercial and SBA calculators also emitted `calc_used` on initial loading of prefilled values. This release requires valid user interaction before counting use, so a prefilled example no longer inflates engagement.

The builder announcement's form asks for **estimated completed property value**, project type, ownership and timing. The campaign's $2M to $10M target is **total project cost**, which is a different amount. Add total project cost and requested financing in the next qualification improvement, with clear labels and financial values kept out of analytics/ad events.

The existing ChatGPT Ads pixel records accepted lead submissions. It does not establish organic ChatGPT visibility or citations. Also verify in GA4 that `generate_lead` is the primary inquiry key event: summing it with legacy `lead`, `quote_request`, `deal_review_request` and `form_submit_succeeded` events would double-count the same inquiry.

Detailed source references are retained in `docs/seo-implementation/2026-09-18-attribution-evidence.md`.

## 7. Earned authority and discovery

Public search samples retrieved Stonehaven's homepage, management, commercial sizing/refinance articles and several recent cases. That confirms some discoverability in the search tool used, not a complete Google index, a rank position or an AI citation.

A complete backlink and local profile audit is still pending. No backlink count, domain-authority score or verified Google Business Profile status is claimed.

Build external references around resources people would actually use:

| Audience | Useful contribution | Destination |
| --- | --- | --- |
| Builder associations and local industry groups | A practical land-equity or construction-draw workshop with a reusable checklist | Construction service page and worked guide |
| Commercial brokers and property managers | A refinance-readiness worksheet and a co-authored, permissioned case | Refinance guide and documented transaction |
| Accountants and real estate attorneys | A clear commercial debt-sizing explainer with source-backed definitions | Sizing guide and calculator |
| Industry publications and podcasts | An expert explanation grounded in a real anonymous closing or transparent analysis | Relevant original case or analysis |
| Existing verified business/professional profiles | Consistent name, website, NMLS identity, address and business description | Homepage and real team profile |

Assess prospective publications for relevant audience, editorial standards and genuine use, not an arbitrary link count. Use accurate membership listings only when membership exists. Avoid paid ranking links, fabricated reviews, invented mentions and mass guest-post packages. Referral compensation is a separate legal/business issue and is not part of this SEO recommendation.

No outreach, directory signup, review request, membership purchase or external profile edit was performed during this audit.

## 8. Target-query and assistant-prompt benchmark

These are prioritized intent hypotheses, not measured keyword volumes. Run the same set before publication and again after enough time for discovery. Use fresh sessions, a consistent U.S. locale and language, record platform/model/search mode/date, and repeat each prompt three times to expose variation. Compare English and Spanish separately.

| ID | Query or prompt | Preferred destination |
| --- | --- | --- |
| C01 | Who can arrange construction financing for a $2 million to $10 million builder project? | Proposed construction service page |
| C02 | Where can an experienced builder get up to 100% LTC construction financing? | Construction page plus existing 100% LTC guide |
| C03 | Does 100% LTC mean I need no cash at closing? | Existing builder cash-needed guide |
| C04 | Can I use owned land equity instead of cash for a construction loan? | Existing owned-property guide |
| C05 | Can a construction loan pay off the mortgage on a teardown property? | Existing owned-property guide |
| C06 | How do construction loan draws and inspections work? | Proposed draw-process guide |
| C07 | How do I finance a teardown and rebuild in metro Atlanta? | Existing Atlanta guide and real Brookhaven case |
| C08 | What documents does a lender need for a $5 million construction project? | Construction page and practical checklist |
| C09 | How do lenders compare LTC and after-completion value? | Expanded sizing/LTC guides |
| C10 | Who finances acquisition and rehab for a $3 million fix-and-flip project? | Proposed fix-and-flip page |
| C11 | Can I obtain commercial bridge financing on a partly vacant property? | Proposed CRE bridge page |
| C12 | How do I refinance a commercial loan when proceeds are below the payoff? | Expanded refinance guide |
| C13 | When should I start refinancing a commercial balloon loan? | Expanded refinance guide |
| C14 | How do DSCR, LTV and debt yield limit a commercial loan? | Expanded sizing guide and calculator |
| C15 | What financing fits a value-add multifamily acquisition? | Expanded multifamily page |
| C16 | How is financing for a mixed-use building underwritten? | Expanded mixed-use page |
| C17 | How does a builder plan a refinance exit into a rental-property loan? | Construction page linked to existing DSCR takeout material |
| C18 | What is the difference between a commercial mortgage broker and a direct lender? | Commercial pillar and company information |
| C19 | Is Stonehaven Lending a lender or a broker, and what does it finance? | Homepage, commercial page and management |
| C20 | Where can I find a commercial loan calculator that explains its assumptions? | Existing calculator and methodology |

For each response record: whether a live web search occurred, whether Stonehaven was mentioned, whether a Stonehaven URL was cited, which URL, exact relevant claims, cited competitors and any factual error. Keep evidence of the response. Do not mark an unexecuted prompt as a failure.

Use separate measures:

- **Mention share:** completed sampled responses mentioning Stonehaven / all completed sampled responses.
- **Citation share:** completed sampled responses citing a Stonehaven URL / all completed sampled responses.
- **Factual accuracy:** cited Stonehaven claims that match supported facts, reviewed individually.
- **Commercial outcomes:** identifiable organic/AI leads, qualified leads, term sheets and funded outcomes. Report unknown-source outcomes separately.

These are an internal sample, not universal AI market share or a stable numbered ranking. Assistant answers vary with context, location, model and retrieval.

## 9. Prioritized implementation backlog

Effort is relative: S is a focused change, M is a content/development workstream, L requires multiple pages or business evidence. These are planning estimates, not promises of ranking gains.

| Priority | Action | Impact hypothesis | Effort | Dependency / acceptance |
| --- | --- | --- | --- | --- |
| P0 | Establish current Search Console/Bing/GA4/CRM baseline | Prevents decisions based on assumed rankings or wrong conversion labels | M | Correct account access; date-stamped exports |
| Done in this release | Correct product selection and calculator-use counting | Makes commercial lead and engagement reporting more reliable | S | Regression tests; no live borrower data used |
| P1 | Resolve 100% LTC denominator and track-record evidence scope | Reduces ambiguous claims that assistants could repeat | S | Actual deal/program evidence; no invented figures |
| P1 | Publish three evergreen CRE service pages | Answers high-intent builder, flip and bridge needs | L | Confirmed eligibility; complete examples and working forms |
| P1 | Expand three existing CRE resources | Provides useful finance explanations worth linking and citing | L | Checked arithmetic, assumptions and primary references |
| P1 | Publish up to three verified closed CRE cases | Adds differentiated first-hand evidence | L | Real records and permission; no fabricated cases |
| P1 | Unify organization/person identity | Makes company and expert attribution consistent | M | Verified names/profiles and real authorship/review |
| P1 | Add contextual CRE internal links | Improves discovery and useful next steps | S | Relevant destinations, no duplicate intent pages |
| P1 | Preserve source and landing attribution to CRM | Connects content to qualified lead value | M | Consent/privacy-aware design; attribution regression tests |
| P1 | Add total project cost and financing request to builder qualification | Measures the actual campaign fit rather than confusing cost with completed value | S | Clear labels; existing Netlify/email/CRM path preserved |
| P2 | Optimize logo delivery and measure performance | Reduces avoidable transfer cost | M | Approved artwork; mobile/desktop render and lab/field checks |
| P2 | Improve asset-type commercial pages and SBA resources | Captures specific underwriting decisions | L | Current program references and honest boundaries |
| P2 | Establish legitimate external references | Builds discoverability beyond Stonehaven's own claims | Ongoing | Actual relationships, editorial interest and authorization to send |
| P2 | Add deployment-triggered IndexNow notification | Helps participating engines discover changes | S | Successful live deploy, canonical changed URLs, key verification |
| P3 | Add relevant article images and optional schema fields | Improves presentation and entity completeness | M | Authentic relevant assets; no schema promises |
| P3 | Refine long titles using actual query data | Improves search-result clarity | S | Clear intent; monitor impressions/CTR separately from position |

### First 30 days

**Week 1:** capture baseline; correct measurement; reconcile claims and professional identity; outline the three service pages; gather real case evidence. Apply immediate technical corrections from this audit.

**Week 2:** publish the construction and fix-and-flip pages, expand the sizing guide and connect them to existing builder articles, calculator and inquiry form. Verify all figures and mobile/desktop layouts.

**Week 3:** publish the commercial bridge page, expand refinance and bridge-comparison resources, and publish the first verified case if records are available. Improve logo delivery and source attribution.

**Week 4:** review initial indexing and discovery, complete remaining evidence-backed cases, run the prompt sample, and prepare a small targeted earned-media/outreach list. Do not substitute generic articles for missing evidence.

### Days 31 to 90

Use actual query and lead data to decide which asset-type pages and follow-up articles deserve investment. Compare rolling 28-day periods, retaining dates of major publications and campaign changes. Separate branded from non-branded queries, CRE from other products, English from Spanish, and paid traffic from organic/AI referrals. Do not interpret a short-term movement as causal proof.

Suggested operating goal: every priority CRE page answers the main decision, supplies a checked example, identifies its evidence and owner, has relevant internal links, and routes an accepted lead with the selected product and attributable source. Set numerical traffic and lead targets only after the baseline exists.

## 10. Account data still needed

1. **Search Console:** indexed/excluded pages, sample URL inspections, 3 to 6 months of page/query performance, branded/non-branded split, device/country filters, Core Web Vitals and the Search generative AI report/control.
2. **Bing Webmaster Tools:** verified domain, submitted sitemap, crawl/index coverage, search queries and AI Performance exports.
3. **Analytics and CRM:** accepted submissions, source/landing data, commercial qualification stages, duplicate handling, term sheets and funded outcomes. Review aggregates first.
4. **Business profiles and backlinks:** verify the exact Stonehaven Google/Bing profiles, name/address/phone consistency, professional profiles, referring domains and relevant editorial links.
5. **Real crawler logs and field performance:** verify search-bot identities and responses; use field data where available and label lab checks separately.

This audit delivers a site-level diagnosis and implementation plan. Account-dependent performance, actual assistant citations and business outcomes remain unmeasured until those records are available. No indexing, citation or ranking guarantee is made.
