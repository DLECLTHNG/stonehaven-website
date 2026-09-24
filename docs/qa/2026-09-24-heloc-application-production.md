# HELOC application QA, September 24, 2026

## Release gate and scope

**Preview-only audit. This is not production certification.** PR #40 remained OPEN at the start of this audit and `https://stonehavencre.com/heloc-application` returned 404. Following the owner's explicit fallback, sections 1 through 4 were run on [preview #40](https://deploy-preview-40--splendid-tulumba-0cbb01.netlify.app/heloc-application). Section 5 was skipped, and section 6 was deferred. No successful application POST, application email, or production submission was made in this audit. There is no production reference to report.

- Main after fetch and fast-forward: `b0e92952399fa038fb65244f2d7cfed8397f14c0`.
- PR #40 baseline: `58509ecd16bc1a68b8e0758c6adfe9a592150b25`.
- Fix branch: `codex/heloc-application-qa-sep24`, stacked onto `codex/heloc-client-application`.
- Work used an isolated checkout. Existing untracked duplicate files in the primary checkout were left untouched.
- Only synthetic applicant fixtures were used. The private intake folder and deployed application credential values were not accessed.
- PASS means directly observed, unless marked source/unit evidence. PARTIAL and BLOCKED are not passes.

## 1. Whole-site regression

