# Land-development financing page

Built at the owner's request after reviewing https://www.firstcontinental.com/financing/ as a topic reference. Stonehaven's pages use original prose and the existing Stonehaven design. No competitor logos, photographs, testimonials, decision times, leverage limits or guarantee terms are represented as Stonehaven terms.

## Published routes

- English: /commercial/land-development-loans
- Spanish: /es/commercial/land-development-loans

The retained bilingual content is in docs/cre-financing/service-pages.json and is rendered by scripts/build-cre-financing.py. Content covers land acquisition and development, subdivision infrastructure, finished-lot inventory, financing comparison questions, a hypothetical 40-lot project, the placement process, preparation materials and FAQs. Recourse terms remain subject to the actual lender and project. Homeowner construction inquiries are directed to the residential route.

The worked example separates $4.8 million of modeled costs, a $3.36 million requested commitment, $1.44 million of remaining project funding and $7 million of hypothetical gross lot sales. It does not present gross sales as an appraisal or profit. The 70% figure is example arithmetic, not a program cap. No loan-size band is imposed.

## Lead flow and discovery

The inquiry uses the existing lead form, Commercial product classification and commercial-land-development-loans page identifier. Required name and email, the existing capture guard, Netlify notifications and the CRM relay remain in use. Project information includes cost, requested financing, value, type, ownership, closing timeline, lot count, stage, builder contracts and exit plan. No documents are uploaded through the public form. Text follow-up is the stated next step.

Both pages have canonical and reciprocal language links, WebPage/Service/Breadcrumb structured data, sitemap entries, relevant CRE internal links and maintained AI-discovery entries. The homepage content is unchanged. The Spanish page labels the English-only loan-sizing resource explicitly.

## Verification

- Full site gate: 123 tests passed, all content linters passed, 416 pages and 354 sitemap URLs checked.
- New submission regression covers both languages, Commercial classification, project fields, private attribution, Netlify capture format and exclusion of financial/contact details from analytics.
- Browser checks at 1440, 768, 390 and 320 pixels for both languages: no horizontal overflow or escaped form controls; one H1 and one inquiry form; submit buttons centered to within one pixel.
- Reviewed desktop and mobile screenshots. Expanded FAQ content works, mobile inputs use 16px text, and an incomplete form keeps focus on the required email field instead of submitting.
- No real or valid production test lead submitted, and no borrower messages sent.
