# Stonehaven Commercial — Post-Launch SEO Checklist

Everything that can't be done in the code. Work top to bottom; the first section is the highest priority.

---

## 1. Before you promote the site

- [ ] **Replace the placeholder phone** `+1 (800) 555-0100` with your real number (see SEO-CHANGES.md for every location). A real lender's line matters for both conversions and local trust.
- [ ] Confirm the loan ranges and the illustrative DSCR example read correctly for your programs.
- [ ] Redeploy so `stonehavencre.com` serves the new pages (drag the `stonehaven-website` folder onto the existing Netlify site, or let me push it).
- [ ] Spot-check on a phone and desktop: EN and ES, all six pages, the toggle links, and the FAQ accordions.

## 2. Google Search Console (do first — it's how Google learns about the site)

- [ ] Create/confirm a property for `stonehavencre.com` at [search.google.com/search-console](https://search.google.com/search-console). Verify via DNS (a TXT record at GoDaddy) — cleanest, since you control DNS there.
- [ ] **Submit the sitemap:** Sitemaps → enter `sitemap.xml` → Submit.
- [ ] Use **URL Inspection** on the home page and each product page → "Request indexing" to nudge first crawl.
- [ ] After a few days, check **Coverage/Pages** for errors and confirm both `/` and `/es/` URLs are being indexed.
- [ ] Check **Enhancements / Rich results** for the FAQ and Breadcrumb structured data; fix anything flagged.
- [ ] Run each page once through the [Rich Results Test](https://search.google.com/test/rich-results) and the [Schema Markup Validator](https://validator.schema.org/) to confirm the JSON-LD is recognised.

## 3. Google Business Profile

- [ ] Create a [Google Business Profile](https://business.google.com). Even a nationwide lender benefits — it powers brand searches and the knowledge panel. Use the exact same NAP (name, phone, email) as the site footer.
- [ ] Categories: "Mortgage lender" / "Loan agency" / "Commercial real estate." Add the website URL and a short description mirroring the home page.
- [ ] Keep NAP identical everywhere (site, GBP, directories) — consistency is a local ranking signal.

## 4. Bing / other engines

- [ ] Add the site to [Bing Webmaster Tools](https://www.bing.com/webmasters) (you can import directly from Search Console) and submit the same sitemap. Bing also feeds DuckDuckGo and ChatGPT search.

## 5. Analytics & monitoring

- [ ] Add **Google Analytics 4** (or a privacy-light alternative like Plausible) to measure traffic and form starts.
- [ ] Set up conversion tracking on the lead form's success state once it's wired to the CRM.

## 6. Backlinks & citations (what moves rankings for competitive lending terms)

Lending is a "Your Money or Your Life" niche — Google weighs authority and trust heavily, so credible links and consistent citations matter more than on most sites.

- [ ] **Industry directories & marketplaces:** get listed on [Scotsman Guide](https://www.scotsmanguide.com/) (the standard CRE/mortgage directory), plus lender directories like Lendio, C-Loans, CommercialLoanDirect-style listings, and Crexi's lender network where applicable.
- [ ] **Associations:** join and get the member listing/link from relevant bodies — e.g. the National Association of Mortgage Brokers (NAMB), state mortgage/broker associations, CRE and SBA lending groups. Association profiles are trusted, durable links.
- [ ] **SBA ecosystem:** SBA lender/partner directories and local SBDC / SCORE resource pages.
- [ ] **Local chambers of commerce** for your home base (and any target metros) — chamber member pages are easy, trusted citations.
- [ ] **Consistent NAP citations:** claim and standardise listings on the major business-data aggregators (Google Business, Bing Places, Apple Business Connect, and data providers like Data Axle/Foursquare) so your name, phone, and email match everywhere.
- [ ] **Earned links:** a few genuinely useful resource articles (below) tend to attract links from real-estate blogs and investor forums far better than directory links alone.

## 7. Phase-2 content plan — a `/resources/` article hub

Thin product pages don't win long-tail traffic; a resource hub does. Add a `/resources/` section and publish focused articles targeting real questions. Each should be genuinely useful, in the same restrained brand voice, internally linked to the relevant product page, and (where it fits) carry `Article` + `FAQPage` schema.

Suggested first articles (high-intent, attainable):

- **"SBA 504 vs 7(a): which loan is right for buying your building?"** — compares the two programs head-to-head; links to the SBA page.
- **"DSCR loan requirements: what investors need to qualify"** — expands the DSCR ratio explainer into a full guide.
- **"How to calculate DSCR (with examples)"** — a calculator-style piece; strong featured-snippet and link magnet.
- **"How much down payment do you need for a commercial property?"** — answers a very common query; links to Commercial + SBA.
- **"Commercial construction loans explained"** — targets a distinct sub-topic of the commercial page.
- **State-level pages** — e.g. "DSCR loans in Texas," "commercial real estate loans in Florida." Start with 3–5 states where you do the most business; each is a real page with local framing, not a thin doorway. Mirror the best performers in Spanish, where competition is lightest.

Cadence: one solid article every week or two beats a burst then silence. Track which ones earn impressions in Search Console and double down on those themes.

## 8. Ongoing

- [ ] Review Search Console monthly: which queries bring impressions, where you rank 5–15 (the "nearly there" wins), and any coverage errors.
- [ ] Keep the sitemap current as you add resource articles.
- [ ] Refresh the product pages' figures whenever your real programs change.
