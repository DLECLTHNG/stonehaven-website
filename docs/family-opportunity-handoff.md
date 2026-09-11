# Family Opportunity Mortgage: engineering handoff

Prepared 2026-09-11 for a new agent or engineer picking this up cold.
Scope: the Family Opportunity landing pages, their inquiry endpoint, and the
CRM/measurement integrations around them. It does not cover the rest of the
Stonehaven website (HELOC, DSCR, commercial), which is unrelated and untouched.

This file lives in `docs/`, which the Netlify build command deletes before
publish, so it never reaches the public site.

---

## 1. Status right now

Four pages are live in production on stonehavencre.com:

| Path | Page id | Sensitive | Ad tags | Indexed |
|---|---|---|---|---|
| `/family-home-financing` | `family-overview` | no | Meta Pixel on | no (`noindex,nofollow`) |
| `/buy-a-home-for-parents` | `family-parents` | no | Meta Pixel on | no (`noindex,nofollow`) |
| `/family-housing-options` | `family-adult-child` | yes | none, blocked in code | no (`noindex,nofollow`) |
| `/request-received` | n/a | n/a | none, blocked in code | no, permanently |

Working and verified in the browser against production:

- All three landing pages render on desktop and mobile, forms validate inline,
  submissions post to the serverless endpoint and redirect to the confirmation
  page with a reference id.
- Meta Pixel loads on the bridge and parents pages only. Verified absent on the
  adult-child page and the confirmation page.
- Error recovery preserves entered values and offers a phone fallback.
- Sticky mobile call-to-action shows mid-page and hides at the footer.

Not yet working:

- Inquiries do **not** reach the CRM. They land in Netlify Forms under the
  shared `lead` form. See section 7, which explains why wiring the CRM is not a
  one-line change.
- Meta Conversions API is built but off.
- Pages are `noindex`, so no organic search traffic.

---

## 2. Repositories and deploy

| | Website | CRM |
|---|---|---|
| Remote | `github.com/DLECLTHNG/stonehaven-website` | `github.com/DLECLTHNG/stonehaven-crm` |
| Local path | `.../stonehaven-master/05-go-live/stonehaven-website` | `~/Desktop/STONEHAVEN CRM` |
| Branch | `main`, all Family work merged and pushed | `feat/residential-product-website-intake` |
| Deploy | Netlify, push to `main` publishes | not deployed from this work |

Netlify site id `d9ec18aa-630d-47f6-93cc-7514615ae9b8`, serving stonehavencre.com.

**The CRM change is on a feature branch, not `main`**: commit `d8d73b9c0` adds
`family-parents` and `family-adult-child` to the page allowlist, and `140ea37da`
adds `family-overview`. Without it the
CRM rejects these inquiries as an unknown page. It is pushed to
`feat/residential-product-website-intake`, which also carries unrelated in-flight
work, so merge or cherry-pick it into `main` before connecting the CRM.

Relevant website commits, both on `main` and deployed:

- `8d25347` the pages, endpoint, generator, linter, tests
- `57e7dbd` Meta Pixel enabled on the parents page
- `8665382` the neutral bridge page at `/family-home-financing`

---

## 3. How the pages are built

Everything is generated. Do not hand-edit the HTML, it will be overwritten.

```
scripts/family_lp_config.py      <- the only file you edit for copy or settings
        |
        v
scripts/build-family-lps.py      <- run this
        |
        +--> family-home-financing.html
        +--> buy-a-home-for-parents.html
        +--> family-housing-options.html
        +--> request-received.html
        +--> js/family-config.js              (runtime settings for the browser)
        +--> netlify/functions/family-shared.json   (server-side allowlists)
```

Commands, all run from the website repo root:

```bash
python3 scripts/build-family-lps.py    # regenerate
node scripts/lint-family-lps.mjs       # copy and compliance rules
node --test tests/family-inquiry.test.mjs   # 10 endpoint tests
```

Local preview with a working endpoint, on port 8902, dry run by default:

```bash
node scripts/family-dev-server.mjs 8902
```

The linter enforces house rules the owner cares about: no em or en dashes, no
rate or percentage or dollar figures, no credit score numbers, no "guaranteed"
or "loophole" language, no trailing periods on headings, and that every page
carries its consent notice, privacy link, phone links, and footer disclosures.
The generator raises on em dashes too, so a bad string fails the build rather
than shipping.

---

## 4. The privacy architecture, and why it is unusual

**These pages deliberately do not load `funnel.js` or `site-config.js`,** which
every other page on the site uses. Those files unconditionally initialise the
Meta Pixel. Loading them here would put the Pixel on the disability page, so the
Family pages run on a separate, smaller runtime instead: `js/family-lp.js` plus
generated `js/family-config.js`.

The rule lives in `js/family-lp.js` near the top:

```js
var AD_TAGS_ALLOWED  = KIND === "lp" && !SENSITIVE;
var ANALYTICS_ALLOWED = KIND === "lp" && (!SENSITIVE || T.ga4OnSensitivePage === true);
```

