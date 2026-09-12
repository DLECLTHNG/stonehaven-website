# Website security review, 2026-09-11

Scope: the public marketing site in this repository (stonehavencre.com), its
Netlify configuration, its two serverless functions, and its client-side
JavaScript. The Stonehaven CRM is a separate repository and was only touched
where this site feeds it.

Everything described as fixed below is deployed and verified against
production, not just committed.

---

## What was wrong, and what changed

### 1. No response headers reached the site at all (fixed)

**Severity: high, systemic.**

Headers were declared in `netlify.toml`, but the build command in that same
file runs `rm -rf ... netlify.toml ...`. The file deletes itself during the
build, so no `[[headers]]` block ever reached the deploy. This was not a
theory: production was serving neither the `X-Robots-Tag` nor the
`Cache-Control: no-store` that `/request-received` was supposed to have, while
the page renders a per-visitor reference number.

The site consequently had none of the standard protections. Before the fix,
the only security-relevant header present was the HSTS that Netlify adds on
its own.

Fixed by moving all headers to a `_headers` file, which is read from the
publish directory and survives the build exactly as `_redirects` does.
`netlify.toml` now carries a note explaining why headers must not be added
back there.

Now live on every path:

| Header | Value | What it stops |
|---|---|---|
| `X-Frame-Options` | `DENY` | Clickjacking a lead form |
| `Content-Security-Policy` | `frame-ancestors 'none'` | The same, for modern agents |
| `X-Content-Type-Options` | `nosniff` | A response being re-interpreted as script |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Full URLs, with query strings, leaking to third parties |
| `Permissions-Policy` | camera, mic, geolocation, payment and others disabled | Unused device APIs |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Downgrade attacks, now covering subdomains |

`/request-received` and `/.netlify/functions/*` additionally return
`Cache-Control: no-store` and `X-Robots-Tag: noindex, nofollow`.

### 2. Content Security Policy (added)

There was no CSP. There is now an enforced one with a full resource
allowlist. It was shipped report-only first and checked against production on
the home page, `/book` (which embeds a Google Calendar iframe), `/heloc`,
`/es/heloc` and a Family Opportunity page. Zero resource violations, with the
Meta Pixel, GA4 and Google Fonts all still loading.

`'unsafe-inline'` is unavoidable for scripts here, because the pages carry
inline `<script>` blocks and there is no build step that could add nonces. The
policy is still worth having: it confines both loading and exfiltration to
known origins, so injected markup cannot beacon data out to attacker
infrastructure, and `base-uri`, `object-src`, `form-action` and
`frame-ancestors` are fully effective regardless.

To roll back quickly, rename the key in `_headers` to
`Content-Security-Policy-Report-Only`.

**Allowlisted origins.** Adding a vendor means adding it here.

| Origin | Directive | Purpose |
|---|---|---|
| `connect.facebook.net` | script, connect | Meta Pixel |
| `www.googletagmanager.com` | script, img, connect | GA4 loader |
| `*.google-analytics.com`, `*.analytics.google.com` | img, connect | GA4 collection |
| `www.facebook.com` | img, connect | Pixel beacon and the `<noscript>` fallback |
| `fonts.googleapis.com` | style | Google Fonts CSS |
| `fonts.gstatic.com` | font | Font files |
| `calendar.google.com` | frame | Booking iframe on `/book` |
| `challenges.cloudflare.com` | script, frame | Turnstile, currently inert since the site key is empty |

### 3. The public lead relay was unauthenticated and unvalidated (fixed)

**Severity: high.**

`netlify/functions/lead-capi.js` is called by every form carrying
`data-sh-capi`, which is most lead forms on the site. It had no origin check,
no rate limit, and no input validation, and it spread the caller's `payload`
object directly into the body POSTed to `CRM_WEBHOOK_URL`.

Anyone who read the page source could therefore, from anywhere:

