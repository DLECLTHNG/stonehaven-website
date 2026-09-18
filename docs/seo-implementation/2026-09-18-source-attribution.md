# Private inquiry source context

Implemented September 18, 2026 in the shared `js/funnel.js` submission flow. This does not establish rankings, citations or qualified lead outcomes.

## What is captured

A bounded `sh_source_context_v1` record in same-origin `sessionStorage` holds the first eligible public landing path, external referring origin, a conservative channel label, and the last visited entry from an explicit CRE article/resource allowlist. It holds one content influence, not a browsing history. The current submission path is attached when the visitor submits.

Channel labels are `organic_search`, `ai_referral`, `paid_campaign`, `referral`, and `direct_or_unknown`. AI classification requires an exact recognized assistant referring host. A `utm_source=chatgpt` label alone and a click ID alone do not prove AI or paid origin. Paid classification requires an explicit recognized paid `utm_medium`. Missing or stripped referrers remain direct/unknown. This is source evidence, not proof of a specific assistant answer or citation.

The existing campaign allowlist and session inheritance remain: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `utm_id`, `gclid`, `fbclid`. Values are bounded to 200 characters and markup/control characters are removed. A newly tagged arrival replaces the latest campaign values; it does not replace the original first-touch channel. Campaign names must not contain borrower information. No arbitrary query string, referrer path, referrer query, fragment, encoded path data, credentials, local network origin or private application path is captured by the new context.

## Privacy boundaries

The new context and campaign persistence are disabled when Global Privacy Control is enabled, on sensitive/Family contexts, confirmation routes and private application paths. Existing stored source/campaign keys are cleared in those contexts. This protection is checked again before submission. Family's separate form endpoint and ad exclusions are unchanged.

Legal policy documents (`/privacy` and `/terms`, including Spanish and HTML variants) neither capture nor attach new source context. Reading a policy does not erase a valid prior CRE landing or campaign record. GPC and sensitive-page exclusions still take precedence and clear those records, including during a legal-policy visit. The financing form `/terms-sheet` is explicitly eligible and is not classified as a legal document.

No cookies, cross-site identifier, third-party attribution service or persistent person ID is added. Storage failure falls back to the current page's in-memory context and never blocks a lead. Session storage can survive a page reload or browser-restored tab, so this is not a fixed-duration retention guarantee. Pages without the shared funnel, unrecognized routes and separate custom form implementations do not receive this new attribution.

A source record can be altered by a browser user, and form delivery does not prove qualification. Keep it as supporting information alongside the optional self-reported discovery source. It is unsuitable as an authentication or billing signal.

## Delivery and identity

- `extra.attribution` carries the structured record into Netlify Forms and the existing `submission-created` CRM relay. Notification/CRM text also receives a concise `[source]` summary.
- Commercial project cost, requested financing, completed value, project type, ownership, target closing and state precede the summary. HELOC's three required figures also retain their priority. Free-text answers follow, so essential fields survive the existing 2,000-character `about` limit. Full structured form values remain in `extra`.
- `extra.submission_id` is an opaque random ID created after basic validation and before sending. The same ID is reused across automatic fallback, a manual retry on the same form instance, and the successful ad conversion event. It is not sent as a GA4 user ID or event parameter.
- Netlify's authoritative `submission_id` is unchanged in the server relay. The browser ID is supplemental and does not deduplicate two separate Netlify records caused by an ambiguous timeout. Retrying after page reload creates a new browser ID. These limitations are explicit to avoid claiming server-side exactly-once delivery.
- The optional legacy CAPI relay receives a copy without the new attribution record or its text summary. Its established server boundary sends event metadata and hashed contact matching to Meta, while financial/context fields go only to its private CRM webhook. The new record, financial figures, discovery answer and borrower text never become GA4, Meta or ChatGPT Ads conversion parameters.
- Arbitrary query strings were removed from the old `[url]` fallback because inbound URLs can contain contact or financial data. Eligible public paths and the campaign allowlist replace that fallback.

Existing analytics/ad integrations were not redesigned as a consent-management system. No new metrics or audience targeting are introduced.

## Validation

`tests/source-attribution.test.mjs` covers cross-page first touch, query/referrer stripping, exact AI/search host matching, paid-campaign precedence, campaign inheritance, Spanish CRE influence, storage failure, GPC including mid-page changes, sensitive/private routes, malformed persisted records, field limits, fallback/manual retry identity, bots, long-note truncation and privacy at the actual CAPI server boundary. The CRM relay test verifies both browser and Netlify identities plus financial/discovery/source context. A route-inventory regression exercises every actual English and Spanish root form both as an initial landing and as a destination after a CRE article. It includes the live `/commercial-loan-calculator`, `/sba-loan-calculator`, `/dscr-analyzer`, `/dscr-review`, `/interest-only-loans`, `/refinance-calculator` and `/terms-sheet` routes, instead of nonexistent aliases. Additional cases verify legal-policy detours, retained GPC/sensitive exclusions and rejection of private, encoded and obsolete alias paths. Existing growth-measurement regression tests continue to pass. Test leads are synthetic and network calls are stubbed; no production inquiry was submitted.
