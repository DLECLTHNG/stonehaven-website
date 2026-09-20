# Codex prompt: SEO and AI-search visibility for stonehavencre.com

Prepared 2026-09-20 from a direct audit of the repository, the live site, and
the current search results for the primary target terms. Paste everything below
the line as the opening message to Codex. It assumes Codex has already read
`docs/PROJECT-HANDOFF.md`, which it must do first.

---

You are improving organic search visibility and AI-search visibility (the
likelihood that ChatGPT, Claude, Perplexity and Google AI Overviews cite this
site as a source) for stonehavencre.com, the marketing site of Stonehaven
Lending. Read `docs/PROJECT-HANDOFF.md` in full before doing anything. It
explains which pages are generated, the compliance gates, and why a push to
`main` is a production deploy.

## The business priority, in order

1. **Commercial deals from $2M to $10M.** Spec homes and builder construction
   financing, ground-up development, multifamily complexes, mixed-use and
   value-add. This is the main revenue focus and it is currently the thinnest
   part of the site.
2. **DSCR rental-property loans.** Already the deepest section: a pillar page,
   17 situation landing pages, two calculators and a ten-article guide series.
3. **Residential mortgages** in the six licensed states. Must still rank well.

Do not promise rankings, to the owner or in any document. Report leading
indicators instead: indexed pages, impressions, click-through, citations.

## Constraints you must not violate

These come from a licensed mortgage business's compliance regime, not from
style preference. Most are enforced by linters or the deploy gate; the rest are
documented rules. Breaking one is a legal problem, not a formatting one.

- **Stonehaven is a brokerage, never a lender.** Capital is always "arranged
  through" a third party. The deploy fails on direct-lender claims.
- **No pricing anywhere outside `/blog`**, and inside `/blog` only as dated
  facts of a closed transaction. No rates, no APR, no leverage percentages, no
  "from X percent" on any product page. Competitors publish these; you cannot.
  Compete on depth, tools and honesty instead.
- **Do not invent programs, terms, offices, credentials or outcomes.** Before
  you describe any commercial product as something Stonehaven arranges, the
  owner must confirm it is actually arrangeable through their lender panel. The
  internal claims register lists the lender matrix as an unverified fact.
- **Residential lending may only be claimed in GA, AL, TN, FL, NC and SC.**
  DSCR and commercial are "nationwide, availability varies by state". Never
  write a state-specific DSCR or commercial availability claim.
- **Never represent any structure as non-recourse.** The site is disciplined
  about this on DSCR pages. Agency multifamily programs are commonly
  non-recourse in the market, and you may describe that as a market fact about
  the program, but never as a Stonehaven offer or as something a borrower will
  get.
- **No em dashes anywhere.** Linters and the Family generator enforce it.
- **Generated pages are never hand-edited.** The 17 `dscr/` pages, 24 `heloc/`
  pages and 4 Family pages come from Python configs. Edit the config, rebuild,
  and confirm `git diff` shows only what you intended.
- **No new author or reviewer credit** unless that person actually wrote or
  reviewed the piece. Blog posts use Organization authorship because the owner
  has not supplied a reviewer. Note that the eleven `resources/` guides already
  carry `Person` bylines for the two founders; that is existing fact, not a
  licence to add bylines elsewhere. Strengthen the founders page and link to
  it rather than inventing attributions.
- **One unverified fact to flag, not fix.** The founders page says Chris De
  Leeuw is "based in the London office". That claim appears nowhere in the
  owner-fact registers. Do not build LocalBusiness schema, sameAs or any local
  signal on it until the owner confirms it. If it is true, it is an asset; if
  it is loose wording, it is a liability in structured data.
- **Run every gate before every push.** Only the grep inside the Netlify build
  is automatic. The four linters are stricter and nothing runs them. Section 5
  of the handoff lists the commands.

## Step 0: measurement before optimisation

**No Search Console property has ever existed for this site.** Every keyword
target in the repository is labelled a hypothesis for that reason. Do not
optimise blind for another month.

1. Ask the owner to verify the domain in Google Search Console and Bing
   Webmaster Tools, and to grant you access. Use DNS verification so it covers
   both hostnames and both languages.
2. Submit `sitemap.xml` in both. It has 120 entries and a clean invariant:
   every indexable page is present, every noindex page is absent. Preserve
   that.
3. Confirm GA4 (`G-69X0CPMGJP`) is receiving events from `funnel.js` and that
   form submissions register as conversions. The Family pages use a separate
   runtime and report separately by design.
