# HELOC client application release verification

The owner authorized completing release checks, merging PRs #42 and #40, and publishing the client application on September 24, 2026. This supersedes the earlier audit's instruction not to merge. The original audit remains a historical preview-only record.

PR #42 was merged into the application branch at `fbdb42a19b3c84fee2486917053e2168462e767b`. Its file tree matches the tested QA commit `44d486e1485f6000be211f4d6470ed0777e8f66f`. The sending domain was checked through the connected email provider: verified, sending enabled, open and click tracking disabled.

Production verification remains pending at this commit. No real borrower data is used for testing. Exactly one synthetic joint application is authorized for production, followed by identical-reference idempotency and changed-details rejection checks. No credential values or PDF password may be read or recorded.

## Production release and delivery

- PR #40 merged at `424e7865f3a4ca3abd613204091eadd517ef5eef` with the QA fixes included.
- Main CI passed: https://github.com/DLECLTHNG/stonehaven-website/actions/runs/36011493718.
- Netlify production deployment `6ab5308bc850fe000835245b` became ready and published at `2026-09-24T14:16:18.235Z` for that exact commit.
- Production `/heloc-application` returned 200 with no-store, noindex/nofollow/noarchive, no-referrer, DENY and the integrity-pinned CSP.
- The final preview loaded the pinned bundle without a Drawer iframe. The production browser request capture showed same-origin application resources and the native date-picker data image, with no third-party application requests.
- Chromium keyboard traversal now verified the name, date subcontrols, SSN and toggle, address fields, income and Review in logical order. Normal back navigation cleared the synthetic name. The browser reported ordinary navigation, so actual bfcache restoration remains unproven.
- Safari loaded the final preview with enabled controls and exposed the joint-applicant and shared-address controls. Exact-width Safari testing remains limited by the available native controls. This is not a claim of a completed full WebKit matrix.
- Production readiness and successful processing functionally verified all four required application configuration names: `HELOC_APPLICATION_RESEND_KEY`, `HELOC_APPLICATION_PDF_PASSWORD`, `HELOC_APPLICATION_HMAC_KEY`, `HELOC_APPLICATION_FROM`. Direct environment-value enumeration was not used.
- Production function metadata shows `heloc-application-cleanup` registered on main with schedule `0 8 * * *`.

Exactly one new synthetic joint application was submitted through the production browser page:

- Reference: `3713f0f7-1b62-435d-8dac-a936652d2e10`.
- received_at: `2026-09-24T14:17:47.891Z`.
- accepted_at: `2026-09-24T14:17:49.198Z`.
- Confirmation appeared and form fields cleared.
- Reposting the exact captured request returned 200 with the original timestamps.
- Reposting that reference with only the first synthetic applicant's name changed returned 409, `request_changed`.
- Resend marked the single outgoing message delivered to the designated mailbox. Its subject contained the reference without a preview label. The previous item in the provider's email list was the earlier September 22 preview test, not another production email.
- The owner confirmed receipt. PDF opening and separate-page inspection remain awaiting owner confirmation.

The owner subsequently asked for the PDF password, narrowly superseding the earlier non-access instruction for that password. A targeted lookup returned only a masked value. No usable password was retrieved, displayed or saved in this report. The private recovery folder remained unopened; other application secrets were not accessed. The owner was directed to the existing recovery material or Netlify's password variable. No password was changed.

## Production public-file sweep

Completed at `2026-09-24T14:24:14.159Z`: all 374 sitemap routes and 493 public resources reached HTTP 200. The 12 internal source/configuration paths from the original audit returned 404; `/downloads/` returned 410; both existing inquiry-function GETs returned 405; all three sampled .html aliases returned the expected 301. All 490 pre-application public files remain represented in the build, with five application assets added.
