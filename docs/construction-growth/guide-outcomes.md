# Which construction guide brings in qualified projects?

The owned-land guide links to its editable construction budget. The lot-release guide links from the sale worksheet to a project review. Each path adds one public source label to the existing construction intake. The Netlify relay preserves that label in the Commercial lead’s CRM intake data. English and Spanish use the same labels. Untagged visits appear as unattributed. If JavaScript or privacy settings suppress attribution, the report can still count the construction inquiry when the relay identifies its form.

## Record a decision

Use Stonehaven’s existing qualification definition: a team member has reviewed a real borrower’s product and state and confirmed the scenario is potentially financeable. On the CRM lead, add an internal activity note containing exactly **Construction qualified**, **Construction not qualified** or **Construction spam/test**. Put supporting case details in a separate note. To correct a decision, add a new decision note. The report uses the latest staff-authored decision. Form submissions, page edits and underwriting stages cannot set it.

## Compare the guides

From the website checkout, run the following with an authorized read-only CRM database connection in the normal PostgreSQL client environment. Replace the sample dates with the acquisition period. Keep the resulting counts in the private search review folder.

```sh
psql -X -v ON_ERROR_STOP=1 -v start=2026-11-24 -v stop=2026-12-22 -f scripts/reports/construction-guide-outcomes.sql
```

The first Eastern date is included and the second is excluded. Each CRM lead counts once under its saved originating construction form. Repeat deliveries deduplicated by the CRM do not earn a second credit. Identifiable QA, example-domain addresses and staff-marked spam/test records are excluded. The report includes leads awaiting a decision so recently acquired cohorts can be revisited as they mature. Tracking starts with deployment. Old leads without the construction form identifier cannot be reconstructed reliably.

The source describes a tagged guide journey. A shared link may retain its label. It does not establish a search query, an advertising channel or which visit caused the borrower to qualify. For site engagement, the existing inquiry-start and accepted generate_lead analytics events can carry the same two guide labels where permitted. Only the private CRM report counts qualified outcomes. No borrower identifiers or worksheet figures are needed in analytics.