4. Pull a backlink profile from whatever tool the owner has. Expect it to be
   thin. The site has no `sameAs` on any page and no social or business
   profile links anywhere, so the entity is currently only established by NMLS.
5. Baseline: for each of the three product lines, record the ten most
   important queries, current position where any, and impressions. This is the
   report you compare against later.

## Priority 1: commercial, $2M to $10M

This is where the gap is widest, so most of the work lives here.

### What the site says today, and what searchers find instead

Measured by words on indexable pages, DSCR has about 40,000, residential about
7,900 and commercial about 3,200. The main revenue line holds roughly six
percent of the site's content. The phrases "spec home", "spec build",
"fix-and-flip", "land loan" and "$2M" appear nowhere on any English page; the
$1M to $3M and $3M to $10M bands exist only as options in a form dropdown.

`/commercial` is 650 words. It positions loan size as "$1M to $50M+" and
property types as "Multifamily, Industrial, Retail, Office, Mixed-use". It
mentions construction in exactly one bullet: "Ground-up or major
repositioning." The words spec, builder, developer, sponsor, loan-to-cost and
LTC do not appear anywhere on it. `/commercial/multifamily` is 326 words. The
only page on the entire site whose title targets construction or spec homes is
a 430-word blog write-up of one Brookhaven, Georgia closing. There is no page
anywhere targeting Atlanta or Georgia commercial lending; every commercial page
says "nationwide" and nothing else.

The search results for the primary terms look like this:

- **Spec home and builder construction financing** is owned by specialist
  lenders (Builder Finance, Legacy Group, Marquee Funding, Normandy). Their
  pages explain loan-to-cost ranges, 10 to 18 month terms, draw schedules,
  interest-only on advanced funds, and how experienced builders are treated
  differently from first-time builders. One competitor targets "$2M to $5M
  luxury spec homes" directly. Stonehaven has nothing on any of it.
- **Multifamily $2M to $10M** is dominated by Freddie Mac Small Balance Loan
  content (Select Commercial, Janover), because SBL is the agency program built
  for exactly that band. Industry data cited in those results puts three
  quarters of multifamily bridge requests between $1M and $10M, averaging
  $3.4M, which validates the owner's focus. Stonehaven mentions agency
  financing in one sentence on the multifamily page and never names a program.
- **Commercial loan broker Atlanta** is held by Select Commercial, Apartment
  Loan Store and local banks. Stonehaven, headquartered in Alpharetta, has no
  page for it.

### What to build

Before writing any of these, get the owner to confirm in writing which of the
following Stonehaven can actually arrange, and roughly what leverage bands and
sponsor requirements its lenders apply, so that the pages describe reality.
Write the pages to explain **how the financing works and what a lender needs
to see**, which is what those competitor pages do, without quoting Stonehaven
terms.

1. **Reposition `/commercial`.** Lead with the $2M to $10M sweet spot and the
   asset types the owner actually wants: spec homes, ground-up, multifamily
   complexes, value-add. Keep the broader list as secondary. Rewrite the title
   and meta to match. Add a direct-answer block at the top, the way `/dscr`
   already has one. Add a loan-size, sponsor-experience and
   loan-to-cost-versus-loan-to-value explainer. Target 1,500 words or more.
2. **New: spec home and builder construction financing.** How spec loans are
   sized on cost, what a draw schedule is, interest-only during construction,
   what changes between a first spec and a fifth, how the exit (sale or
   refinance) is underwritten, what documents a builder brings. Deepen the
   existing Brookhaven write-up rather than compete with it, and link the two.
3. **New: ground-up development and multifamily construction.** Distinct from
   spec homes: entitlements, construction-to-permanent, stabilisation,
   lease-up risk.
4. **New: multifamily acquisition $2M to $10M.** Explain the program landscape
   plainly: agency small-balance, bank, credit union, bridge. Name Freddie Mac
   SBL and Fannie Mae Small Loan as programs that exist and what they require,
   as market facts, only after the owner confirms Stonehaven can broker them.
   Expand `/commercial/multifamily` from 326 words to a real page or fold it
   into this.
5. **New: bridge and value-add.** The site has a good `bridge-vs-permanent`
   resource; build the product page it should point to.
6. **New: commercial real estate financing in Georgia and metro Atlanta.** The
   only local commercial page on the site. Ground it in the Alpharetta office,
   the Brookhaven closing, and the Georgia licensing, and say plainly that
   commercial is arranged nationwide with this being the home market. Do not
   invent local lender relationships.
