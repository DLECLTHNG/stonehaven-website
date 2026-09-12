# Stonehaven Google Search campaign draft

Prepared September 12, 2026. Local draft only. No campaigns have been created in Google Ads, enabled, or funded. Machine-readable creative and keyword specifications are in SEARCH-CAMPAIGNS.json. This is a planning schema, not a file to import blindly into Google Ads Editor.

## Proposed first test

Two Search campaigns: Georgia HELOC and Georgia DSCR, with separate reporting. Georgia is a proposed starting geography based on Stonehaven's location and published services; verify current eligibility before launch. English creative initially. Spanish creative is a subsequent separate test when staffed response capacity and keyword forecasts are established.

- Initial proposal: $25 average daily budget per campaign, $50 combined. Budget is not approved. Google can spend more than the average on an individual day; this is not a $50 daily hard cap. With unchanged budgets, Google's usual monthly charging limit is 30.4 times the average daily budget, or $1,520 combined. Check the actual campaign budget controls before enabling.
- Google Search only initially; turn off Display expansion and initially exclude search partners for easier diagnosis.
- Geographic presence setting: people in or regularly in the selected eligible locations. Do not rely on location interest alone. Screen property state in the inquiry flow.
- Start with phrase and exact keywords. Review actual search terms frequently during the initial test. No broad national campaign or automated expansion at launch.
- All permitted demographic categories remain enabled. Do not target or exclude by age, gender, parental status, marital status, or ZIP code. No sensitive borrower-status audience or Family Opportunity retargeting.
- Ad schedule: staffed callback hours after owner verification, using the account's verified time zone. No invented hours.
- Bidding: choose only after Keyword Planner forecasts and conversion-history review. Do not invent a target CPA from absent data. If conversion history is insufficient, use a controlled traffic test with an explicit CPC ceiling derived from forecasts and economics, then reassess after reliable conversion data accumulates.

## Conversion setup before activation

The new site event `generate_lead` fires after accepted inquiry storage. It has no dollar value attached. Mark/import this one inquiry goal after testing in the correct GA4 and Google Ads accounts. Do not also count the legacy lead, quote_request, heloc_callback, inquiry_submitted, and form_submit_succeeded events as additional primary conversions for the same submission. Phone clicks are secondary interactions, not proof of a connected call. Configure actual qualified-call measurement separately if needed.

Existing campaign UTM fields and gclid are stored with inquiries. The CRM fix maps those fields into its attribution ledger. Qualified/application/funded definitions, offline imports, consent requirements, and account linkage still need implementation in the actual Google account. Do not assume browser telemetry equals a funded borrower, and never send loan balances, credit scores, or free-text scenario notes as analytics event parameters.

Before bids optimize for qualified leads, define qualification as a real contacted borrower with a financeable product/state scenario confirmed by the team. Exclude spam, duplicates, wrong numbers, and internal tests. Use actual funded contribution economics to determine a sustainable acquisition ceiling.

## Readout and stop rules

Review daily delivery and routing during the first week, then compare weekly by campaign and landing page: spend, clicks, accepted inquiries, contact rate, qualified inquiries, appointments, applications, and funded loans. Stop a campaign immediately if its form breaks, classification fails, or it advertises an unavailable product/state. Pause irrelevant search terms when identified. Set an account-specific spend checkpoint before launch; no arbitrary promise that a particular spend will produce a loan.

Before increasing spend, calculate: cost per qualified inquiry = spend / qualified inquiries; cost per funded loan = spend / funded loans. Zero outcomes means the ratio is undefined, not zero. Allow time for cohorts to mature before judging funded-loan results.

Sources: [Google consumer finance targeting](https://support.google.com/adspolicy/answer/16700846?hl=en), [Financial products disclosures](https://support.google.com/adspolicy/answer/2464998?hl=en), [Qualified and converted leads](https://support.google.com/google-ads/answer/11459091?hl=en), [Google average daily budgets](https://support.google.com/google-ads/answer/6385083?hl=en).
