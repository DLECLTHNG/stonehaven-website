# HELOC growth release

Built September 12, 2026 from the HELOC angle research and the owner's instruction to implement the complete package.

## Scope

- 24 English articles and 24 Spanish translations, with source links, retained briefs, contextual landing-page links and planning-tool links.
- Improved contractor-quotes, one-payment and self-employed-homeowners pages in English; added Spanish counterparts.
- Added compare-offers, paid-off-home and repayment-review pages in both languages.
- Added bilingual offer comparison worksheet, monthly payment and total-cost model, and project draw planner at /heloc-planning-tools.
- Added a HELOC article library to both service hubs. Articles and tool pages are indexable. Short conversion pages remain noindex and outside the sitemap.

## Owner confirmations

The owner confirmed first-lien HELOCs on paid-off homes, refinancing of existing HELOCs, bank-statement HELOCs and Florida residential availability in this task. No specific rate, credit floor, statement period, loan limit, fee or investor HELOC eligibility was inferred.

## Delivery and privacy

New landing pages reuse the existing heloc-callback Residential form contract. Hidden growth_topic, goal and lp_variant fields identify the inquiry; existing pages retain their approved form identities and gain growth_topic. Core figures remain required; a zero mortgage balance is valid. New forms require a service-state choice. The existing Netlify saved-submission relay, email notification configuration and CRM type routing are preserved.

The planning tools load no analytics or advertising scripts. Inputs remain in page memory, are not persisted and are not added to URLs. Printing is initiated by the visitor. No borrower outreach was sent during validation. The existing daily Family publication automation was not changed.

## Model assumptions

Monthly accrual, one initial advance, no additional draws or payments, one optional rate change and an interest-only draw period followed by amortization. Existing debt is modeled as a fixed-rate amortizing loan, not credit-card minimums. Fees are either upfront or financed. Horizon results include remaining debt and reconcile total payments plus balance plus upfront fees. Actual lender contracts can differ.

## Maintenance and validation

Run scripts/build-heloc-growth.py after the existing generators, as configured in CI. Article source briefs live in docs/blog-briefs. The article manifest is articles.json in this directory.

Validation includes calculation fixtures, all 41 HELOC intake surfaces, bilingual content and privacy checks, full site link/SEO checks, generator reproducibility and Chrome checks with intercepted submissions. No live test leads were submitted. Browser coverage includes 320, 390 and 1440 pixel tool layouts and all 12 landing-page language variants.

Search ranking and lead quality must be measured after indexing; publishing this package does not establish either outcome. External backlink outreach and paid campaigns require their own execution and were not sent or launched by this release.