7. **Extend the commercial calculator** to size a construction loan on cost
   only if the maths is added to `js/commercial-calc.js` with fixtures in
   `tests/commercial-math.test.mjs` and documented on
   `/calculation-methodology`. The existing calculator is 326 words and
   positioned for DSCR-versus-LTV sizing; keep that and add, do not replace.
8. **Commercial closings on the blog.** The blog is literally named "Closings"
   and is the ideal proof surface for $2M to $10M work, yet only one commercial
   closing exists. Each new one follows `docs/BLOG-DEAL-BRIEF.md`: no names, no
   addresses, rounded amounts, dated rates, "arranged through". Ship through
   `scripts/new-post.mjs` and commit the JSON brief alongside it, because none
   has ever been kept and posts cannot otherwise be regenerated.
9. **Resolve who owns the 5 to 8 unit buyer.** `/dscr` sends "5+ units" to
   commercial programs; `/commercial/multifamily` sends "under five units" to
   the DSCR desk; yet the DSCR program calculator models a 5 to 8 unit rule set
   and the Charlotte article, the longest on the site at 2,500 words, explains
   it in depth. No service page owns that buyer, and the two product pages
   contradict each other. Decide with the owner where 5 to 8 units live, build
   the page, and make both product pages point to it.
10. **Homepage.** Its title is "Home, Investment, Commercial & SBA Loans |
   Stonehaven" and its H1 is "Buy, finance, or refinance - with one accountable
   team". Neither states what the company is best at. The commercial card is
   third of four. Decide with the owner whether the homepage should lead with
   commercial. At minimum, retitle it to name the business and its core
   offer, and use "Stonehaven Lending" rather than "Stonehaven" for entity
   consistency.
11. **Commercial hub and internal links.** Today `/commercial`, the three asset
    pages, the three commercial resources and the one blog post do not form a
    cluster. `/commercial` itself links to none of the resource guides, not to
    the calculator, and not to the Brookhaven closing; the three asset pages do
    not link to each other; the Brookhaven post is reachable only from the blog
    index and its own body links only to the booking page. Build the hub, cross-link every commercial page to it and to each
    other with descriptive anchors, and add breadcrumbs. Every new page needs a
    manual `_redirects` line and a manual `sitemap.xml` entry; nothing outside
    the blog generator does this for you.

## Priority 2: DSCR

Already strong. The work is finishing, not building.

1. **Fix the disclaimer on the ten DSCR guides.** Only three of the fifteen
   posts on the "Closings" index describe a real closed transaction; twelve are
   guides built on a hypothetical. They all inherit the blog's
   closed-deal boilerplate, which says they are "illustrative of transactions
   already closed". They are educational explainers. Add a second disclosure
   variant for guides in `scripts/new-post.mjs` and reapply it. This is a
   compliance accuracy issue on live pages and comes before any new content.
2. **Confirm the four placeholder figures and the 7.25 percent illustrative
   rate** that are live in those guides. Section 8 of the handoff lists them.
3. **DSCR state pages.** The "DSCR loan Georgia" results are entirely lender
   state pages. Stonehaven has a Georgia investor guide but no state page, and
   its 17 landing pages are organised by situation, not place. Build state
   pages for the six licensed states first, since those are also the
   residential states and the office is in Georgia. Each must say DSCR is
   arranged nationwide and avoid any state-specific availability or term claim.
   Competitors publish minimum ratios, scores and down payments; you cannot, so
   these pages win on the calculators, the program-rule engine and the guide
   series instead. Link every one to `/dscr-analyzer` and
   `/dscr-program-calculator`.
4. **Pages DSCR is still missing**, in rough priority: a 5 to 8 unit service
   page (see Priority 1, item 9); state pages for Tennessee, Alabama and South
   Carolina, which have nothing at all today while Georgia, Florida and North
   Carolina have articles; an ITIN and foreign-national investor page, which is
   an obvious fit for a bilingual site and absent; condotel; interest-only
   structures; a standalone prepayment-penalty explainer, currently a module on
   `/dscr-review`; and DSCR versus hard money and versus bank portfolio loans.
   Confirm each program is arrangeable before writing it.
5. **The `/resources/dscr` hub** and the requirements guide planned in
   `docs/owner-facts-required.md` are blocked on a named author. Do not build
   them until the owner supplies one.
6. **Spanish reviewer.** Ten Spanish DSCR mirrors are live without the native
   reviewer the internal docs require. Flag it; do not translate more until
   resolved.

## Priority 3: residential

