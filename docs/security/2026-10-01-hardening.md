# Security review and hardening, October 1, 2026

Scope: the public static website, browser form code, Netlify capture guard, public JSON lead endpoints, CRM relay, protected HELOC application delivery and deployment output. This is a source and deployment review, not a penetration test or an audit of the CRM, mailbox or account permissions.

## Changes

- Add distributed Netlify edge rate limits: 60 POST requests per minute per IP/domain at the capture guard, and 20 requests per minute per IP/domain at the two public JSON lead endpoints. Existing stricter per-instance limits and the HELOC application's existing platform limit remain in place. The outer limit also covers malformed requests. Shared-IP users share these budgets.
- Require JSON, same-site browser origin and supported content encoding on the public JSON lead endpoints. Bound streamed request bodies to 16 KiB for CAPI and 32 KiB for Family inquiry before invoking the server. Preserve the original request body for valid requests.
- Return no-store, nosniff, no-referrer and restrictive response CSP headers on the lead endpoint responses, including errors. Static `_headers` rules did not supply these on serverless responses.
- Replace indefinite DSCR draft localStorage with sessionStorage, with a 30-minute restore expiry. Clear legacy persistent drafts. Restore only allowlisted property fields, never contact, reserves or credit fields. Browser session restoration behavior can vary; expiry is enforced when a draft is restored.
- Remove the HELOC application email envelope and encrypted attachment from the storage record immediately after the provider accepts delivery and the receipt is saved. Keep opaque deduplication receipts. Failed/uncertain deliveries retain their immutable encrypted envelope for safe retries. Scheduled cleanup also removes attachments from older accepted records, expires pending attachments on its first run after 48 hours and deletes receipts on its first run after 30 days. Provider acceptance is not proof of mailbox delivery. This change does not delete the provider or mailbox copy.

## Verification

- 186 automated tests passed, including streamed size limits, cross-site rejection, preservation of valid bodies, session expiry, field allowlisting, immediate attachment removal, legacy cleanup, concurrent retries and unchanged lead eligibility.
- Four content linters passed. SEO checks passed for 444 HTML pages and 381 sitemap URLs.
- Production dependency audit: zero known vulnerabilities reported at review time.
- Published-output credential-pattern scan: 474 text assets, zero matches for the selected private-key and provider-token patterns. This is not proof that every possible secret format is absent.
- Live read-only checks: HTTPS security headers present on sampled pages; the sensitive application has a hash-restricted script policy and no-store response. Internal `.env`, `.git/config`, package-lock, server source, test source and internal documentation URLs returned 404.
- No real borrower data inspected. No emails, CRM leads or advertising conversion events sent by testing.

## Existing protections retained and limits

Name/email checks and HELOC $50,000/640 minimums remain unchanged. PDF encryption, fixed application recipient, strict schema, bounded bodies, idempotent delivery, native lead capture and CRM forwarding are preserved. Origin checks are browser controls, not authentication of direct clients. Rate limiting mitigates bursts but does not stop a distributed botnet.

The marketing pages still permit inline scripts under their existing resource allowlist. Moving all generated inline scripts to hashed policies or external files is a separate migration requiring analytics and consent testing across the site. The sensitive HELOC application already uses a strict script hash. This review does not claim the website is invulnerable.

References: https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/ and https://docs.netlify.com/build/functions/api/ .
