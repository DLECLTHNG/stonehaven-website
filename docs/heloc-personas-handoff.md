# HELOC persona pages - review handoff (2026-09-09, branch feat/heloc-persona-pages)

16 pages under /heloc/<slug>, each with ?intent=renovation (default) and
?intent=consolidation. Built from scripts/heloc_personas_config.py (copy) +
scripts/build-heloc-personas.py (generator) + js/heloc-persona.js (runtime).
Rebuild after editing copy: python3 scripts/build-heloc-personas.py
Validate: node scripts/lint-heloc-personas.mjs && node tests/heloc-persona.test.mjs

## Missing product / operational facts (owner to supply before launch)
1. RESOLVED 2026-09-10: South Carolina issues no separate license number (owner confirmed); site now states this explicitly on the SC page.
2. Confirm HELOC program facts used: "no appraisal in most cases" appears on
   the older funnels but was NOT used on these pages (kept out pending program
   confirmation); draw/repayment-period specifics deliberately unstated.
3. Confirm the "usually within one business day" callback promise holds for
   ad-scale volume before spend increases.
4. Meta CAPI token + CRM deploy (heloc-persona page id already whitelisted on
   CRM branch feat/residential-product-website-intake) - leads fall back to
   Netlify Forms until then.
5. Spanish mirrors not built (briefs were English-only). House convention says
   every EN page ships with ES; decide before launch.
6. Legal/compliance review of the two intent copy decks (especially veteran and
   consolidation pages) per the claims checklist.

## Deployment steps remaining
1. Review branch feat/heloc-persona-pages (36 files: 16 pages, engine, config,
   generator, lint, tests, _redirects entries, this doc).
2. Merge to main -> Netlify auto-deploys. Pages are noindex; no sitemap entries
   (paid landing pages by design).
3. After deploy: spot-check /heloc/homeowners?intent=consolidation live, then
   point ads per the route register.
4. Optionally add the 32 URLs to the site monitor.
