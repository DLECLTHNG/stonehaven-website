# Inquiry and AI-search improvements, 18 October 2026

Status: review preview. Production publication requires Chris's approval. This release implements the supplied October 18 brief within the site's existing business scope. No new product or location pages, paid campaign changes, training-permission changes or Family publications.

## Changes to review

| Destination | Change |
| --- | --- |
| `/`, `/es/` | Primary inquiry button and secondary telephone link above the funded counter; mobile headline separator; two linked, dated transaction summaries. Existing short form remains at the bottom. |
| `/dscr`, `/es/dscr` | Short email/text inquiry alongside existing educational and calculator paths; Florida DSCR transaction evidence. |
| Sixteen indexable `/dscr/*` scenario pages | Short initial inquiry with purpose supplied by the page. The intentionally noindex working-professionals route is excluded. Full DSCR review and calculators remain available. |
| `/dscr/cash-out-refinance` | Financing-specific heading and title, Florida hard-money payoff evidence. |
| `/dscr/bridge-loan-refinance` | Clear bridge/hard-money-to-DSCR heading and Florida payoff evidence. |
| `/commercial/construction-loans`, plus Spanish | Short initial inquiry before the existing detailed project form; Brookhaven construction-budget evidence, with land-equity limitation. |
| `/commercial/land-development-loans`, `/commercial/multifamily-acquisition`, `/sba`, `/residential/jumbo-loans`, plus Spanish | Short initial inquiry; detailed review destination retained and verified. |
| Shared English and Spanish footers | Replace unqualified nationwide-program sentences with commercial/DSCR/SBA availability caveat and residential state scope. License identifiers are preserved pending authoritative reconciliation. |
| Shared inquiry script | Recognize exact supported AI UTM sources without a referrer; retain paid-medium precedence, GPC and sensitive-route exclusions. Expand only the bounded public CRE path allowlist. |

There are 28 new quick forms, all registered under the existing Netlify `lead` contract. Required name and email preserve Chris's earlier instruction. Reply choice defaults to email; texts require a mobile number. Optional deal details are collapsed. A booked conversation is an alternative link, not recorded as a confirmed appointment. No SSN or financial-detail fields were added to quick forms.

The native no-JavaScript path also retains product, language, purpose and reply preference in the registered lead contract and relay. The browser and shared server validator enforce the quick-form reply rules. The existing capture, email notification and CRM relay remain the delivery path. `inquiry_path=quick-v1`, financing purpose, reply preference, language and opaque submission identifier remain in the lead record. Contact fields, answers and attribution details are not added to ordinary analytics events. `generate_lead` still means accepted submission, not confirmed mailbox or CRM receipt. Source labels based on UTM tags are attribution signals, not proof of an AI recommendation. Ordinary Google traffic is not labeled AI.

The measured homepage mobile audit identified render-blocking styles and low-contrast footer text. The English and Spanish homepages now combine six local stylesheets in their original cascade order, with a content-hashed URL, and improve the flagged numeral/footer contrast. The existing Cormorant and Inter fonts are served locally on the two homepages, with Latin and Latin-extended files, retained OFL licenses and priority font preloads. Measurement, advertising and security controls remain intact.

## Evidence and editorial treatment

The two summaries link to existing company-reported transactions, not newly invented examples. Historical rates and the Florida one-week closing were not repeated as standard offers. Brookhaven's financing is 100% of the stated construction budget with land equity, not 100% of all project costs or a zero-cash promise. The educational Georgia/Florida/Texas development article remains separate. The existing $220 million counter was not repeated elsewhere.

The evidence register supplies reusable fields for closing month, state, property type, objective, obstacle, financing, role, limitations and source. It does not assert an independent verification or a named expert review. Existing biographies and bylines are retained without fabricated credentials, photos, quotes or review dates.

## Validation and discovery

All 192 automated tests pass. Full site checks cover contacts and HELOC minimums, security, consent/privacy, attribution, duplicate/retry behavior, CRM relay and calculator rules. All generators were rerun with no output drift. SEO checks cover 444 HTML pages and 381 canonical sitemap URLs, translations, structured data and local links. Material page modifications receive October 18 dates; a shared script or footer update does not reset every article date.

The existing `scripts/notify-indexnow.mjs` verifies live content before submitting canonical URLs. No duplicate integration was added. Submit the materially changed canonical URLs only after production approval and verification. Do not request indexing for the preview. Inspect Brookhaven's retained URL and request a targeted recrawl after a material live correction if its indexed text remains stale. Indexing is not guaranteed.

Account exports, crawler IP verification, performance measurements and lead QA belong outside the public repository under `seo-private/2026-10-18-inquiry-aeo`. Account metrics are baseline observations, not a claim of improved conversions. See that private record for timestamps and reporting windows.

Browser QA included 320/390px mobile and 1440px desktop, English/Spanish contact errors and keyboard focus. The final mobile lab run measured Performance 81 and Accessibility 100, compared with the production baseline of 68 and 96. First content appeared at 1.1s versus 2.9s; LCP remained 5.2s and needs further work. These single-run lab comparisons do not establish real-user Core Web Vitals or conversion uplift. The preview is intentionally noindex, and its toolbar is blocked by the existing CSP, so preview SEO/Best Practices scores are not production scores.

## Remaining owner facts

1. **Legal identity and licenses:** provide the current company NMLS record, legal/DBA relationship and state authorizations that reconcile Stonehaven with the identically numbered Home Lenders of America licenses flagged by the supplied audit. NMLS Consumer Access could not be retrieved by the research tool. No numbers were guessed or changed.
2. **Response commitments:** confirm product-specific staffing hours, time zone, and whether under-one-hour commercial feedback and one-business-day responses are commitments or targets. New quick forms make no faster promise. Existing approved claims remain pending reconciliation.
3. **Evidence approval:** confirm what period, entities and role support the $220 million counter; identify approved photos, anonymized closing evidence and any client quote permissions. Name an actual reviewer before adding a reviewed-by claim.
4. **Profiles:** share or confirm the controlled Google Business Profile, Bing Places, company LinkedIn and professional profiles. The public search did not identify an unambiguous match, which does not prove absence. Match the business name, address, phone, domain and license identity before adding `sameAs` links or proposing new listings. Do not confuse Stonehaven Lending in Alpharetta with Stonehaven Mortgage in Illinois or other similarly named firms.

For approved profiles, reconcile their details, add links to the relevant financing pages, maintain genuine photos and hours, and invite authentic reviews from real clients without incentives or scripted claims. Useful architectural, builder and professional-association coverage is preferable to purchased ranking links. No outreach was sent.

## Next three actions

1. Approve the preview, publish through the existing Git/Netlify workflow, then verify the quick inquiry through the production CRM relay before measuring it as fully delivered. The preview test was saved in Netlify and Chris confirmed its office email alert. CRM forwarding is disabled in preview by configuration, and remains enabled in production. No preview credentials or permissions were expanded.
2. Reconcile identity, licenses, response hours and the funded-volume evidence. Then align verified profiles and add genuinely reviewed expertise and approved transaction evidence.
3. Use the measurement plan to compare legitimate inquiries and quality by page/source. Improve the strongest observed borrower questions before creating more pages.