`KIND` and `SENSITIVE` come from `data-fo-kind` and `data-fo-sensitive` on
`<body>`, which the generator stamps from the `sensitive` flag in the config. So
the Pixel cannot load on `/family-housing-options` or `/request-received` no
matter what is set in config. The server side carries the same rule
independently: `netlify/functions/family-inquiry.js` refuses to relay anything to
Meta unless `rec.page === "family-parents"`. A test covers it, named "adult-child
page never relays to Meta even when enabled".

Other properties worth preserving:

- `fbq("set", "autoConfig", false, pixel)` disables Meta's automatic button and
  form scraping, so page text and field contents are never collected.
- The `Lead` event fires only inside the confirmed-success branch after the
  server accepts the record, never on click, and is suppressed in dry run. It
  carries an `eventID` so a future Conversions API relay deduplicates.
- No personally identifying data goes into URLs, the console, or analytics.
- Attribution is limited to an allowlist of six UTM keys, held in
  `sessionStorage`.

### Qualifying questions and what the sensitive page may ask

Every inquiry form asks purchase price and the borrower's own credit score
range, both optional. The parents page additionally asks whether the parents
could qualify on their own income, which is the actual Fannie criterion for that
product.

The adult-child page has no equivalent question and must not gain one. The same
question there would be asking a parent to disclose a disabled person's capacity
to work, and the page's own copy promises the opposite: the hero says no medical
information is needed, and an FAQ tells visitors not to send diagnoses or
benefits documents. Three things enforce this:

- The question is defined per page in `family_lp_config.py` as `extra_select`,
  and only the parents page defines one.
- `netlify/functions/family-inquiry.js` keys the answer to the page that asks
  it, so a crafted request offering `occupant_income` for the adult-child page
  has the value dropped rather than stored. A test covers it.
- The linter fails the build if the sensitive page's form mentions income,
  benefits, capacity to work, disability or medical wording.

Keep all of these optional. The consent notice states that this is an inquiry
and not a mortgage application, which stops being true if answers become gates.

### Open decision: Pixel on the disability page

The owner has asked for the Meta Pixel to be added to
`/family-housing-options`. **This session did not implement it**, and the reasons
should sit with whoever picks the decision up:

- Meta's Business Tools Terms prohibit sending data that reveals health
  conditions or disability. Every Pixel fire on that page carries that
  inference by virtue of the page's subject.
- Disability is a protected class under the Fair Housing Act, and this is a
  mortgage brokerage. Audience building keyed to it is the pattern behind the
  2019 HUD charge and 2022 DOJ settlement against Meta over housing ads.
- The FTC has brought Section 5 actions over exactly this shape of sensitive
  category pixel leakage, including GoodRx and BetterHelp in 2023.
- The visitors carrying the exposure are third parties, and the page's own
  consent notice does not currently disclose ad tracking.

This is a decision for the owner with legal input, not an engineering
preference. If it is made deliberately and documented, implementing it means
changing `AD_TAGS_ALLOWED` in `js/family-lp.js`, the page gate in
`netlify/functions/family-inquiry.js`, the test that asserts the block, and the
consent notice wording plus `CONSENT_NOTICE_VERSION`. Section 8 describes the
alternative that was built instead and is now live.

---

## 5. Credentials and access needed

No secret values appear in this repository or in this document. Everything below
has to be supplied by the owner.

### Accounts a new engineer needs

| Service | Needed for | Notes |
|---|---|---|
| GitHub, `DLECLTHNG` org | push to both repos | website and crm |
| Netlify, site `d9ec18aa-...` | env vars, deploy logs, Forms inbox | inquiries currently land in the Forms inbox, so this is also where leads are read today |
| Meta Business, Events Manager | Pixel and Conversions API | Pixel id `4039555362846500`, already public in client JS, not a secret |
| CRM hosting and database | running the Next.js CRM | Prisma based, host not determined by this work |

### Environment variables, all set in Netlify for the website

| Variable | Status | Purpose |
|---|---|---|
| `FAMILY_DRY_RUN` | not set in prod, `1` locally | skips storage, marks the response `dry_run` |
| `FAMILY_CRM_INTAKE_URL` | **not set** | CRM intake endpoint. Leaving it unset is what makes submissions fall back to Netlify Forms. Read section 7 before setting it |
| `FAMILY_CAPI_PARENTS_PAGE` | **not set** | set to `1` to enable the Conversions API relay, parents page only |
| `META_CAPI_TOKEN` | **not set** | Meta Conversions API access token. A real secret. Generate in Events Manager under the Pixel's Conversions API settings. Only the owner should paste this |
| `URL` | provided by Netlify | site origin, used for the Forms fallback and origin checks |

The CRM side additionally uses `INTAKE_WEBSITE_MODE`, `WEBSITE_ALLOWED_ORIGIN`,
`CAPTCHA_PROVIDER` and `CAPTCHA_SECRET`. Those govern the intake route described
in section 7.

---

## 6. File map

Website repo:

```
buy-a-home-for-parents.html      generated, do not edit
family-housing-options.html      generated, do not edit
request-received.html            generated, do not edit
family.css                       standalone stylesheet, does not import styles.css
js/family-lp.js                  runtime: tracking rules, form, validation, sticky CTA
js/family-config.js              generated runtime settings
netlify/functions/family-inquiry.js    validation, rate limit, dedupe, storage, CAPI
netlify/functions/family-shared.json   generated server-side allowlists
scripts/family_lp_config.py      THE config
scripts/build-family-lps.py      generator
scripts/lint-family-lps.mjs      compliance linter
scripts/family-dev-server.mjs    local preview with the real handler mounted
tests/family-inquiry.test.mjs    10 endpoint tests
_redirects                       .html to clean URL redirects, three entries
netlify.toml                     noindex and no-store headers for /request-received
```

CRM repo:

```
lib/intake/connectors/website.ts   WEBSITE_PAGE_VALUES allowlist, the two page ids
app/api/intake/website/route.ts    the intake endpoint, origin and CAPTCHA gates
```

---

## 7. Known blocker: the CRM will reject these submissions

Setting `FAMILY_CRM_INTAKE_URL` to the CRM's `/api/intake/website` **will not
work in production as both sides are currently written.** Two independent
reasons, both in `app/api/intake/website/route.ts`:

1. In production the route requires `requestOrigin === allowedOrigin`, with an
   explicit "no origin-less bypass in prod" comment. The Family endpoint is a
   Netlify Function making a server-to-server `fetch`, which sends no `Origin`
   header. Result: 403.
2. In production a CAPTCHA secret is mandatory, and the Family endpoint posts
   `token: ""`. `verifyCaptcha` short circuits to true only when no secret is
   configured. With one configured, an empty token fails verification. Result:
   400.

The route is built for browser form posts from the marketing site, not for
server-to-server calls. Options, roughly in order of preference:

- Add a server-to-server path to the CRM route: a shared secret header that,
  when valid, satisfies both the origin and CAPTCHA gates. Then set that secret
  on both sides.
- Post to the CRM from the browser instead, which loses the server-side
  validation, rate limiting, and dedupe the Family endpoint provides. Not
  recommended.
- Leave it on Netlify Forms and export manually, which is the status quo.

Until one of these lands, the Netlify Forms inbox is the lead destination and
somebody has to watch it.

---

## 8. Outstanding work, in suggested order

**a. Decide the Pixel question on the disability page.** Section 4. Everything
else is smaller than this.

**b. Bridge page for ad traffic. DONE, live at `/family-home-financing`.**
Built as the way to get Meta-measurable volume for this audience without putting
the disability signal into ad targeting. Ads point at this neutral page, which
carries the Pixel, and visitors self-select onward via two route cards. Meta sees
"interested in family housing" and never learns who continued to the disability
page, because that page sends Meta nothing.

Two properties that must survive any future edit:

- The slug and on-page copy stay general. The Pixel reports the URL, so a slug
  naming disability would leak the same signal the design avoids.
- Card link text mentioning disability is safe only because `autoConfig` is off.
  Re-enabling Meta's automatic element scraping would start transmitting it.

**c. Conversions API on the parents page.** Code is written and tested. Needs
`META_CAPI_TOKEN` and `FAMILY_CAPI_PARENTS_PAGE=1` in Netlify. The client already
emits a matching `eventID` for deduplication. Verify in Events Manager that
browser and server events pair up rather than double counting.

**d. Indexing.** `INDEXABLE = False` in the config still stamps
`noindex,nofollow` on both landing pages. Flip to `True` and rebuild when the
owner wants organic search traffic. The confirmation page stays `noindex`
regardless, enforced separately in `netlify.toml`.

**e. CRM integration.** Section 7.

**f. Unverified launch inputs.** The owner has confirmed lender availability,
state licensing, and the privacy policy. Two smaller items were never confirmed:
`BRAND["entity_note"]` carries a "CONFIRM before launch" comment, and
`CONTACT["title"]` for Chris De Leeuw reads "Co-Founder, Stonehaven Lending".

---

## 9. Things that will bite you

- **Editing the HTML directly.** It is regenerated. Edit the Python config.
- **Adding `funnel.js` or `site-config.js` to these pages.** It would put the
  Pixel on the disability page through the back door. The linter checks for it.
- **Dry run hides the Lead event.** Local submissions never fire Pixel `Lead`,
  by design. Do not read that as the Pixel being broken.
- **Rate limiting is in-process.** Five per IP per ten minutes, held in function
  memory, so it resets on cold start and is not shared across instances. Fine for
  current volume, not a real defence at scale.
- **Deduplication is also in-process**, same caveat, two minute window on phone
  plus page.
- **The Netlify build command deletes `docs`, `tests`, `scripts` and
  `netlify.toml`** before publishing, and greps the HTML for prohibited claims,
  failing the build on a match. Adding a banned phrase breaks the deploy.
- **`scripts/__pycache__`** is untracked and not ignored. Harmless, do not commit
  it.
