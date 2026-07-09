# Stonehaven Commercial — SEO Changes

What changed in this pass and why. The brand design, colours, fonts, and the lead forms were preserved. The one structural change is how Spanish is served (see below).

---

## The one architectural change: Spanish is now real `/es/` pages

**Before:** every page was English HTML; Spanish existed only as a JavaScript dictionary that swapped the visible text on the same URL when a visitor clicked "ES."

**Why that was a problem:** search engines index the HTML that is served. Google was only ever seeing English, and there was no separate URL for the Spanish content to rank at — so the Spanish version was effectively invisible in search.

**Now:** each page has a real Spanish twin at its own URL under `/es/` (`/es/`, `/es/commercial.html`, `/es/sba.html`, `/es/dscr.html`, `/es/contact.html`, `/es/privacy.html`), with its own Spanish `<title>`, meta description, and body HTML. The EN⇄ES toggle in the header still appears for visitors — it now links to the counterpart page instead of swapping text in JavaScript. English and Spanish pages are tied together with `hreflang` annotations so Google serves the right language to the right searcher. This is what unlocks the (much less competitive) Spanish CRE search opportunity.

---

## Applied to every page (EN and ES)

- **Unique title + meta description** per page and per language. Titles are front-loaded with the primary keyword and kept to ~60 characters; descriptions are written to earn the click and kept under ~155 characters.
- **Canonical tag** with a clean absolute URL (`https://stonehavencre.com/...`).
- **hreflang** annotations (`en`, `es`, `x-default`) pairing each page with its translation.
- **Semantic HTML:** exactly one `<h1>` per page, a logical `<h2>/<h3>/<h4>` hierarchy, and `<header>`, `<nav>`, `<main>`, `<footer>` landmarks. Descriptive `alt` text on the logo; decorative SVGs marked `aria-hidden`.
- **JSON-LD structured data:** `FinancialService` (the organisation) on every page; `Service` on each product page; `FAQPage` wrapping the on-page FAQs; `BreadcrumbList` on interior pages; `WebSite` on the home page. All validated as parseable JSON using correct schema.org types.
- **Open Graph + Twitter Card** tags per page, using the Stonehaven logo, so shared links render properly.
- **Consistent NAP** (name, phone, email) in an `<address>` block in every footer.
- **Performance:** fonts preloaded, the footer logo lazy-loaded, real image files added under `/assets/` (logo + favicon) instead of relying only on inline data-URIs, and `width`/`height` on images to reduce layout shift. The site remains static, so it should score very well on Core Web Vitals.
- **Internal linking:** every product page links to the other two with descriptive anchor text (e.g. "DSCR rental property loans," "an SBA 7(a) or 504 loan"), the home page links to all three programs, and the footer links everywhere including the new privacy page.

## New sitewide files

- **`sitemap.xml`** — all 12 URLs, each with its hreflang alternates. Submit this in Google Search Console (see the post-launch checklist).
- **`robots.txt`** — allows crawling and points to the sitemap.
- **`/assets/og-logo.png`** (social/OG image) and **`/assets/mark.png`** (favicon).

---

## Page by page

### Home (`/` and `/es/`)
Primary topic: *commercial real estate loans / lender / property financing (nationwide)*. H1 now leads with the primary keyword. Added an **"About Stonehaven"** section for E-E-A-T (who we are, that we lend in all fifty states, in-house decisions) and descriptive links into all three programs. `WebSite` + `FinancialService` schema.

### Commercial (`/commercial.html` and `/es/`)
Primary topic: *commercial real estate loan / commercial mortgage*. Expanded to ~1,500 words: what the loan is and who it's for, property types, a parameters table, a "how a commercial loan is underwritten" section, use cases, a 4-step "how it works" process, and a **6-question FAQ** (what it is, down payment, terms/rates, property types, timeline, nationwide) feeding `FAQPage` schema. `Service` + `BreadcrumbList` schema.

### SBA (`/sba.html` and `/es/`)
Primary topic: *SBA 7(a) loan / SBA 504 loan / SBA CRE loan / SBA down payment*. ~1,600 words: the difference between 7(a) and 504, eligibility (owner-occupancy thresholds), parameters, use cases, process, and a **6-question FAQ** (7a vs 504, down payment, credit score, uses, buying a building, term length). `Service` + `BreadcrumbList` schema.

### DSCR (`/dscr.html` and `/es/`)
Primary topic: *DSCR loan / DSCR loan requirements / DSCR rental property / no-income-verification*. ~1,500 words including a dedicated **"How DSCR is calculated"** section with a worked (illustrative) example — this targets a very high-volume query and is a featured-snippet candidate. Parameters, use cases, process, and a **6-question FAQ** (what it is, how it's calculated, what DSCR you need, no income verification, eligible properties, portfolio growth). `Service` + `BreadcrumbList` schema.

### Contact (`/contact.html` and `/es/`)
Navigational, as intended. Real `<h1>`, NAP, descriptive links to each program, and the lead form preserved unchanged. `BreadcrumbList` schema.

### Privacy Policy (`/privacy.html` and `/es/`) — NEW
Your lead forms collect personal information, and Google notices the absence of a privacy policy. Added a plain-English policy (what we collect, how we use and share it, security, your choices, contact) in both languages, linked from every footer.

---

## Flagged — please confirm before/after launch

1. **Phone number is still the placeholder `+1 (800) 555-0100`.** It appears, per page, in: the footer NAP block, the contact band, the footer "Contact" column, and the `telephone` field of the `FinancialService` JSON-LD — across all 12 pages. It's set from a single constant in the generator, so it's a one-line change to replace everywhere. **Replace before you promote the site.**
2. **Loan figures are the ranges already on your site** ($1M–$50M+ commercial; up to $5M / 10% down / 25-yr SBA; $100K–$5M+, 1.0x–1.25x DSCR). No new specific rates were invented. Please confirm these ranges match your real programs.
3. **The DSCR worked example** ($60,000 NOI ÷ $48,000 debt service = 1.25x) is explicitly labelled "illustrative." Confirm you're comfortable with it, or swap in your own representative numbers.
4. **Lead forms** still show the graceful thank-you and do not yet POST anywhere — wiring them to the CRM is a separate step (`INTAKE_WEBSITE_MODE=live`).
