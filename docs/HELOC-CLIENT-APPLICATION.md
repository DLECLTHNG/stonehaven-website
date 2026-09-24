# HELOC client application

Route: `/heloc-application`. Owner-requested direct client page, not a traffic landing page. It is excluded from navigation, sitemap and AI discovery exports and carries noindex/nofollow. This is an unlisted form, not an authenticated borrower portal.

## Requested fields and behavior

- Individual application or joint application with two complete applicant sections.
- Each applicant: full legal name, DOB, SSN, current home address and annual W-2 income before taxes.
- Joint applications can reuse applicant 1's current address. Switching back to individual clears and disables applicant 2's fields.
- SSNs are hidden by default; review displays only the final four digits. Zero W-2 income is allowed and is not an eligibility decision.
- Fields remain disabled until the dedicated delivery endpoint is configured and its retry store is reachable.
- Browser state is cleared after confirmed acceptance and when leaving the page. No browser storage, URL serialization, advertising pixels, conversion events or generic lead scripts.
- This form does not authorize a credit pull and does not represent approval or a complete lender application.

## Protected delivery

User selected `chris@stonehavencre.com` as the sole delivery recipient. The dedicated serverless function receives JSON over HTTPS, validates both applicants, generates an AES-256 password-encrypted PDF, and sends that attachment through Resend using a domain-scoped sending-only credential. The PDF opening password is provisioned separately and is never included in the email, public HTML, browser script, repository or logs. Owner recovery material is outside this repository with owner-only filesystem permissions.

Applicant values are not inserted into the email subject or body, ordinary Netlify Forms, CRM records, analytics, error messages or logs. The processor handles plaintext in memory long enough to validate and encrypt it. This is not a claim of end-to-end browser encryption or legal certification.

The PDF uses the licensed Noto Sans font bundled only with server functions. Unsupported glyphs are rejected explicitly rather than silently changing a name or address. Each applicant occupies one page.

## Retries and retention

Private Netlify Blobs keeps the exact encrypted attachment and immutable generic email envelope, plus a keyed HMAC fingerprint and opaque receipt. Conditional writes make concurrent attempts reuse the same ciphertext. Resend gets a stable idempotency key. A request with changed details cannot reuse an existing reference. Uncertain attempts stop retrying after 23 hours, inside Resend's 24-hour idempotency window, and require reconciliation.

The daily `heloc-application-cleanup` function removes the encrypted envelope on the first cleanup after 48 hours and removes the opaque receipt on the first cleanup after 30 days. Email/provider copies remain subject to mailbox/provider retention. A successful response means the email provider accepted delivery, not that the recipient has opened it.

## Operations

Function-only settings: `HELOC_APPLICATION_RESEND_KEY`, `HELOC_APPLICATION_PDF_PASSWORD`, `HELOC_APPLICATION_HMAC_KEY`, `HELOC_APPLICATION_FROM`. Production and deploy-preview are configured. Netlify exposes only `URL`, `SITE_NAME` and `SITE_ID` to functions at runtime; `CONTEXT` and `DEPLOY_PRIME_URL` are build-time only. The deploy context and site name therefore come from the function context. A deploy preview accepts only its own page origin on this site's Netlify subdomain, and only preview submissions carry the `[Preview test]` subject label. Do not rotate the PDF password without retaining access to older attachments. Do not send the password with an application email. A deployment-preview email is labeled `[Preview test]`.

Netlify endpoint paths: `/api/heloc-application` and `/.netlify/functions/heloc-application`. Requests require the exact site origin, valid JSON and no more than 16 KB. A per-IP/domain rate rule limits requests. Failures return generic, non-cacheable errors. There is no public application download or retrieval endpoint.

Static deploys now use the `.site` allowlist built by `scripts/build-public.mjs`. Internal documents, dependencies, server code, font source and package manifests are excluded. Source remains intact for function bundling. All existing static routes are preserved.

## Verification

- Shared client/server validation, single/joint structure, real calendar dates, missing fields, malformed SSNs and income.
- Endpoint origin/body/config/error protections, retry identity, concurrency, retention and no plaintext in stored/email records.
- Independent PDF password authentication and content decryption, incorrect-password rejection, all-field round-trip and one page per applicant.
- PDF pages visually checked with normal and maximum-length synthetic values.
- Browser checks at 320, 390, 768 and 1440 pixels, centered actions, joint-to-single clearing, shared address, masked review and mocked success with clearing.
- Deployment verification, completed on the deploy preview on 2026-09-22:
  - The first live preview submission returned 403 because the origin check read `CONTEXT` and `DEPLOY_PRIME_URL`, which do not exist at function runtime. Fixed as described under Operations, with a regression test that fails on the previous code.
  - Readiness returned `{"ready":true}` and the form enabled at 375 and 1440 pixels with no overflow, no browser storage and only first-party scripts.
  - One synthetic application (Codex's own "Synthetic Intake Test" fixture) was accepted end to end: reference `e3a6959a-fb7e-4be5-b6ef-5e36b71e8367`, provider acceptance at 17:53:09 UTC, subject labeled `[Preview test]`.
  - An identical resubmission returned the original acceptance without resending; changed details under the same reference returned 409; a foreign origin returned 403; the platform rate rule returned 429 after five requests.
  - Response headers carried `noindex`, `no-store`, `no-referrer` and the page's strict Content-Security-Policy. Internal sources, dependencies, server code and the font file all returned 404, and every one of the 488 public files production served before this change returned 200 from the new `.site` build.

Sources: [PDFKit encryption](https://pdfkit.org/docs/getting_started.html), [Netlify rate limiting](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/), [Netlify Blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/), [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [FTC safeguards](https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know).
