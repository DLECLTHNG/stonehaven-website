> Owner correction, September 20, 2026: keep the homepage broad and residential-inclusive. Restore the previous homepage presentation. Remove preferred project-size positioning from evergreen pages. Pursue CRE SEO through dedicated service pages, guides and internal links, without repositioning the entire website as CRE-first. Dated campaign articles and actual lender-program limits remain separate. This correction supersedes conflicting positioning instructions below.

# Codex prompt: next SEO and AI-search phase for stonehavencre.com

Prepared 2026-09-20, after verifying production, the `main` branch at
commit `978bf8f`, Codex's own audit of 2026-09-18, and the current search
results for the primary target terms. Paste everything below the line as the
opening message to Codex.

This deliberately builds on `docs/seo-implementation/2026-09-18-cre-seo-ai-audit.md`
rather than replacing it. That audit is sound and its first wave has shipped.
What follows is the next wave, the items it under-weighted, and the owner
decisions it is blocked on.

---

You are continuing the SEO and AI-search programme for stonehavencre.com, the
site of Stonehaven Lending, a mortgage brokerage. Your own audit of September
18 and its three implementation notes in `docs/seo-implementation/` are the
baseline. Do not re-audit. Everything below assumes you have read them and
`docs/PROJECT-HANDOFF.md`.

Your working checkout is `/Users/c/Documents/ChatGPT/STONEHAVEN CODING/stonehaven-website`.
The older checkout under `stonehaven-master/05-go-live/` is behind `main` and
must not be used as a source of truth.

## The business priority, restated

1. **Commercial, $2M to $10M total project cost.** Spec homes and builder
   construction, ground-up and teardown, multifamily complexes, mixed-use,
   value-add. Main revenue focus. Your own finding stands: $2M to $10M is
   total project cost in the approved announcement, never a loan-size range,
   and the general commercial page's "$1M to $50M+" is a different thing.
2. **DSCR.** Deepest section on the site. Finishing work only.
3. **Residential** in the six licensed states. Must keep ranking.

No ranking promises anywhere. Report indexed pages, impressions, clicks,
citations and qualified inquiries against a dated baseline.

## What is already done, so you do not redo it

Verified live on 2026-09-20: construction, fix-and-flip and bridge service
pages in both languages; expanded multifamily, mixed-use and commercial
property pages; three expanded commercial guides with worked examples and
primary sources; four builder guides and a development case study; fifty
DSCR state guides using compliant "nationwide, availability varies by state"
language; every legacy `FAQPage` block removed and now blocked by
`check-seo.py`; the founder's name unified and Person identities linked to
`/management`; one `#org` identifier reused across publisher and provider
nodes; `mainEntityOfPage` and stable article identifiers; visible and
structured breadcrumbs on every page; the closed-deal disclaimer corrected on
the educational guides; IndexNow; first-touch source attribution with a
"how did you find us" field; builder intake collecting total project cost;
`llms.txt` refreshed; and a real CI gate. `site-checks.yml` runs every test,
all four linters, `check-seo.py` and generator drift detection on every push,
and Netlify runs the same check before it strips internal files.

Two of your own findings changed the rules and must be respected going
forward: `MortgageBroker` is not a supported schema type and was removed, so
do not reintroduce it; and hand edits are rejected by CI not only on `dscr/`,
`heloc/` and the Family pages but on the three new commercial pages, the
bank-statement and interest-only pages, every `SEO:*` block and every
breadcrumb, all of which have generators.

## Wave two, part A: engineering you can ship now

Ordered by impact. None of these needs the owner.

1. **The logo.** `assets/stonehaven-handpainted-logo.png` is 962 KB at
   1254 by 1254, rendered at 76 pixels in every header and 26 in every footer,
   and it is also the `og:image` and the JSON-LD `logo`. It is the only bitmap
   on the site and it ships on all 390 pages. Produce sized derivatives from
   the approved original, keep the original, use versioned caching, and put a
   proper 1200 by 630 image behind `og:image`; `assets/og-logo.png` already
   exists at that size and is unreferenced. Measure before and after with
   real Core Web Vitals, not asset size alone.
