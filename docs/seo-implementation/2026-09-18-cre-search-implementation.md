# CRE search implementation, September 18, 2026

Implements the priority on-site recommendations from the September 18 SEO and AI search audit. This is a record of changes and validation, not a claim of higher rankings, indexing or AI citations.

## Published content in this release

| Area | Changes |
| --- | --- |
| Evergreen services | Construction, fix-and-flip and commercial bridge financing pages, each in English and Spanish. They explain the financing decision, eligible cost versus value, draw timing, equity, exit planning and what to submit. |
| Commercial guides | Expanded loan sizing, commercial refinancing and bridge versus permanent financing with explicit assumptions, worked examples, primary references and links to relevant inquiry paths. Original publication dates remain, with a substantive update date. |
| Asset types | Expanded multifamily, mixed-use and commercial property pages in both languages. Replaced blanket eligibility, nonrecourse and lender-appetite statements with specific underwriting questions. |
| Existing case | Clarified the Brookhaven closing as financing the full stated construction budget with land equity. The public figures do not establish an all-in 100% LTC ratio or realized profit. The unchanged URL preserves existing links. |
| Builder intake | Added total project cost and requested financing to the English and Spanish $45M announcement forms. Completed value remains separate. New service forms also request project type, ownership and timing, with optional discovery source. |

The builder focus remains $2M to $10M in **total project cost**, not a newly invented loan-size range. Potential 100% financing refers to eligible costs on qualifying deals. Stonehaven's brokerage role and third-party underwriting are explicit. New examples are labeled hypothetical. The previously supplied development financing scenario is not presented as a confirmed closing.

Sources and calculations are documented in the new page source brief, `docs/cre-financing/service-pages.json`, and the companion guide and asset-page expansion notes. Primary underwriting references include the OCC, Fannie Mae, Freddie Mac and SBA. No new interest-rate offer was added outside the blog.

## Discovery and identity

- Added crawlable links from home, Commercial, the blog, relevant CRE articles, asset pages and the commercial resource hub to the three new services. Builder guides also link to the dated capital announcement.
- Reused `https://stonehavencre.com/#org` for Stonehaven publisher/provider entities. Existing named resource authors now link to the same visible management profiles and stable Person IDs. No reviewer, credential or external profile was invented.
- Added stable article IDs and `mainEntityOfPage` where missing. Existing organization-authored blog posts remain organization-authored.
- Shortened six English/Spanish builder search titles while keeping descriptive article headings. Added six canonical sitemap entries with reciprocal language alternates and explicit clean-URL redirects.
- Updated `llms.txt` as a factual navigation aid. No special ranking effect is asserted. Visible questions remain on the service pages without reintroducing the site's deliberately retired FAQPage markup.

All 328 indexable pages are reachable from the homepage within three links. The three new English services are one link from home; their Spanish counterparts are two links away. Technical eligibility is not proof that an engine has indexed a page.

## Lead source information and privacy

The shared form runtime now retains bounded session context for the initial eligible landing path, referring origin, conservative source channel and last allowlisted CRE article. Submission attaches that context and an opaque retry-stable browser submission ID to the existing private Netlify/CRM record. The text summary is available in the existing notification and CRM flow. Lead destinations and email notification configuration were not replaced.

The review fixed two initially uncovered gaps: `/terms-sheet` was being mistaken for a legal document, and several real calculator destinations were missing from the safe-path allowlist. Regression coverage now exercises all 39 actual English/Spanish root form destinations.

GPC and sensitive Family exclusions remain. Reading the privacy policy preserves an earlier valid source without tracking the policy itself. Arbitrary query strings, referrer paths and private application paths are excluded. Source context, financial fields, discovery answers and free text do not become ad conversion parameters. See `2026-09-18-source-attribution.md` for precise boundaries and identity limitations.

The shared runtime is versioned as `funnel.js?v=13` in 364 pages and their source templates. The existing accepted-submission conversion behavior remains covered by tests. No production test inquiry was submitted.

## IndexNow release helper

`scripts/notify-indexnow.mjs` validates explicit canonical sitemap paths. Without `--submit`, it only previews. With `--submit`, it first verifies the public ownership file, live HTTP 200, substantive deployed content, canonical and indexability, then notifies the official IndexNow endpoint. The content comparison accommodates only known Netlify form attribute transformations. Changed text, links, fields or form actions still fail.

Example after a successful production deployment:

```sh
node scripts/notify-indexnow.mjs --submit /commercial/construction-loans /commercial/fix-and-flip /commercial/bridge-loans
```

The root text file is a public ownership-verification token, not an account credential. The helper is manual and does not create a recurring automation. Send only changed canonical public URLs. HTTP 200 or 202 confirms notification receipt, not indexing or ranking. Google discovery still relies on the sitemap, links and its own crawling. [IndexNow protocol](https://www.indexnow.org/documentation)

## Validation

- 99 automated tests passed, including submission routing, source privacy, failed-delivery retries and IndexNow safeguards.
- All site checks passed: 390 HTML pages, 328 sitemap URLs, no broken local links/fragments, duplicate indexable titles/descriptions, canonical or alternate errors, invalid JSON-LD or future sitemap dates.
- All ten generators reproduced their output without drift. The new CRE generator runs before search navigation in CI.
- All six new service pages and six expanded asset pages passed 1280, 768, 390 and 320px layout checks. Submit buttons were centered and no document overflow was found.
- The three guides and four builder/case pages passed 1280, 390 and 320px checks. Representative desktop and mobile screenshots were inspected. Wide guide tables retain labeled, keyboard-focusable scroll regions and a mobile swipe hint.
- Browser checks used local pages, with no live test leads. Field Core Web Vitals and actual search outcomes are not measured by these checks.

## Remaining work that needs account data or real evidence

Measure search impressions, index coverage and qualified leads using the correct Search Console, Bing Webmaster Tools, GA4 and CRM accounts. Verify Google generative AI settings/report availability and Bing AI Performance. Establish a repeatable assistant citation sample. This release does not substitute a synthetic bot request or a ChatGPT Ads conversion for evidence of organic AI visibility.

Additional closed-deal stories require actual transaction facts and permission to disclose them. Supporting records are still needed to independently substantiate company volume and the dated capital allocation. External profile verification, relevant earned links, logo-delivery optimization and broader SBA content remain separate audit opportunities. No unverified sameAs links, paid links or fabricated testimonials were added.

Current search guidance emphasizes original useful content, crawlability and accurate identity rather than a special AI schema. [Google AI optimization guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) [OpenAI crawler roles](https://developers.openai.com/api/docs/bots)
