# Saved website form relay

The owner has authorized all website inquiry types to be retained in Netlify, emailed through the existing notification hook, and imported into the CRM. This supersedes the earlier Residential/Family exclusion.

## Delivery

Browser forms submit to Netlify Forms. The existing submission-created email hook targets office@stonehavencre.com. The signed Netlify submission-created event forwards the saved lead to the authenticated CRM endpoint. Keep the browser intakeEndpoint empty and FAMILY_CRM_INTAKE_URL and CRM_WEBHOOK_URL unset to preserve this single capture path.

Commercial, SBA and DSCR follow existing CRM intake. Residential, HELOC and Family Opportunity use authenticated saved-inquiry capture: new-stage CRM records, stable submission deduplication, activity notes, audit and internal notifications. The existing Residential underwriting intake remains governed separately. Saved inquiry capture fabricates no disclosure or consent evidence and emits no borrower auto-replies or external automation events.

Dedicated HELOC pages map to Residential / HELOC; Family pages map to Residential / Family Opportunity. FHA and VA pages retain those categories. Generic Residential inquiries stay Residential without guessing a loan program. Cash-out comparison inquiries use the explicit goal when available.

The shared form transport saves structured extra fields alongside the readable description. HELOC requested amount and estimated value populate CRM fields; remaining mortgage balance and all other answers remain in inquiry details. The CRM's existing Residential view is enabled and supports the new category filters.

## Security and operation

The CRM requires the server-only relay key and stable Netlify submission identity. Origin/CAPTCHA handling for direct browser intake remains unchanged. No secret is committed. The event function retries transient failures three times; exhausted failures leave the original inquiry in Netlify and produce a function error. There is no unlimited durable retry queue.

Deploy CRM using an explicit commit based on the running release, because upstream main differs from the live revision. The CRM migration `20261015030000_saved_residential_lead_categories` expands the allowed Residential categories and must finish before Family Opportunity, VA, and Refinance inquiries can be saved. No new environment variable is required. Deploy the website after the CRM is live.

## Validation

14 targeted CRM tests cover authentication, phone-only capture, actual saved-inquiry creation, category mapping, preserved figures, deduplication, editable labels and suppression of borrower outreach. Website tests cover forwarding all product types and structured fields. Live acceptance and deduplication checks use clearly labeled synthetic inquiries only. Historical inquiries are not automatically backfilled.