Six state pages exist under `/residential/` plus buy, refinance, FHA and VA.
Every one is between 294 and 385 words. Check each for depth and a
direct-answer opening. The obvious missing pages, each a distinct query with
real volume, are: conventional loans, jumbo, USDA, first-time-buyer and
down-payment assistance (Georgia Dream is the natural first one), bank
statement and other non-QM, ITIN, renovation loans (203k and HomeStyle),
construction-to-permanent, second homes, pre-approval, and plain explainers
for closing costs and mortgage insurance. HELOC has exactly one indexable page;
there is no home equity loan page and no HELOC requirements page. Then, within the six licensed
states only, consider metro pages for the markets the state pages already name
(Atlanta, Nashville, Charlotte, Tampa and so on), each grounded in a verifiable
local fact and the correct state licence number. The South Carolina page is
right to say the state issues no separate licence number; do not "fix" that.
HELOC has 24 landing pages that are deliberately noindex for paid traffic;
leave them alone.

## Cross-cutting: technical SEO and AI-search readiness

### Entity and structured data

- **Add `sameAs`** to the Organization and FinancialService entities: LinkedIn
  company page, the two founders' LinkedIn profiles, and a Google Business
  Profile if one exists or the owner creates one. Confirm each URL with the
  owner. The NAP data is already consistent across 34 schema blocks; keep the
  telephone, address and NMLS identifier byte-identical everywhere.
- **Add a `MortgageBroker` type** (a schema.org subtype of FinancialService)
  to the organisation entity, with a stable `@id`, so every page points at one
  canonical entity node rather than restating it.
- **Decide FAQPage once.** A July decision removed it sitewide because Google
  retired the rich result, but that decision was only ever applied to the blog.
  It is still present on 45 of the 119 tracked English pages plus their Spanish mirrors,
  and not just the generated sets: `/commercial`, `/dscr`, `/sba`, every
  calculator, every residential state page and the cash-out page all still
  carry it. Either remove it everywhere, through the generators where a page is
  generated, or keep it consistently. Do not promise FAQ rich results either
  way; visible FAQs stay because readers and LLMs use them.
- **Fix the entity name mismatch.** The founders page and `llms.txt` say
  "Chris De Leeuw"; the `Person` bylines on the resources guides say
  "Christiaan De Leeuw". An answer engine treats those as two people. Pick the
  canonical form with the owner and use it in every schema block, byline and
  `sameAs`, everywhere, including the Spanish pages.
- **Fix the broken breadcrumb target.** The `BreadcrumbList` on the resources
  guides points at `/resources`, which does not exist and returns 404. Either
  create that hub page or repoint the breadcrumb at `/resources/commercial`,
  `/resources/residential` or `/resources/sba` as appropriate.
- **`/about`, `/team` and `/licensing` all 404**, while the nav's "About Us"
  goes to `/management`. At minimum redirect `/about` to `/management` in
  `_redirects`. The full pages are gated on owner facts; do not fabricate them.
- **BreadcrumbList** on every product and resource page, positions correct.
- **`Service` schema** for each new commercial product page.
- **Strengthen the founders page** (`/management`), which already carries two
  `Person` entities with real bios. Neither bio mentions commercial,
  construction, multifamily or DSCR. Ask the owner for accurate additions,
  because that page is the strongest expertise signal the site has for the
  commercial focus, and it is unused for it.

### AI-search visibility

- **Update `llms.txt`.** It is well built and factual but stale: it describes
  the blog only as anonymised closings and does not mention the ten-article
  DSCR guide series, and its commercial section lists three thin pages. Add
  every new commercial page, the guides, and one-line factual descriptions an
  answer engine can quote. Consider an `llms-full.txt` carrying the pillar
  pages in full. Keep every statement in it verifiable against the site.
- **`robots.txt` already allows every major AI crawler explicitly.** Leave it.
- **Direct-answer openings.** `/dscr` has one. Every product page and every
  new commercial page should open with two or three plain sentences that
  answer the query, state what Stonehaven is, and say where it operates,
  before any marketing copy. That paragraph is what gets quoted.
- **Quotable facts over adjectives.** Answer engines cite specific,
  attributable statements. "Stonehaven Lending is a mortgage brokerage
  headquartered in Alpharetta, Georgia, NMLS 1752355, arranging commercial
  financing nationwide" is citable. "One accountable team" is not.

### Freshness

No product page carries `dateModified` or a visible reviewed-on date, and the
sitemap stamps them all 2026-08-20. Add both, but only tied to a real review:
the owner has not supplied a reviewer, so date pages when their content
actually changes, and never fake a review date.

### On-page hygiene