- forge unlimited fake leads into the CRM or whatever `CRM_WEBHOOK_URL`
  points at, which for a speed-to-lead Zapier or SMS hook means real cost and
  a polluted pipeline
- write arbitrary JSON keys into that downstream system
- send arbitrary event names and fake `Lead` conversions to the Meta pixel,
  corrupting conversion data and therefore ad optimisation
- attribute those events to any URL they liked via `source_url`

Fixed. The endpoint now requires a same-site `Origin`, rate limits to eight
requests per IP per ten minutes, accepts only the three known event names,
bounds the body to 16 KB, and sanitises the payload against an allowlist. Real
lead data including the wizard answers and UTM attribution in `extra` is
preserved; unknown keys and over-deep nesting are dropped. A forged
`source_url` is replaced with this site's own origin.

The Meta access token also moved out of the query string into the request
body, since query strings turn up in platform and proxy logs and that token is
a live credential.

### 4. Query string stored in the CRM (hardened)

`js/funnel.js` appended the raw `location.search` into the `about` field sent
to the CRM, so a crafted inbound link produced attacker-controlled text in a
stored lead record. The CRM escapes on output today, so this was not
exploitable. It is now bounded to 200 characters with markup characters
stripped, as defence in depth. The real control remains output encoding in the
CRM.

---

## What was checked and found clean

These were audited and are genuinely fine. Recording them so the next review
does not repeat the work.

- **No secrets in the repository.** No API keys, tokens or credentials are
  committed. Every identifier in `js/site-config.js` is a public one.
- **No client-side XSS.** Every `innerHTML` use across 160 HTML files and 13
  JS files is fed by hardcoded strings, computed numbers, or a build-generated
  table, and user data goes to `textContent`. There is no `eval`, no
  `new Function`, no `document.write`, no `insertAdjacentHTML`, and no
  string-argument `setTimeout`.
- **No open redirects.** All four URL-parameter reads are membership-tested
  against fixed allowlists before use. No navigation target comes from a
  parameter.
- **No `postMessage` listeners at all**, so there is nothing to bypass.
- **`_redirects` is clean.** 155 rules, every destination root-relative, no
  proxy rules, no splat interpolation, no catch-all, no shadowed rules.
  `/netlify/*` correctly returns 404 so function source is not served.
- **No tabnabbing.** Every `target="_blank"` carries `rel="noopener"`.
- **No plain-HTTP resource loads.**
- **Forms carry a honeypot** (`company_website`) wired to Netlify's
  `netlify-honeypot`.
- **Internal paths are not served.** `docs`, `tests`, `scripts`, `downloads`
  and `netlify.toml` all return 404 or 410 in production, confirming the build
  strip works.

### On Subresource Integrity

SRI is the usual recommendation for third-party scripts and is deliberately
**not** applied here. The Meta Pixel, the GA4 loader and Turnstile are mutable,
unversioned vendor endpoints: pinning a hash would break the site on the
vendor's next push. The correct control for this risk is the `script-src`
allowlist above, which is now in place.

---

## Open items

1. **`'unsafe-inline'` in `script-src`.** Removing it needs nonces or hashes on
   every inline block, which needs a build step the site does not have. Worth
   doing only if the site gains one.
2. **Rate limiting is per function instance and in memory.** It resets on cold
   start and is not shared across concurrent instances, so it slows abuse
   rather than stopping it. Netlify's own rate limiting or a shared store would
   be needed for a hard guarantee. Adequate for current volume.
3. **Stray macOS duplicate files** sit untracked at the repository root
   (`buy-a-home-for-parents 2.html` and similar). Git-based deploys exclude
   them, so they are currently inert. They would ship as live duplicate pages
   under a manual drag-and-drop deploy. Recommend deleting them.
4. **`CRM_WEBHOOK_URL` has no authentication of its own.** The relay now
   restricts who can reach it, but whatever receives that webhook should verify
   a shared secret rather than trusting any POST.