2. **Restore the direct answer on `/dscr`.** The definition paragraph that
   answer engines quote is now the eighth block on the page, beneath a
   heading and inquiry form inserted above it. In July it was third. Move the
   form below the answer. This is the pillar for the second business priority
   and it currently opens with a call to action instead of an answer.
3. **Fix the sitewide heading skip.** The footer column labels are `h5`
   elements, giving every page an `h2` to `h5` jump. One template change,
   179 pages. Then fix the `h1` to `h3` skip on `/residential`, `/sba`,
   `/heloc`, the three resource hubs and the six calculators, where hero
   cards carry no `h2`.
4. **Defer the seven calculator scripts.** `/dscr-analyzer`,
   `/dscr-program-calculator`, `/mortgage-calculator`,
   `/refinance-calculator`, `/commercial-loan-calculator`,
   `/sba-loan-calculator` and `/heloc` load their calculator script
   synchronously in the head. Everything else on the site is deferred.
5. **Lift the near-orphans.** Forty-nine of the fifty state DSCR guides and
   all six Family guides are linked only from the blog index and their own
   Spanish mirror. Nothing on `/dscr` or the residential state pages points at
   them. Seven resources articles are linked only from their hub. The
   commercial and SBA resource hubs have zero body-copy inbound links, only
   the footer. Add contextual links with real surrounding text, not link rows.
   Generate the inbound body-link table before and after so the change is
   measurable.
6. **Complete the entity node.** NMLS is missing from `Service.provider` on
   eleven pages and from every `BlogPosting.author`. The organisation email is
   `office@` on twelve root entities and `chris@` on the three Family roots;
   pick one. Four pages have no Open Graph tags: `/residential`,
   `/calculation-methodology`, `/bank-statement-loans`,
   `/interest-only-loans`. Add `xhtml:link` alternates to the sitemap for the
   pages that have mirrors; it carries them on 14 of 328 entries today.
7. **Trim the long titles.** Thirteen indexable English titles exceed 85
   characters and 42 exceed 70, almost all blog guides, the longest at 96.
   Use the publisher's `metaTitle` field so the descriptive `H1` stays.
8. **Extend `llms.txt` and add `llms-full.txt`.** The file is strong but
   covers 59 of 181 indexable English pages. Add a series pointer to the fifty
   state guides rather than fifty lines, the seventeen DSCR situation pages,
   the HELOC guides and `/editorial-policy`, plus a last-updated line. Build
   `llms-full.txt` carrying the pillar pages in full. Keep every statement
   verifiable against the site; Google says it ignores the file, so this is
   for the other engines and costs nothing.

## Wave two, part B: content that needs one owner answer first

Write nothing here until the owner has confirmed the fact it depends on. Put
the questions to them in one message, listed at the end of this brief.

9. **Multifamily acquisition, $2M to $10M.** The search results for that band
   are dominated by Freddie Mac Small Balance Loan content, because that is
   the agency program built for exactly it. Industry figures in those results
   put three quarters of multifamily bridge requests between $1M and $10M.
   Your expanded multifamily page now distinguishes agency, bank and bridge
   correctly, but no page on the site names Freddie Mac SBL or Fannie Mae
   Small Loan, and there is no page whose job is multifamily acquisition at
   this size. If the owner confirms these are arrangeable through the lender
   panel, build that page: what the programs require as market fact, never as
   a Stonehaven offer, with recourse described exactly as you did on the
   multifamily page.
10. **Decide who owns five to eight units.** `/dscr` still sends "5+ units"
    to small multifamily, and the DSCR program calculator and the Charlotte
    article, the longest on the site, both model a five to eight unit rule
    set. No service page owns that buyer. Ask the owner where those deals are
    actually placed, then build the page and repoint `/dscr`.
