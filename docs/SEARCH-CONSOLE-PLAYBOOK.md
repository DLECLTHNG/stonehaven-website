# Search Console playbook for stonehavencre.com

Prepared 2026-09-20 from the current `main` branch, the live site, DNS, and
Google's own documentation. Every claim about the site below was checked; the
quota figures are hedged where Google does not publish an exact number.

---

## 1. The situation, stated plainly

A Search Console property for this domain **exists and is verified**. The
apex DNS carries two `google-site-verification` TXT records, which means a
Domain property covering `https`, `http`, `www` and `/es/` in one view. The
owner can see it: on 2026-09-15 they supplied 25 URLs that Google had
reported as "Discovered, currently not indexed".

What has been missing is not the property but **access to it**. Every agent
and engineer who has worked on the site since July has done so blind. Codex's
own audit of 2026-09-18 records that Search Console "opened to its signed-out
introduction", and every keyword target in the repository is labelled a
hypothesis for that reason. Five weeks of content work, including a fifty
state DSCR series and a tripling of the sitemap, shipped without a single
impression or indexing figure to steer it.

Two TXT records also means two verifications. Each grants owner-level rights.
Before anything else, the owner should open Settings, Users and permissions,
and confirm who holds them.

## 2. Access and configuration, first hour

1. **Grant access.** Add whoever runs the SEO work as a Full user, not Owner.
   Owners can delete the property. If a second verification record belongs to
   a former contractor, remove it and the user.
2. **Confirm it is the Domain property.** The DNS records say it is. A stray
   URL-prefix property for `https://stonehavencre.com/` alongside it would
   split reporting; delete any duplicate.
3. **Submit the sitemap** if it shows as unsubmitted:
   `https://stonehavencre.com/sitemap.xml`. It is a single file, 340 URLs,
   161 KB, well inside the 50,000 URL and 50 MB limits. 306 entries carry
   `xhtml:link` language alternates. It is declared in `robots.txt`.
4. **Link GA4** (`G-69X0CPMGJP`) under Settings, Associations. Codex's notes
   say the matching property in the owner's account has not been confirmed;
   do that at the same time.
5. **Check Settings, Search generative AI.** Google documents inclusion in AI
   Overviews and AI Mode as the default, inherited by child properties. Confirm
   nothing has been switched off. Nothing on the site blocks it either: no
   `nosnippet`, `max-snippet` or `noai` directive exists on any page.
6. **Open Bing Webmaster Tools** and import the property from Search Console.
   Bing has no verification on the site today, and its AI Performance report
   is the only place that shows actual citation counts across Microsoft AI
   surfaces. IndexNow is already implemented on the site, with its key file at
   the root, so Bing will also receive change notifications once verified.

## 3. The one finding already in hand: the 25 URLs

On 2026-09-15 Google reported 25 URLs as "Discovered, currently not indexed".
That status means Google knows the URL and has chosen not to fetch it yet. It
is a crawl-scheduling decision, not a verdict on the content and not an
error. Codex checked all 25: every one returned 200, self-canonical, no
noindex, present in the sitemap.

What the 25 have in common is more telling than what was wrong with them,
because nothing was wrong with them:

- twelve are Spanish mirrors
- ten are the residential state pages, English and Spanish
- the rest are resource hubs, a calculator and the blog index

In other words, templated pages and translations on a domain with a thin
external link profile. That is the textbook profile for deprioritised
crawling. Codex's response was correct: it added contextual hub links so the
pages are now one to three clicks from home. On today's tree those 25 have a
median of six body inbound links against a site median of three, so they are
no longer link-starved.

What to do now, in order:

1. Run **URL Inspection** on each of the 25. The status may have moved to
   Indexed since the 15th. Record the result and the last-crawl date for
   each.
2. For any still "Discovered", use **Request indexing** on the highest-value
   ones first: the five English residential state pages, `/resources/commercial`,
   `/commercial/multifamily`, `/cash-out-refinance`. Leave the Spanish mirrors
   to follow naturally; they will be crawled once their English pages are.
