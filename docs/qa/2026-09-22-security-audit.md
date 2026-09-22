# Website security audit, September 22, 2026

Scope: public website form capture, Family endpoint, saved-submission CRM relay, optional conversion/webhook relay, browser form validation, public response headers and source exposure. No production lead was created and no borrower message was sent. The user clarified that the earlier recurrence report belonged to another chat; this audit does not claim an active missing-contact incident.

## Verified existing controls

- Production `/contact` rejects an empty name/email URL-encoded lead with HTTP 422 before Netlify capture. Its error response is `no-store`.
- Production `/contact` serves enforced CSP, `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, HSTS, a restrictive permissions policy and the configured referrer policy.
- Public artifact checks returned 404 for sampled docs, tests, scripts, function/shared source, Git config, `.env`, local Netlify state, GitHub workflow, README and deployment/header/redirect configuration paths. The withdrawn downloads path returns 410. No source or configuration leak was confirmed. Only HTTP status codes were retained for the expanded check.
- The form guard checks both URL-encoded and multipart submissions, bounds request bytes, rejects duplicate fields and preserves accepted request bodies. Static inquiry forms collect required name and email.
- The shared HELOC rule still requires home value, mortgage balance and requested amount, with a minimum request of $30,000 and zero allowed for a paid-off mortgage.
- The reserved `submission-created` event function uses the Netlify event boundary, a server credential and stable submission IDs for CRM delivery. Invalid contacts do not reach that relay. Existing retry, duplicate and field-retention tests pass.

## Issues fixed

1. **Visually empty and malformed contact values:** zero-width-only or punctuation-only names, control characters, malformed mailboxes, consecutive email dots and malformed domain labels could pass the simple checks. Browser validation and shared server checks now reject those values. International names, mononyms, ordinary plus-addresses and punycode domains remain accepted. The Family backend uses the same contact rules.
2. **Cross-site browser form injection:** the capture guard now rejects a foreign or opaque browser Origin and originless requests that explicitly identify as cross-site. Same-site, the two canonical domains, the current deploy origin and originless server delivery remain supported. This is a browser protection, not authentication against a direct client.
3. **Family contact-data redirects:** Family Forms/CRM delivery previously followed HTTP redirects. Those requests now require HTTPS, reject credentials in the destination URL, block redirects and use bounded timeouts. Failures preserve the existing error state instead of reporting stored success.
4. **Family Meta credential in request URL:** the optional parents-only CAPI token moved from the query string to the JSON body. That request also blocks redirects and has a timeout. Adult-child Family inquiries remain excluded.
5. **Production dry-run false success:** `FAMILY_DRY_RUN=1` now works only with `NETLIFY_DEV=true`. A deployed misconfiguration fails closed instead of returning an accepted inquiry that was never stored.
6. **Generic advertising relay privacy:** the generic CAPI endpoint refuses Family, parent-housing, adult-child/disability and receipt context, which must use the dedicated privacy-controlled intake. Configured webhook destinations require HTTPS. Untrusted nested prototype keys are omitted, and source URLs with credentials or nonstandard ports fall back to the public site root.
7. **Multifamily attribution false exclusion:** the existing privacy substring test classified `multifamily` as Family housing. It now matches actual Family/parents/disability route tokens. Commercial multifamily and single-family property routes retain source context, while existing Family route exclusions remain intact.
8. **Edge rejection headers:** validation errors explicitly include `nosniff`, `noindex, nofollow` and `no-store` because platform-wide static headers do not automatically cover every dynamic response.

The successful delivery path still uses the existing Netlify Forms capture, email notifications and saved-submission CRM forwarding. No inbox, notification recipient, secret or external permission was changed.

## Validation

Focused run: `node --test tests/lead-validation.test.mjs tests/public-function-security.test.mjs tests/family-inquiry.test.mjs tests/website-relay.test.mjs tests/source-attribution.test.mjs`.

64 tests passed. Regressions cover browser and server invalid contacts without network/conversion events, exact HELOC boundaries, body preservation, cross-site rejection, multipart and duplicate fields, Family privacy boundaries, secure delivery, token placement, production dry-run rejection and intact CRM classification/source context, including Commercial multifamily attribution. External delivery is mocked in tests.

Release integration must bump `js/funnel.js` from v14 to v15 and `js/family-lp.js` from v4 to v5 in all generator and rendered references, run the full site gate, and confirm deployed rejection-only checks. No valid live test submission is necessary.

## Limits

- These syntax checks cannot prove that a visitor owns an email address or entered a truthful name. Public inquiry endpoints can receive invented but syntactically valid contacts.
- Existing function rate limits are per-instance memory controls. They are not distributed rate limiting; Netlify Forms spam filtering remains part of the defense. Browser Origin checks are not an authentication mechanism for non-browser clients.
- The optional generic CAPI/webhook endpoint is still a public integration. Its presence does not prove that either optional environment variable is enabled in production. This audit did not inspect secrets or change external CRM configuration.
- CSP still permits inline script elements and inline styles required by the current static-site implementation. It blocks inline event-handler attributes and confines resources to the existing allowlist. Removing all inline script permission would require a coordinated nonce/hash migration with a separate regression pass.
- This is an application-level review and targeted regression suite, not a penetration test or a guarantee that no vulnerability exists.

## Platform references

- [Netlify Forms setup](https://docs.netlify.com/manage/forms/setup/): encoded form submission and static form registration.
- [Netlify form submissions](https://docs.netlify.com/manage/forms/submissions/): saved submission handling and sanitization.
- [Netlify event function signatures](https://docs.netlify.com/build/functions/trigger-on-events/): platform signature verification for reserved event functions.
- [Netlify Edge Functions API](https://docs.netlify.com/build/edge-functions/api/): returning a response terminates the request chain before redirects.