11. **A Georgia and metro Atlanta commercial service page.** The Atlanta
    teardown guide and the Brookhaven closing exist, but there is no service
    page for local commercial intent, and "commercial loan broker Atlanta" is
    held by Select Commercial, Apartment Loan Store and local banks. Ground
    it in the Alpharetta office, the two Georgia cases and the licensing, and
    say plainly that commercial is arranged nationwide with this as the home
    market. Do not invent local lender relationships.
12. **The homepage.** Its title is still "Home, Investment, Commercial & SBA
    Loans | Stonehaven". Your audit chose not to displace residential
    navigation, which is reasonable, but the title names neither the business
    nor its core offer, and it uses "Stonehaven" where every entity node says
    "Stonehaven Lending". Ask the owner whether the homepage should lead with
    the $2M to $10M commercial focus. At minimum, fix the title.
13. **The evidence library.** Your audit's three consented anonymised CRE
    cases remain the highest-value content on this list and cannot be
    written without the owner. Ask for them by name: a ground-up build with
    owned land or a payoff, an acquisition with heavy renovation and a draw
    structure, and a refinance or bridge takeout with a proceeds constraint.

The search results for spec homes are owned by specialist lenders whose pages
explain loan-to-cost ranges, ten to eighteen month terms, draw schedules,
interest-only on advanced funds, and how first-time builders are treated
differently from experienced ones. One targets "$2M to $5M luxury spec homes"
by name. Your construction page covers most of this. Check it against that
list once more and close any gap, still without quoting Stonehaven terms.

## The measurement you are still blind without

Your audit said it, and it is still true: no Search Console property exists,
no Bing property, GA4 key events are unconfirmed, no backlink export, no
Business Profile inspection, and no assistant citation benchmark has been run.
Every query target in the repository is a hypothesis for that reason.

Get the owner to open Search Console and Bing Webmaster Tools with DNS
verification and grant you access, confirm `generate_lead` is the single
inquiry key event in GA4 so legacy events are not double counted, and then
run your own C01 to C13 assistant prompt benchmark three times each in fresh
sessions before anything in part B ships. Check the Search generative AI
setting on the property. Use Google's Generative AI performance report and
Bing's AI Performance report as the citation sources; neither is a rank.

## Constraints, briefly

The full regime is in the handoff and your own docs. The ones that bite here:
brokerage never lender; no pricing outside `/blog` and only dated closed-deal
facts inside it; residential only in the six licensed states and DSCR or
commercial only as "nationwide, availability varies by state"; never any
structure represented as non-recourse; no `MortgageBroker` type; no author or
reviewer credit for anyone who did not author or review; no em dashes; edit
generators not outputs; and a push to `main` is a production deploy.

## Questions for the owner, in one message

1. Search Console, Bing Webmaster Tools and GA4: verify and grant access.
2. Which agency and bank multifamily programs can Stonehaven actually place,
   and does that include Freddie Mac SBL and Fannie Mae Small Loan?
3. Where do five to eight unit deals go today?
4. Should the homepage lead with the $2M to $10M commercial focus?
5. Three anonymised closed CRE cases, with consent, for the evidence library.
6. Exact LinkedIn company page, both founders' LinkedIn profiles, and Google
   Business Profile URL if one exists, so `sameAs` can be added once and
   correctly. It is absent on all 390 pages today.
7. Is "based in the London office" on the management page accurate as a
   statement about an office, or is it loose wording? It is on the page and
   in no fact register.
8. The evidence records your audit asked for: the $220M+ funded figure and
   its period, the $300M+ deal-flow figure kept separate from it, the 100%
   LTC denominator, and what "under one hour" promises.
9. A qualified fluent reviewer for the Spanish pages, and real team
   photographs if they want `BlogPosting.image` and profile photos populated.

Ship part A in small commits with the gates green. Report monthly against
the baseline once it exists.