| Check | Result | Evidence |
| --- | --- | --- |
| Every live sitemap URL | PASS on preview | All 374 paths from the live production sitemap resolved to 200 on preview. |
| Public build files | PASS on preview | Baseline build produced 494 files: 492 HTTP resources plus `_headers` and `_redirects`, which are platform configuration, not public endpoints. All 492 resources reached 200, following canonical redirects for HTML. |
| Compare with main | PASS for public asset coverage | Compared tracked main tree with the public directory/extension policy: 490 previous files preserved, zero missing; four application files added. This does not assert that internal source files previously exposed by root publication should remain public. |
| Internal paths | PASS | All 12 paths listed below returned 404. |
| Withdrawn downloads | PASS | `/downloads/` returned 410. |
| HTML canonical redirects | PASS | `/heloc-application.html`, `/privacy.html`, `/blog/dscr-loans-explained.html` returned 301 to their clean paths. |
| Homepage protections | PASS | Sitewide CSP, DENY, nosniff, HSTS, permissions policy and referrer policy remain present on `/`. Preview adds noindex. |
| IndexNow | PASS | The existing key text resource was in the fetched public-file inventory and returned 200. |
| Existing inquiry functions | PASS | GET `/.netlify/functions/lead-capi` and `/.netlify/functions/family-inquiry` both returned 405. No inquiry was submitted. |
| Site monitor | PASS, existing production run | [Run 35994883370](https://github.com/DLECLTHNG/stonehaven-website/actions/runs/35994883370), September 24 at 11:45:27 UTC, main `b0e9295`, conclusion success. No extra monitor workflow or canary was triggered. |

The first sweep used eight concurrent readers and received 153 transient 403 responses after 713 successful resource checks. After stopping that sweep, each affected path was retried sequentially with a 350 ms pause; all reached the expected status. The successful sweep covers 866 distinct clean/resource paths. This transient edge behavior was not treated as missing content or bypassed by changing protection settings.

Internal paths checked individually:

- `/package.json`
- `/package-lock.json`
- `/node_modules/pdfkit/package.json`
- `/netlify/functions/heloc-application.mjs`
- `/netlify/functions/lib/heloc-application-delivery.mjs`
- `/netlify/functions/lib/fonts/NotoSans.ttf`
- `/docs/HELOC-CLIENT-APPLICATION.md`
- `/scripts/build-public.mjs`
- `/tests/heloc-application-security.test.mjs`
- `/netlify.toml`
- `/README.md`
- `/.github/workflows/site-checks.yml`

## 2. Privacy and discoverability

| Check | Result | Evidence |
| --- | --- | --- |
| Cache-Control | PASS | `no-store,max-age=0`. |
| X-Robots-Tag | PASS | Includes `noindex, nofollow, noarchive`; preview also supplies noindex. |
| Referrer-Policy | PASS | `no-referrer`. |
| Strict CSP | PASS at baseline; strengthened in this PR | Default deny, same-origin connections/styles/images, no forms, no objects, no base URL and no framing. This PR narrows scripts from all same-origin scripts to one integrity-pinned bundle. |
| X-Frame-Options | PASS | `DENY`. |
| Meta robots | PASS | `noindex,nofollow,noarchive`. |
| Search/LLM discovery | PASS | Deployed sitemap, llms.txt and llms-full.txt omit the application route. Tracked HTML has no inbound page link; the only matching href is the application's own canonical. |
| Meta/GA4/ChatGPT pixels | PASS for application source | None of their scripts or transports are included. |
| Third-party requests / console | FAIL at baseline, mitigated | Netlify injects its same-origin feedback script and tries to create an app.netlify.com frame. CSP blocks the frame, leaving a broken drawer and security-policy violation. No successful third-party application delivery was observed. See defect A. |
| Browser cookies | PASS for inspected preview origin | Chromium `Network.getCookies` returned an empty array. |
| localStorage/sessionStorage | PARTIAL | Application source contains no persistence APIs. The injected Netlify script contains sessionStorage access, so the baseline cannot be certified storage-free. Direct DOMStorage inspection is unsupported by the available browser connection; absence of actual writes was not proven. |
| Applicant values in URLs | PASS for exercised flow | Typing, validation, review and Edit leave the application URL unchanged; values are not placed in query strings or fragments. Summary-link handlers focus fields without changing the URL. |
| English and Spanish privacy | PASS on preview | Both `/privacy` and `/es/privacy` returned 200 with the encrypted-PDF application paragraphs. Production wording was not certified under this gate. |

## 3. Browser behavior without delivery

Primary browser testing used Chromium through the supported browser controls. Safari/WebKit received native smoke testing. A localhost harness was used for the fixes, returning only synthetic readiness and rejecting every POST with 405; it never connected to delivery, storage or email.

| Check | Chromium | Safari/WebKit |
| --- | --- | --- |
| Readiness enables fields and hides notice | PASS on preview; PASS on fixed local page | PASS on preview and fixed local page |
| 320, 390, 768, 1440 px | PASS, measured viewport and document widths match; no clipped inputs; review inspected | BLOCKED for exact-width matrix: available Safari native control does not expose viewport sizing, Develop/Responsive Design Mode was not available; the shortcut reloaded rather than entering that mode |
| Empty review summary and invalid fields | PASS, eight required-field errors | PASS, eight errors surfaced |
| Every summary link focuses corresponding field | PASS, eight links, every target had aria-invalid=true | Not fully exercised |
| SSN 000 / 666 / 9xx / group 00 / serial 0000 | PASS, each marked invalid | Not fully exercised |
| Future DOB | PASS, 2999-01-01 rejected | Not fully exercised |
| Impossible DOB | PASS, native Chromium date field refused 1987-02-29; shared validator rejects it in unit tests | Not fully exercised |
| Malformed ZIP | PASS | Not fully exercised |
| Negative/malformed W-2 income | PASS for -1 and 1,23 | Not fully exercised |
| Zero-width-only name | PASS | Not fully exercised |
| Zero W-2 income | PASS, review displayed $0.00 | Not fully exercised |
| Masked SSN / Show / Hide labels and pressed state | PASS | PASS, secure field and toggle labels/states observed |
| Remask on backgrounding | Source handler verified; full Chromium visibility transition not certified | PASS, opened a new tab, returned to application, observed secure SSN field and Show toggle off |
| Joint applicant visible | PASS | Remaining joint workflow interrupted by user interaction with Safari, not certified |
| Shared address clears, disables and hides five fields | PASS | Not fully exercised |
| Switching to single clears and disables joint details | PASS | Not fully exercised |
| Review uses only last four SSN digits | PASS, single and joint | Not fully exercised |
| Edit preserves values | PASS, reviewed again without refilling, including masked SSN and formatted income | Not fully exercised |
| Keyboard and screen-reader labels | PARTIAL: required-field links and input labels checked; keyboard income to Review, Enter, Edit to Submit verified with visible outline. Full keyboard-only flow through native date subcontrols not certified | Labels exposed in AX tree; full keyboard-only flow not certified |
| Mobile keyboard/visual action order | FAIL at baseline, FIXED and rechecked at 390 px | Source fix shared, responsive verification outstanding |
| Leave and return clears data | PASS in Chromium normal back navigation; reset hides review and clears fields | Not fully exercised |
| Specifically force back-forward-cache restoration | Source pageshow persisted reset present; actual bfcache restoration not independently established | Not certified |

No Submit application button was activated. Full WebKit and bfcache certification remains a release checklist item. Browser limitations are not recorded as passing tests.

## 4. Endpoint refusal tests

All requests below targeted preview #40 `/api/heloc-application`. Ordinary checks were spaced 16 seconds apart. Each invalid POST was deliberately constructed to stop before PDF creation, storage writes or email. A new instrumented unit test independently verifies **zero PDF calls, zero storage writes and zero sends** for every refusal class. Remote status codes alone cannot prove internal side effects.

| Request | Expected | Observed | Error code |
| --- | --- | --- | --- |
| Foreign Origin | 403 | 403 | origin_not_allowed |
| Sec-Fetch-Site cross-site | 403 | 403 | origin_not_allowed |
| Wrong Content-Type | 415 | 415 | unsupported_media_type |
| Content-Encoding identity | 415 | 415 | unsupported_content_encoding |
| Malformed JSON | 400 | 400 | invalid_request |
| 16,385-byte body | 400 | 400 | invalid_request |
| Invalid SSN | 422 | 422 | invalid_application |
| Extra key | 422 | 422 | invalid_application |
| Missing request_id | 422 | 422 | invalid_application |
| Joint with one applicant | 422 | 422 | invalid_application |
| Bad UUID | 422 | 422 | invalid_application |
| PUT | 405 | 405 | method_not_allowed |
| Readiness GET | 200 | 200 | ready=true, no configuration exposed |

Rate limiting: PASS with the documented enforcement delay, FAIL for an instantaneous hard ceiling. The final seven-GET check returned 200 six times at 12:55:20-21 UTC, then 429 at 12:55:33 UTC after a 12-second wait following the sixth request. Earlier immediate bursts all returned 200. This is not a strict synchronous five-request cap. Immediate seven-GET bursts returned seven 200 responses, so they do not satisfy the brief's immediate-429 expectation. Netlify documents that blocking can begin up to 10 seconds after crossing the threshold. The configured rule remains unchanged at five requests per 60 seconds per IP/domain. See [Netlify enforcement timing](https://docs.netlify.com/manage/security/secure-access-to-sites/rate-limiting/#enforcement-timing).

## 5 and 6. Production-only checks

**SKIPPED under the owner's release gate.** No production application, confirmation reference, production retry or changed-body retry. No request to the owner to confirm an email that was never sent. No production cleanup registration, deployed environment names or sender-domain verification was claimed. These are due after the owner decides to merge PR #40 and production serves the application.

## Defects and fixes

### A. Medium: preview feedback script executes on a sensitive intake page

Reproduce on original preview #40: open `/heloc-application`, inspect scripts and frames. Netlify adds `/.netlify/scripts/cdp`; existing script-src self allows it to run. It tries to load app.netlify.com, blocked by default-src none. Chromium showed a broken frame and Safari showed a Netlify Drawer frame. Downloaded drawer source includes sessionStorage access.

Fix in this PR: the page loads one generated module with SHA-384 Subresource Integrity; both clean-route and .html-route CSPs allow only its hash. The bundle includes validation, avoiding runtime imports and browser differences in module trust propagation. A deliberately injected same-origin script was blocked in the Chromium local harness while the application initialized and validated normally. Safari initialized the same fixed page. Regression tests require synchronized sources/bundle/hash, matching policies on both routes, no broad script host permission and no runtime imports. CI regenerates the bundle to detect drift.

Maintenance: after modifying either application source module, run `node scripts/build-heloc-application.mjs`; commit the resulting bundle, HTML and headers together.

Residual: Netlify may still insert the now-blocked script markup, producing an expected CSP warning on alias preview URLs. Achieving a warning-free preview requires disabling Netlify Drawer in the site's collaboration settings or using a deploy permalink, where Netlify says the Drawer is unsupported. No site setting was changed in this code-only fix. [Netlify Drawer documentation](https://docs.netlify.com/deploy/review-deploys/netlify-drawer-for-feedback/overview/).

### B. Low: mobile review buttons reverse keyboard order

Reproduce: at 390 px, fill a valid synthetic application and select Review. The baseline CSS uses column-reverse, putting Submit visually above Edit while keyboard focus reaches Edit first. This makes keyboard focus travel opposite the visual sequence.

Fix: use normal column layout at mobile widths. Edit now appears above Submit, matching DOM and keyboard order. Verified at 390 px with visible focus on Submit, and protected by a regression test.

## Validation and remaining release work

Local suite: 180 tests, all four linters and SEO checks passed (437 HTML pages, 374 sitemap URLs). The sensitive application and public-build subset also passed. Generated-bundle synchronization is part of CI. The fixed public build contains 495 files, adding only the pinned client bundle to the baseline public inventory.

Remaining owner/reviewer decisions: merge neither PR automatically; decide when PR #40 and this follow-up should be merged, complete the outstanding WebKit/keyboard/bfcache cases, and then perform the single authorized production joint submission and operations verification. Preview drawer configuration remains an explicit residual finding. Do not send real borrower details through any preview.
