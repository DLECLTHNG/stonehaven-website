# Stonehaven growth launch pack

Prepared September 12, 2026.

Release status: CRM attribution fix is live at commit d8d85a558c50e4be368b873619e8bbe98871ad53. Website changes are on codex/growth-launch and await production publication approval. Automatic approval review rejected a direct main-branch push because of the number of affected files. Most website changes only refresh the shared script cache version.

## Completed work

- Reviewed website form measurement and the CRM intake attribution path.
- Added one GA4 `generate_lead` event after accepted inquiry storage across the main funnel and the existing analytics-enabled Family flow. Existing Family privacy switches stay in force. No analytics is enabled on a previously excluded page.
- Added secondary phone-click measurement to the main funnel. A click is not a completed call.
- Prevented repeat form submission while delivery is pending. Failed delivery remains retryable and does not record a successful conversion.
- Fixed the CRM website sanitizer to retain utm_medium, utm_term, and utm_id. Mapped sanitized campaign fields and gclid into the top-level attribution fields consumed by the CRM ledger. Existing inquiry details remain intact.
- Improved the English HELOC title and introduction, and added clear inquiry preparation and next-step content to English/Spanish HELOC and DSCR pages.
- Prepared [two Search campaign specifications](SEARCH-CAMPAIGNS.md), [creative and keywords](SEARCH-CAMPAIGNS.json), [20 partnership prospects](PARTNERSHIP-PROSPECTS.md), and [Business Profile copy](GOOGLE-PROFILE-PACK.md).

## Account audit and remaining dependencies

| Item | Observed status | Next action |
|---|---|---|
| Netlify, office email, CRM lead delivery | Existing delivery path preserved | Continue monitoring existing submissions; do not count internal tests as marketing leads |
| Website GA4 identifier | G-69X0CPMGJP in site configuration | Verify the matching property in the owner's Google account |
| Search Console | Current browser account showed the welcome page and no property | Chris identifies/signs into the account that manages Stonehaven |
| Analytics reports and conversion setup | Correct account not yet established | Review 90 days of acquisition/landing-page data, compare previous 90 days, and test the new event |
| Google Business Profile | Ownership and existing profile not verified | Audit the existing profile using prepared copy; do not create a duplicate |
| Google Ads | No account changes or spending | Confirm account, forecasts, conversion mapping, actual staffed hours, and approved budget |
| Offline qualified/funded conversion imports | Not enabled by this work | Map actual CRM outcomes to Google after account/consent review |
| Partnerships | 20 sourced prospects prepared | Authorize specific outreach before sending messages; no memberships purchased |

An account-access question was sent during the work. Do not treat absence of the property in the current browser account as proof that Stonehaven lacks Search Console or Analytics.

## Measurement definitions

- Inquiry: accepted form delivery, represented by generate_lead for analytics-enabled flows.
- Contacted: an actual two-way interaction recorded by the team, not a phone-link click.
- Qualified: a real borrower with a product/state scenario confirmed as potentially financeable by the team. Internal tests and spam excluded.
- Application: actual application milestone in the CRM, not a website visit or initial inquiry.
- Funded: actual funding confirmed in the CRM, with funding date and attributable campaign.

Track weekly by product, campaign, and landing page. Compute inquiry conversion rate from qualified sessions and accepted inquiries, contact rate, qualification rate, application rate, and cost per funded loan. Avoid treating sparse or immature cohorts as reliable return estimates. Analytics can undercount due to blockers and consent choices; Netlify/CRM are the storage evidence.

The existing legacy form events remain for compatibility. Only one inquiry conversion should become primary in Ads; do not sum all success-event names. No borrower dollar amounts, contact fields, or free-text descriptions were added to analytics parameters.

## Next 30 days once account access is available

1. Week 1: establish the actual baseline; audit indexed pages, query impressions/clicks and landing-page outcomes; complete the Business Profile audit; test GA4 key-event and Ads linkage; approve campaign economics and budgets.
2. Week 2: launch only the approved small Search test after verification. Start conversations with the five prioritized organizations once outreach is explicitly authorized. Log responses and actual costs.
3. Week 3: review search terms and qualified-inquiry outcomes. Improve pages with real impressions and weak conversion. Gather owner-approved real case facts before publishing case studies. Record two short English/Spanish explanations if the team is available.
4. Week 4: compare costs and mature outcomes. Continue, revise, or pause based on qualified inquiries and applications. Increase budget only with evidence and owner authorization.

No future check-ins have been scheduled by this task. This is an execution plan, not an active monitor or an assurance of ranking gains.

## Validation

The website check suite passed 45 checks, including three new behavioral tests for conversion timing, failed-delivery retry, duplicate-click prevention, attribution payload retention, and honeypot exclusion. The CRM relay suite passed 16 tests, including campaign-field preservation in both Residential and DSCR, rejection of unapproved attribution keys, and existing no-auto-reply behavior. The CRM production build and changed-file lint passed. Mobile/desktop checks cover the four edited English and Spanish product pages.

Sources for campaign and partnership recommendations are linked in their individual files. [GA4 recommended events](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead).