**Titles and meta descriptions.** Coverage is good: across 119 tracked
English pages, the only missing or stub meta descriptions are on the eight
`thanks-*` confirmation pages, which are noindex, and the only duplicated
titles are the three `thanks-*` pages sharing "Request Received | Stonehaven".
Fix neither as a priority. What does matter: the homepage title is "Home,
Investment, Commercial & SBA Loans | Stonehaven" and it, like several pages,
uses "Stonehaven" where the entity everywhere else is "Stonehaven Lending".
Standardise the brand suffix sitewide, and rewrite the homepage and
`/commercial` titles to lead with the offer. Then run your own sweep of every
indexable title and description for length and for brand-before-intent
ordering, using Search Console impressions to decide which pages are worth
rewriting first.

**Heading hierarchy.** The homepage, `/commercial`, `/commercial/multifamily`
and `/dscr` each have one H1 and no level skips. `/residential` and
`/resources/commercial` both jump from H1 straight to H3 with no H2, which
weakens the outline for both crawlers and screen readers; insert the H2 layer.
The 16 HELOC persona pages ship an empty H1 that JavaScript fills; they are
noindex today, so it only matters if that ever changes. Sweep the remaining
pages for skips with a script rather than by eye.

**Canonical and hreflang.** Verified clean on the risky case: 44 English pages
declare a Spanish alternate and every one points at a Spanish page that
exists. Pages without a mirror, including all of `dscr/`, `resources/` and
`heloc/`, correctly declare none. Keep it that way: never add an `es`
alternate to a page whose mirror has not been built. Sweep every page to
confirm its canonical is self-referencing and extensionless; the July clean-URL
migration should have left them all correct.

**Internal links and orphans.** Nav and footer reach everything, so there are
no true orphans, but body-link equity is badly skewed. `/commercial/mixed-use`,
`/commercial/commercial-property` and the commercial refinance guide each have
one body inbound link; `/commercial/multifamily` has two; the Brookhaven
construction post has none outside the blog index. Meanwhile `/dscr` and
`/contact` are linked from almost every page. Build the commercial cluster
described in Priority 1 and the equity follows. Generate a sitewide inbound
body-link table from the HTML before and after, so the change is measurable.

Image alt text is already complete: all 334 `img` tags on English pages carry
an `alt` attribute, and every image on the homepage, `/commercial`,
`/commercial/multifamily` and `/dscr` carries `width` and `height`. Verify that
decorative images use an empty alt rather than a keyword. Note the site is
almost image-free by design: those four pages carry three images each, all
brand marks. New commercial pages will want real photography of asset types,
and each image added needs alt, dimensions and a modern format.

**Performance, from a static read.** The fundamentals are already right:
Google Fonts loads with `display=swap`, every key page's images carry `width`
and `height` so they cannot shift layout, and the two site scripts are
deferred rather than render-blocking. What remains is ordinary: three
render-blocking stylesheets per page (`styles.css`, `funnel.css` and the
Google Fonts CSS), and no preload for the two font families actually used.
Inline the small critical CSS or combine the two local sheets, preload the
fonts, and self-host them if the Fonts CSS round trip shows up as the
long pole.

The two local stylesheets total about 34 KB, so weight is not the problem;
the serial round trips are.

Real Core Web Vitals could not be pulled during this audit: the keyless
PageSpeed Insights endpoint had exhausted its shared daily quota. Run it with
your own API key on the homepage, `/commercial`, `/dscr` and one blog post,
mobile and desktop, and treat its field data as the source of truth over any
static reading.

### Citations and off-site

Only legitimate, verifiable listings: NMLS Consumer Access already linked, the
Georgia Department of Banking and Finance licensee record, the other five
state regulator records, a Google Business Profile for the Alpharetta office,
and industry directories that list brokers by specialty. No paid links, no
directories that would list a business it is not.

## How to work and how to report

- Ship in small commits, one page or one fix each, so a compliance problem is
  easy to revert. Run all gates before every push.
- Keep a running list of every fact you needed the owner to confirm, and get
  confirmation before publishing anything that depends on it. The list starts
  with: which commercial programs are arrangeable and at what rough leverage;
  whether the London office is real; the founders' commercial credentials;
  social and business profile URLs; whether a Google Business Profile exists.
- Report monthly against the Step 0 baseline: indexed pages, impressions and
  clicks per product line, pages cited by AI answer engines (test the ten core
  queries in ChatGPT, Perplexity and Google AI mode and record whether
  stonehavencre.com is cited), and form submissions by source. No ranking
  promises.
