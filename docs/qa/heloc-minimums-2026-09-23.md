# HELOC inquiry minimums

Owner instruction, September 23, 2026: accept HELOC inquiries only for requested lines of at least $50,000 and estimated credit scores of at least 640.

## Coverage

- All 41 published HELOC and HELOC comparison forms, including English and Spanish pages, persona landing pages and the instant/wizard flows.
- Required credit bands end at 659-640. Lower bands and unknown-credit submission options are removed. The cash-out comparison uses a conditional numeric 640-850 credit field.
- Browser validation, wizard steps, saved-estimate eligibility, Netlify Forms capture guard, conversion endpoint and CRM relay enforce both minimums. Malformed or conflicting score aliases cannot bypass validation.
- HELOC generators retain the new limits. Other mortgage products retain their existing credit choices. Educational examples of drawn balances, repayments and historic borrower facts are not rewritten as new loan minimums.
- Current HELOC minimum statements in bilingual articles and retained briefs updated. Spanish HELOC submission button matches follow-up by text.
- Unfinished direct-client application work remains in its separate application branch and is not part of this release.

## Verification before preview

- All 144 site checks passed, including boundary, missing-input, forged-payload and shared transport tests. Static checks cover all 41 forms.
- Fourteen generators replayed without drift; SEO checks covered 436 HTML pages and 374 sitemap URLs.
- Browser checks: $49,999.99 rejected; $50,000 accepted by amount validation; score 639 invalid and 640 valid; changing away from the HELOC comparison disables its additional fields.
- Mobile Spanish form and wizard checked at 390 pixels. No horizontal overflow. Wizard refuses $49,999 and advances at $50,000. No real customer data or accepted test lead was submitted.

Release verification is retained privately after checking the deployed commit and live form guards.