3. **Respect the quota.** The manual Request indexing button is capped per
   property per day, at roughly ten. Google does not publish the exact number,
   and community threads show it tripping after two or three on some
   properties. The URL Inspection API allows about 2,000 inspections a day but
   cannot request indexing. Do not burn the quota on Spanish mirrors or on
   pages that already show as Indexed.
4. Watch for a **status change to "Crawled, currently not indexed"**. That is
   a different signal. It means Google fetched the page and decided it was
   not worth indexing, which is a quality or duplication judgement, and no
   amount of re-requesting fixes it. Only content changes do.

## 4. The next problem, predicted before the data arrives

The fifty DSCR state guides shipped after the 25-URL report and are the most
likely next wave. The evidence on today's tree:

| Signal | Value |
|---|---|
| Body inbound links | 44 of 50 have exactly two, from the blog index and their own Spanish mirror |
| Length | median about 540 words; one outlier at 2,291 |
| Similarity | pairwise main-text similarity between guides has a median of 0.53, where two unrelated guides score 0.09 |
| Sitemap growth | from about 120 URLs to 340 in five weeks, mostly this series and its mirrors |
| Duplicates | each guide has a Spanish mirror, so 100 URLs share one template |

Codex's own audit already said it: "Review queries, indexing and qualified
leads before consolidation. No blanket noindex or another location-swapped
batch." That is the right call, and Search Console is the only place the
review can happen. Until it does:

- **Do not request indexing for these fifty en masse.** It spends the quota
  and, if Google declines them anyway, it teaches nothing.
- **Read the Page indexing report for them specifically.** Filter the report
  by URL containing `dscr-loans-` and `-investor-guide`. If most sit in
  "Discovered" or "Crawled, not indexed" after sixty days, the series needs a
  decision, not more links.
- **The decision, when it comes, has three shapes.** Keep and deepen only the
  six licensed states, where the residential pages already give Google a
  reason to trust the geography, and let the other 44 fall to a single index
  page. Or differentiate each with a genuinely local fact, which Codex did
  for the Georgia, Florida, North Carolina and Charlotte pieces and which is
  why those are the ones with more than two links. Or noindex the ones that
  earn nothing after ninety days. Search Console tells you which; nothing
  else does.

## 5. How to read each report for this site

The reports below are the ones that matter here, with the filter or question
to bring to each. Search Console keeps sixteen months of performance data, so
the first export establishes the baseline for everything after.

**Page indexing.** The headline ratio is Indexed against Not indexed. On this
site the Not indexed bucket should contain 62 deliberate noindex pages: the 24
HELOC landing pages, the Family pages, the thank-you pages and one persona.
Anything beyond those needs a reason. The statuses to act on are "Discovered,
currently not indexed" (crawl priority, fix with links and patience),
"Crawled, currently not indexed" (quality, fix with content), and "Duplicate
without user-selected canonical" (if the Spanish mirrors ever appear here,
the hreflang pairing has broken; today all 147 pairs are reciprocal).
"Alternate page with proper canonical tag" is expected for every `.html` URL
redirecting to its clean form and needs no action.

**Sitemaps.** Compare Discovered URLs against Indexed for `sitemap.xml`. With
340 submitted, an indexed count under about 250 after ninety days means the
templated series is being declined. Every lastmod in the file is August or
September 2026; 291 of 340 say September. Google discounts lastmod it cannot
trust, so keep the repository's rule that a date changes only when content
changes, never on a build.

**Performance.** Set up saved filters once, one per business priority, using
the page regex filter:

- Commercial: `commercial|construction|builder|bridge|fix-and-flip|multifamily|mixed-use`
- DSCR: `dscr`
- Residential: `residential|heloc|cash-out|fha|mortgage-calculator|refinance`

Then, in each, look for three things. Queries at positions four to ten with
real impressions are the striking-distance set and get the first content
attention. Pages with impressions but a click-through rate under two percent
at positions one to five have a title or description problem; thirteen
indexable titles currently exceed 85 characters. And any query where two of
your own pages both show impressions is cannibalisation, which on this site is
most likely between `/dscr`, a situation page and a state guide. Note that
Performance already includes AI Overview and AI Mode impressions inside its
totals; the new report only separates them.

