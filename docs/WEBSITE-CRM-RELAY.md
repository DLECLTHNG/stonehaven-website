# Saved website form relay

Prepared September 12, 2026. Not activated in production.

## Delivery

The browser continues to submit to Netlify Forms. Netlify saves the inquiry and sends the existing new-lead email. Its reserved `submission-created` event function forwards the saved record to the CRM over HTTPS with a server-only credential. Netlify validates platform event signatures before invoking event functions: https://docs.netlify.com/build/functions/trigger-on-events/

The handler forwards only the `lead` form, skips honeypots, and requires a stable Netlify submission ID. It retries temporary failures up to three times. A response is accepted only when the CRM reports `created` or `duplicate` with a lead ID. Exhausted failures raise a function error containing the Netlify submission ID, without contact details or credentials. The original record stays in Netlify Forms. This is not an unlimited durable retry queue; failed records require replay from the saved inbox.

The CRM verifies the shared key in constant time. Its server-only relay switch, request size limit, validation, rate limits and Residential admission checks remain in force. Browser callers still require production Origin and CAPTCHA checks. Relay requests do not enqueue automatic borrower replies.

## Email requirement

The owner explicitly requires new-lead email alerts to continue. Read-only inspection of Netlify on September 12 confirmed the existing `submission_created` email hook, ID `6a4ff2f9b66b0eb4617aa52c`, targets `office@stonehavencre.com` and is not marked disabled. No notification setting was changed. Configuration was verified; no test email was sent.

Keep `js/site-config.js` `intakeEndpoint` empty and `FAMILY_CRM_INTAKE_URL` unset. Direct-to-CRM paths bypass Netlify capture and its email hook. Do not use `CRM_WEBHOOK_URL` as a second CRM intake path; that older optional browser relay can create duplicate delivery.

## Deployment configuration

CRM: deploy the reviewed `codex/website-crm-intake` change based on currently deployed commit `74809b81756e037015a54178b344c7b5f74f3cef`. Upstream main differs from that deployed revision, so do not deploy main indiscriminately. Configure `WEBSITE_RELAY_SECRET` with a random secret at least 32 characters long and set `WEBSITE_RELAY_ENABLED=1` to enable only the authenticated relay. The browser transport and its stored settings remain unchanged.

Netlify: configure the matching `WEBSITE_RELAY_SECRET`, `WEBSITE_CRM_INTAKE_URL=https://stonehaven-crm.onrender.com/api/intake/website`, and finally `WEBSITE_CRM_RELAY_ENABLED=1`. Secrets belong only in deployment environment variables, never in browser scripts or git. No production secret has been created or changed during this work.

Enable after checking the CRM response with a synthetic inquiry and verifying the intended email recipient receives the existing Netlify notification. A real end-to-end receipt and database verification are still required.

## Residential boundary

The deployed CRM is substantially newer than the handoff's local checkout. Its existing `ingestLead` service requires a reviewed Residential mapping and exact disclosure evidence. Current website forms do not supply that CRM evidence. The prepared transport preserves this restriction and will surface the rejection while the inquiry remains in Forms and email. Do not claim Residential import is working or fabricate evidence from the submitted notice version.

The owner chose to keep Residential and Family Opportunity inquiries in email and Netlify for now. The relay explicitly skips Residential product submissions and the Residential, HELOC, and Family page families. It does not attempt a CRM import for them.

## Validation

Website checks: `node scripts/check-site.mjs`, including six relay tests.
CRM targeted tests: `node node_modules/vitest/vitest.mjs run --config vitest.website-relay.config.ts`, nine mocked route/service tests.
CRM TypeScript check: passed using the locked dependencies and freshly generated Prisma client under Node 22. Changed CRM files pass ESLint.

The targeted tests make no real database writes, borrower communications or production lead submissions. They establish transport behavior, not live delivery or production Residential admission.
