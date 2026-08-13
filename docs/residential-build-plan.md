# Residential Build Plan — Stonehaven Lending
**Drafted 2026-08-10 · Status: PLAN (nothing in this doc is live)**

CRE remains the flagship; residential becomes a full, first-class second
desk. This plan defines positioning, architecture, SEO/LLM strategy,
calculators, funnel wiring, and a phased rollout with hard gates — so
each phase can be implemented in one sitting against this spec.

---

## 1. Positioning & brand architecture

**The frame:** one firm, two desks, one discipline. Residential is not a
pivot — it's the same operations-first story told to a homeowner. The
narrative asset is Dawn: 20+ years running conventional/FHA/VA
operations, processing, and post-closing QC. Nobody else's mortgage
page can say "the person behind your file ran lender operations for two
decades." That is the wedge for both Google (E-E-A-T) and LLM answers
(attributable expertise).

**Hierarchy rules:**
- Homepage stays CRE-led ("Buy, finance, refinance, or sell"). The
  existing "Buy" pillar gains a residential path; CRE CTAs keep top
  billing.
- The domain stays stonehavencre.com. No subdomain, no second site —
  authority concentrates; the "cre" in the domain is a non-issue (it
  reads as the brand, and rankings come from content, not domain
  spelling).
- Nav becomes: Commercial · SBA · DSCR · **Residential** · About Us ·
  Contact (six items fits desktop; hamburger unaffected).
- The investor/owner-occupant seam is load-bearing: DSCR pages own
  "rental property"; residential pages own "the home you live in."
  Every residential page cross-links the DSCR desk for investors and
  vice versa — this disambiguation is itself an SEO/LLM asset (it's a
  question people actually ask).

## 2. Phase 0 — the compliance gate (BLOCKS ALL PUBLIC LAUNCH)

Residential is consumer lending. Different rulebook than CRE:

1. **State scope (owner fact, REQUIRED):** which states can Stonehaven
   arrange residential loans in today? Likely Georgia first. Whatever
   the answer, residential pages must state it plainly ("Residential
   programs currently available in Georgia" or a listed set) — the CRE
   "nationwide" claim must NOT bleed onto residential pages.
2. **Role wording (owner fact, REQUIRED):** broker vs correspondent for
   residential. The sitewide disclosure says "not a direct lender;
   arranged through third-party capital providers." If the residential
   operation will be correspondent (Dawn's background), counsel must
   approve updated wording before launch. Until then, the advisory
   wording stands.
3. **Advertising rules:** Reg Z trigger terms — stating a rate, payment
   amount, or specific terms triggers mandatory APR disclosures. Our
   standing no-rates policy sidesteps this entirely; it is now a legal
   shield, not just a freshness policy. Keep it absolute on residential.
4. **Standing items:** EHO (already sitewide), NMLS display (already
   sitewide), GLBA privacy handling for consumer leads (never to ad
   platforms — consistent with the Advanced Matching decline), counsel
   review of the residential disclosure block.
5. **Sentinel additions:** extend the build gate with residential
   banned phrases: "guaranteed approval", "lowest rate", "pre-approved"
   (as a promise), "everyone qualifies".

## 3. Information architecture & URL map

**Launch surface (Phases 1–2):**
```
/residential                      hub (exists as hidden draft; polish + launch)
/residential/buy                  purchase: conventional + gov't-backed paths
/residential/refinance            rate/term + cash-out, break-even framing
/residential/fha                  FHA program page (Dawn's core expertise)
/residential/va                   VA program page
/mortgage-calculator              PITI payment calculator (root-level, high intent)
/refinance-calculator             break-even calculator (root-level)
```

**Content layer (Phase 3):**
```
/resources/residential            residential resource hub
/resources/fha-vs-conventional    guide (highest-value disambiguation)
/resources/how-much-home          affordability & DTI, explained honestly
/resources/refinance-break-even   the math that decides a refi
/resources/first-time-buyer-checklist   documents + process, ops-veteran style
/resources/dscr-vs-conventional   investor seam guide (links both desks)
/residential/georgia              ONE honest local page (Georgia expertise,
                                  Alpharetta office, Dawn's GA regulatory
                                  background) — not a doorway-page farm
```

**Later (Phase 4):** `/es/residential` mirror (native-Spanish reviewer
gate stands), additional state pages ONLY as real licensing lands.

URL conventions as house standard: clean extensionless URLs, `.html`
→ clean 301! rules, canonical + og on every page, breadcrumbs schema on
sub-pages.

## 4. Page-by-page specs (pattern per page)

Every page follows the proven house anatomy:
- **Title/meta:** intent-matched, ≤60 chars, no superlatives.
- **H1 + hero:** two-line Cormorant pattern, role-accurate copy.
- **Answer-first block** (`id="answer"`): 2–4 sentence direct answer an
  LLM can lift verbatim, with the entity name in it.
- **Path cards** (use-grid) above the fold where the page branches.
- **Prose sections** with eyebrow labels; TOC anchors on long pages.
- **Process section** reframed for residential (Conversation →
  Qualification → Processing → Closing; lender underwrites/funds).
- **Lead form**: `data-sh-form` per page, `data-sh-product="Residential"`,
  consent microcopy, honeypot, POST baseline — identical plumbing.
- **Compliance footer:** standard disclosure + residential state-scope
  line + EHO + NMLS + Consumer Access link.

Key content notes:
- `/residential/fha` and `/va`: public program facts are usable with
  qualification (e.g., FHA 3.5% down for qualifying credit profiles; VA
  0-down for eligible veterans — same precedent as SBA's 10/15/20
  matrix). No rates, no MIP/funding-fee tables that go stale — describe
  mechanics, not numbers that move.
- `/residential/buy` H1 direction: "The home loan, handled with
  discipline." (hero already drafted). `/refinance` leads with the
  break-even question, not savings hype.
- Byline: residential guides carry **Dawn M. Muñoz · Stonehaven
  Lending** (Person schema links to /management). CRE guides keep
  Christiaan/Chris byline. Author-to-desk match is deliberate E-E-A-T.

## 5. Calculators — deterministic math (LLM never computes)

New module `js/residential-calc.js` (`SH_RES`) + `tests/residential-math.test.mjs`:

1. **PITI payment** (for /mortgage-calculator): P&I amortization (shared
   formula), + taxes/12 + insurance/12 + HOA + optional
   mortgage-insurance line as a USER-ENTERED annual % of loan (never a
   pre-filled MI rate). Outputs: P&I, TI, MI, total PITI.
2. **Affordability** (same page, second view): from gross income +
   debts, front/back DTI sliders (defaults 28/36 labeled "a common
   convention — programs vary"), inverts to max PITI → max price at
   user's rate/term/down%.
3. **Refinance break-even** (for /refinance-calculator): closing costs ÷
   monthly savings = break-even months; judged against user-entered
   expected years in the home. Verdict language mirrors the commercial
   calculator's binding-constraint honesty ("you break even in year 6 —
   worthless if you sell in year 3").

All fixtures precomputed and asserted; formulas documented on
/calculation-methodology; rates always user estimates; "illustrative,
not an approval/quote" fine print; calc_used events fire per page.

## 6. Google SEO plan

**Where we can actually win:** not "mortgage calculator" head terms
(domain-authority bloodbath) — but:
1. **Decision/disambiguation long-tail:** "FHA vs conventional first
   time buyer", "refinance break even how long", "DSCR vs conventional
   for rental" — matches our guide format exactly, lower competition,
   high intent.
2. **Georgia local:** "mortgage broker Alpharetta GA", "Georgia FHA
   loan help" — backed by a real office (NAP consistent sitewide), a
   real Georgia-credentialed operator (Dawn's bio literally lists
   Georgia Regulations and Compliance training), and the Google
   Business Profile (owner action, below). One honest local page +
   GBP + consistent NAP is a defensible local play.
3. **Internal authority transfer:** the CRE/DSCR side already has
   indexed authority; a dense, natural internal-link mesh (homepage →
   /residential; DSCR ↔ residential seam guides; footer Residential
   links sitewide) hands the new section its head start.

**Mechanics checklist per launch:** sitemap entries with real lastmod;
resubmit sitemap + URL-inspection requests for the new pages; titles
audited ≤60 chars; every page indexed EXCEPT conversion-only pages
(none planned for residential at launch); og-images; breadcrumb schema;
Search Console monitoring of query impressions as the success metric.

**Owner action unlocked by this plan:** create the **Google Business
Profile** for the Alpharetta office (postcard verification) — category
"Mortgage broker" — it's the single biggest local-SEO lever and now has
a residential offering to point at.

## 7. LLM-search plan

1. **llms.txt:** add a Residential section (page map + one-line
   descriptions) and update the entity summary to "commercial AND
   residential, two desks, one firm" with the state-scope fact.
2. **Answer-first blocks everywhere:** every residential page opens
   with an extractable 2–4 sentence answer containing "Stonehaven
   Lending" (entity-attribution bait for AI answers).
3. **Entity graph:** Organization schema already carries NMLS +
   PostalAddress; add residential serviceTypes; keep Person schema for
   Dawn (author) linked from guides → /management. Add `areaServed` for
   residential distinctly (the licensed states) vs CRE (US).
4. **Definition-shaped content:** guides written so each H2 section is
   a liftable Q→A unit ("What is the FHA down payment? ..."), plain-
   language, no marketing fluff mid-answer — LLMs quote clean prose.
5. **Methodology transparency:** calculators documented on
   /calculation-methodology — cited tools are ones whose math is
   inspectable.
6. **Freshness signals:** Article dateModified maintained; sitemap
   lastmod from real edit dates (house standard).
7. **Robots:** AI-crawler allow groups already in place — no change.

## 8. Funnel, data & CRM

- **Product taxonomy:** "Residential" joins Commercial/SBA/DSCR/Not
  sure. /book select gains a Residential option; `?product=Residential`
  allowlisted in the preselect script + funnel.js unchanged (generic
  sync already handles it).
- **Page values for CRM contract:** add `residential`,
  `residential-buy`, `residential-refinance`, `residential-fha`,
  `residential-va`, `mortgage-calculator`, `refinance-calculator` to
  WEBSITE_PAGE_VALUES when the CRM intake connects.
- **Thanks flow:** launch on /thanks-quote; add /thanks-residential in
  Phase 3 for ad-conversion segmentation.
- **Analytics:** zero new wiring needed — Meta Pixel + GA4 inherit
  (calc_used → ViewContent, lead → Lead). Mark GA4 key events once
  firing.
- **Consumer-data guardrail:** residential leads are consumer PII under
  GLBA expectations — never into ad platforms (no Advanced Matching, no
  customer-list uploads without counsel), CRM handling per the CRM's
  existing encryption/retention design.
- **Monitoring:** site-monitor adds the new routes; sentinel gate
  extended (Section 2.5).

## 9. Phased rollout (each phase = one implementable sitting)

| Phase | Contents | Gate to start | Gate to ship |
|---|---|---|---|
| **0** | Owner/counsel: state list, role wording, disclosure text, GBP kickoff | — | Owner answers in hand |
| **1** | Launch /residential hub (polish draft w/ Phase-0 facts), nav "Residential" tab sitewide, footer links, homepage Buy-pillar link, /book Residential option, sitemap/llms/monitor/301s, sentinel additions | Phase 0 complete | Full QA battery + push authorization |
| **2** | /residential/{buy,refinance,fha,va}, /mortgage-calculator + /refinance-calculator (SH_RES + fixtures), methodology sections, DSCR↔residential cross-links | Phase 1 live | Fixtures green + QA + authorization |
| **3** | /resources/residential + 5 guides (Dawn byline), /residential/georgia, /thanks-residential, GSC resubmission + indexing requests | Phase 2 live; Dawn confirms byline | QA + authorization |
| **4** | /es/residential mirror; residential ad enablement (EHO in creative, Special Ad Category, landing QA); CAPI when spend is real | Native-ES reviewer; ad budget decision | Counsel ad-copy check |

QA battery per phase (house standard): node fixture suites, internal
link audit (zero broken), sentinel union scan, .html→clean one-hop
redirect check, local dev-server crawl, browser verification of
calculators/forms/product-state, monitor green post-deploy.

## 10. Guardrails (unchanged, now with teeth for consumer lending)

- No rates, ever, anywhere — now also a Reg Z shield.
- No invented program facts; public program mechanics only, qualified.
- Role wording per counsel; "nationwide" never on residential pages
  until licensing supports it.
- No fake urgency, no "guaranteed", no unqualified "as little as".
- Every claim on a page Dawn or Chris would sign under their byline.

## 11. Success metrics (90 days post-Phase-3)

- GSC: residential-query impressions + clicks (target: nonzero → trend).
- GA4: `calc_used` on the two new calculators; `lead` events with
  product=Residential; Georgia-geo share of residential traffic.
- Meta: ViewContent volume from residential pages (pixel warming for a
  future residential campaign — EHO + Special Ad Category ready).
- Lead mix report: Residential vs CRE inquiry counts and quality notes
  from the founders' own follow-up calls.

## 12. Open owner decisions (Phase 0 inputs)

1. **States:** Georgia only at launch, or a list? (Determines the
   scope line on every residential page + areaServed schema.)
2. **Role:** broker (current sitewide wording works) or correspondent
   (needs counsel-approved new wording)?
3. **Byline confirm:** Dawn as residential author (name + firm only,
   as with Chris's byline standard)?
4. **Nav label:** "Residential" (recommended) vs "Home Loans"?
