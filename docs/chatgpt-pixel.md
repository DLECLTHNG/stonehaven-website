# ChatGPT Ads pixel

Installed September 13, 2026, pixel `Borm2tgLusLoFUMCjgiriD`.

Conversion: `oaiq("measure", "lead_created", {type: "customer_action"}, {event_id: id})`. This runs only after an accepted lead submission, not on clicks, validation failures, delivery failures, bot honeypots, calculator activity or a confirmation-page visit. Family inquiries also require a stored inquiry ID and must not be dry runs. Event IDs prevent duplicate dispatch within the page.

`js/site-config.js` loads the isolated `js/chatgpt-pixel.js` integration for the regular English/Spanish site. Family templates load it directly. Existing tracker-free family articles, private HELOC planning tools, sensitive adult-child housing pages and the shared confirmation page retain their exclusions. Global Privacy Control disables this pixel. A blocked or failed SDK does not prevent lead delivery. Redirects wait at most one second for loading; ad blockers and network outages can still prevent attribution.

The integration records `page_viewed` separately from `lead_created`. Production debug output is disabled. No form values or financial details are supplied in event properties. The pixel's public remote configuration currently enables automatic advanced matching, which can use hashed contact information. English and Spanish privacy notices disclose that behavior. Manage matching settings in the advertiser account.

SDK verification: inspected the user-supplied official asset https://bzrcdn.openai.com/sdk/oaiq.min.js (version 0.1.41). It accepts `measure`, `lead_created`, `customer_action`, and `event_id`. Its event endpoint is https://bzr.openai.com/v1/sdk/events and its remote configuration comes from https://bzrcdn.openai.com/pixel-config/v1/Borm2tgLusLoFUMCjgiriD.json. CSP allows the SDK script and those two connection origins. No wildcard was added.

Validation: 63 automated tests, including accepted/failed/retried/honeypot submissions, duplicate suppression, queued events and tracking exclusions. An offline VM test of the actual downloaded SDK, with all fetch calls mocked, produced the correct lead event and no validation warnings. No test lead was sent to the live CRM or advertising account.

The advertiser should use the standard Lead / `lead_created` event as the campaign conversion. Installation does not create or launch a paid campaign, and account-side event receipt has not been independently verified in Ads Manager.