**Links.** The Top linked pages internal view should confirm the near-orphan
finding from the tree: state guides at two, resources articles at one. The
External links view will be short. Do not treat that as an emergency; it is
the reason crawl priority is low, and it is addressed by earning references
from builder associations, brokers and professional profiles, not by
purchasing links.

**Core Web Vitals.** Expect pressure on mobile LCP. The only bitmap on the
site is a 962 KB logo shipped on all 404 pages and used as the share image.
It is rendered at 76 pixels. That file competes for bandwidth with the hero
text on every mobile load. Fix it before the report has enough field data to
mark URLs Poor, because a Poor rating is a ranking signal and takes twenty-eight
days of good data to clear.

**Enhancements.** Breadcrumbs should appear with 181 valid items, since every
indexable page carries `BreadcrumbList` and the CI gate validates each target.
No FAQ report will appear; the markup was retired sitewide and the build now
rejects it. That is correct.

**International targeting.** The legacy hreflang report, if still shown, should
list zero errors. The 34 English pages without a Spanish mirror correctly
declare no alternate.

**Generative AI performance.** New in June 2026 and worldwide since 31 August.
It shows impressions of your URLs inside AI Overviews, AI Mode and Discover,
by page, country, device and date. It does not show queries and it does not
show clicks, and the impressions were already counted in Performance. Use it
for exactly one purpose: to see which pages Google's own AI features are
willing to surface, and to compare that list against the pages you want cited.
Low volume can make the report fail to appear at all for a small property.

**Removals.** Nothing belongs here. The withdrawn PDFs already return 410.

**Manual actions and Security.** Should both read "No issues". Check once.

## 6. Pre-empt the findings, without waiting for them

Most of what Search Console will surface is already known from the tree and
already in the SEO brief. Doing these before the data lands means the first
monthly report shows the fix rather than the problem:

1. The logo, because it is the likely mobile LCP finding.
2. The `/dscr` answer block, pushed to eighth position under a form, because
   it is the page most likely to earn AI Overview impressions and the
   quotable paragraph is buried.
3. Contextual links into the state guides from `/dscr` and from the
   residential state pages, because two inbound links is why they will sit in
   "Discovered".
4. The thirteen long titles, because they will show up as low click-through
   at good positions.

## 7. A cadence that does not lie to you

Search Console data lags two to three days and indexing decisions take weeks.
Reading it daily produces noise and re-requesting produces nothing. Instead:

- **Week one:** access, sitemap, GA4 link, Bing import, inspect the 25, fix
  nothing else.
- **Day 30:** first Performance export per product line; Page indexing
  counts by status; Sitemap indexed ratio. This is the baseline. Save the
  exports in `docs/seo-implementation/` with the date, because the interface
  changes and the sixteen-month window rolls.
- **Day 60:** decide the state-guide question from the Page indexing filter.
  Act on striking-distance queries in the commercial filter.
- **Day 90:** compare against day 30. Report impressions, clicks, indexed
  pages and AI impressions per product line, and qualified inquiries from the
  CRM by source. No positions as a headline number and no ranking promises.

## 8. What only the owner can do

1. Add the SEO user with Full permission and audit the two verifications.
2. Confirm the GA4 property and link it.
3. Verify Bing by importing from Search Console.
4. Confirm the Search generative AI setting is on.
5. Decide, at day 60 and with the data in front of them, what happens to the
   44 state guides outside the licensed footprint.

## Sources

- Page indexing report: https://support.google.com/webmasters/answer/7440203
- URL Inspection tool and Request indexing: https://support.google.com/webmasters/answer/9012289
- Search Console API usage limits: https://developers.google.com/webmaster-tools/limits
- Generative AI performance report: https://support.google.com/webmasters/answer/16984139
- Search generative AI setting: https://support.google.com/webmasters/answer/16908024
- Launch of the generative AI reports, 3 June 2026: https://developers.google.com/search/blog/2026/06/gen-ai-performance-reports
- Bing AI Performance report: https://blogs.bing.com/webmaster/February-2026/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview
- Discovered, currently not indexed, causes and remedies: https://searchengineland.com/understanding-resolving-discovered-currently-not-indexed-392659
- Google's AI optimisation guidance, including that `llms.txt` is ignored: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
