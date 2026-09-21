# Lead contact validation and HELOC minimum

User request: every submitted lead must have a name and email; HELOC inquiries must request at least $30,000.

## Changes

- Required name fields added to the ten calculator forms that previously collected only email and optional phone.
- All 120 static inquiry forms now collect required name and email. The dynamic HELOC save-estimate popup collects both too.
- Shared browser submission validation rejects absent fields, whitespace-only names and malformed emails. It no longer substitutes an email address for a missing name. Invalid attempts do not fire lead conversions.
- Family Opportunity email is required in the browser and its server endpoint. Its requested-contact notice now reflects the required email and has an updated notice version. Sensitive Family navigation and advertising behavior remains unchanged.
- A POST-only Netlify Edge Function validates lead form bodies before Forms capture. Valid requests continue unchanged to Netlify, preserving email alerts and the existing CRM relay. CAPI and the saved-submission relay also reject incomplete or below-minimum leads.
- The $30,000 HELOC floor applies to all 41 HELOC intake/comparison pages, both wizard variants, the save-estimate popup and direct server submissions. Zero mortgage balances remain valid. Other loan programs retain their existing rules.
- English and Spanish labels show the minimum; the instant landing page no longer advertises $5,000 loans. Below-minimum wizard equity estimates no longer appear as available HELOC ranges. Educational equity calculations retain their mathematical results.
- Shared asset version updates prevent previously cached form scripts from remaining in use after deployment.

## Verification

- Full site gate: 122 tests passed, Family/DSCR/HELOC/Spanish lint passed, 414 HTML pages and 352 sitemap URLs checked.
- Regression cases: absent/blank contact fields, invalid emails, missing amounts, $29,999.99 rejected, $30,000 accepted, paid-off homes, multipart submissions, duplicate fields, malformed context, oversized bodies, and untouched valid request bodies.
- Browser: wizard blocks $29,999 and advances at $30,000. Save-estimate popup and calculator show accessible missing-contact errors.
- Responsive form checks: 17 changed form routes at 1440px and 390px, 34 layouts total, no horizontal overflow or clipped fields. Desktop and mobile screenshots reviewed for the added calculator and popup fields; buttons remain centered.
- No valid production test leads or borrower messages sent.

Release checks must verify the Edge Function's deployed rejection response before merging and confirm the same guard and updated assets on production.
