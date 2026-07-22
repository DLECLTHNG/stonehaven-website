# DSCR SEO implementation — audit and plan (2026-07-22)

## Current-state matrix (rechecked against live + repo this run)

| Item | Live state | Repo state | Evidence | Risk | Decision |
|---|---|---|---|---|---|
| URL duplication | /dscr and /dscr.html both 200, same ETag | All internal links/canonicals/hreflang/sitemap use .html; Netlify pretty-URLs serves extensionless | curl HEAD both = 200, etag 91844c9d… | Split crawl signals | P0: extensionless canonical convention; _redirects .html→clean; rewrite all signals |
| Analyzer claims | Proof strip: "No tax returns", "Asset-based underwriting" | same | live grep | Compliance (unsubstantiated absolutes) | Replace with property-first qualified chips (EN+ES) |
| FAQPage schema | Present on 6 pages | same | repo grep | Retired Google feature; maintenance burden | Remove FAQPage JSON-LD sitewide; keep visible FAQs |
| Heading hierarchy | dscr.html h2→h4 jumps (27 h4) | same | repo grep | a11y/semantics | Card h4→h3 sitewide + CSS selector update |
| /dscr metadata/H1 | Title ok-ish; H1 positioning-led | same | live | Weak head-term ownership | Adopt brief title/H1; old headline → subheading; retire hero A/B (arms now identical intent) |
| Direct answer | none | none | — | AI/snippet ownership | Add answer block + formula card + TOC (EN; ES frozen this run) |
| Calculator intent | /dscr-analyzer titled "size up" | same | live | Doesn't own "DSCR loan calculator" | Retitle; add target-DSCR / rent-needed / max-P&I / max-loan outputs via js/dscr-calc.js + node fixtures |
| /dscr-review | substantive interactive page | same | — | n/a | State A: keep indexable (calculator + prepay + multistep = unique value) |
| Trust layer | No author/reviewer/entity/licensing | same | — | YMYL trust; guides blocked | Sentinel owner-checklist (non-public docs/), build guard, publish calculation-methodology (code-fact page); /about,/team,/licensing blocked |
| Hero br collision | mobile: br hidden with no space → "worksbefore" class of bugs | my earlier <br> pass | brief §3 + code read | Visual/typo on mobile | Add space before every hero <br> |
| es/dscr metadata | Title 93 chars incl. tag; desc ~210 | same | repo | truncation | Shorten (technical fix, copy-preserving) |
| Spanish content parity | ES lacks EN's newer additions | — | — | Frozen per brief | Technical fixes only this run |
| Resource hub + guides | none | none | — | Requires named author+reviewer (owner facts) | BLOCKED for publication; recorded in owner checklist; no drafts/routes/links |

## Plan
- **P0a** `_redirects` (.html→clean, index→dir), netlify.toml sentinel+docs guard, sitemap/canonical/hreflang/OG/JSON-LD/internal-link rewrite to clean URLs, funnel.js POST + thanks targets to clean paths, site-monitor updated with redirect assertions.
- **P0b** Trust scaffolding: docs/owner-facts-required.md (sentinels, non-public), build guard, /calculation-methodology page (code-fact content, team-accountable, correction path).
- **P1a** /dscr: metadata/H1/subheading, direct answer + formula card + TOC, FAQPage removal (sitewide), h4→h3.
- **P1b** /dscr-analyzer: calculator intent metadata, claim chips replaced, target-DSCR/rent-needed/max-sizing outputs (js/dscr-calc.js), methodology link, BreadcrumbList JSON-LD, node test fixtures.
- **P1c** ES technical: metadata shorten, chips, clean URLs (sweep), no content translation.
- **Backlog (owner-blocked):** /resources/dscr hub, guides A–C and D–R, /about, /team, /licensing-and-availability, DSCR OG image (design asset), Spanish parity content.

## Intent-migration note
Hub/guides unpublished ⇒ no pillar content is moved off /dscr this run; the 22 FAQs and all sections stay on the pillar as canonical intent owner. Migration map to be executed when guides unblock.
