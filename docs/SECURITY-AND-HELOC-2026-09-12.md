# HELOC intake and website review, September 12, 2026

## Scope and changes

Reviewed the static site, 173 published HTML source pages, shared funnel code, and three Netlify functions. No broken local page or asset links were found in the href scan. This is a focused review, not a penetration test or a review of lender eligibility claims.

Thirty dedicated HELOC pages now require estimated home value, remaining mortgage balance and requested amount. This includes sixteen persona pages, eight ad landing pages, and the main, instant and wizard flows in both languages. Two cash-out comparison pages show and require the same fields when HELOC is selected. The wizard's save-estimate form retains the already entered figures. A zero mortgage balance is accepted; blank, negative, malformed and non-finite amounts are rejected. The wizard collects actual estimates instead of preset amount bands. Calculator demonstration values no longer silently prefill lead forms.

The three figures are placed first in the saved inquiry description, before notes and attribution, so the 2,000-character description limit cannot cut them off. Existing Netlify capture and office email notifications remain the delivery path. Residential and HELOC CRM exclusions remain unchanged.

Long shared reveal sections now become visible when entering the viewport, preventing tall mobile forms from remaining transparent. The callback form and thank-you copy describe the three figures consistently.

## Security changes

- Public CAPI and Family endpoints require exact HTTPS production origins or a deployment URL explicitly configured by Netlify. Missing origins, arbitrary netlify.app sites, foreign ports and production localhost requests are rejected. Local development requires the explicit NETLIFY_DEV switch.
- Rate-limit identity no longer includes user-agent, preventing a caller from resetting its bucket by changing that header. Bounded maps evict one old entry instead of clearing every bucket.
- Request limits count UTF-8 bytes and reject encoded bodies before parsing. The Family endpoint now has a 32 KiB cap; CAPI retains its 16 KiB cap.
- Meta event and Family page allowlists reject inherited object property names. Family's storage fallback no longer derives its destination from the request Host header.
- The optional instant-quote redirect strips query strings and fragments and never appends contact information or financial answers. It requires HTTPS and rejects URL credentials. This optional conversion mode remains inactive.
- CSP disables inline event-handler attributes and base elements. The booking fallback link uses an ordinary listener. Existing vendor integrations remain allowed. CAPI outbound calls have bounded timeouts and refuse redirects.

Origin is a browser boundary, not authentication against a direct client that forges headers. Public CAPI events remain forgeable by a determined direct caller; moving conversion delivery to verified saved-form events is a separate follow-up. In-memory rate limits remain per instance and reset on cold starts. Inline script blocks remain allowed by CSP; removing them requires a broader script migration. No new paid infrastructure was added.

References: [MDN Origin header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Origin), [Netlify deployment environment variables](https://docs.netlify.com/build/configure-builds/environment-variables/).

## Validation

38 automated tests and four content linters passed. Coverage includes all 32 relevant source pages, malformed amounts, zero balance, safe quote URLs, hostile origins, oversized Unicode, prototype property names and user-agent rate-limit bypasses. Generated HELOC pages were rebuilt from source.

Browser checks at desktop and 390-pixel mobile width covered the instant flow, Spanish callback form, persona landing page, Spanish wizard, save-estimate flow, and conditional cash-out fields. Five synthetic submissions went only to a localhost capture server. Every captured record began with all three entered figures, including zero mortgage balances. No new production leads or notification emails were sent for these checks.
