# Architect financing pages

Owner request: build pages for architects seeking a financing partner for construction and development projects. The broad residential, investment, commercial and SBA homepage remains unchanged.

Three distinct search intents, each in English and Spanish:

- `/commercial/architect-financing-partners`: professional introduction, roles, client permission and the appropriate financing route.
- `/commercial/construction-financing-for-architects`: active ground-up, spec and teardown projects, drawing status, budget, eligible costs and draw timing.
- `/commercial/development-financing-for-architects`: feasibility, entitlements, construction and stabilization for multifamily, mixed-use and redevelopment.

The pages use the established CRE design and shared renderer. Their content is retained in `docs/cre-financing/architect-services.json`; `scripts/build-architect-financing.py` is part of the reproducible CI build.

Each page has a dedicated architect inquiry form with the professional's own contact details and role. An expandable optional section collects project figures and timing without requiring an active project. The existing shared funnel saves the inquiry to Netlify's `lead` form and retains the existing email notification and CRM relay. The lead is tagged `Commercial` with an architect-specific page identifier and context, and role and firm are included in structured extra data and human-readable notes. No production test leads are submitted.

Financing remains subject to lender underwriting and availability. These pages do not promise an architect commission, guaranteed funding, concept-stage funding or payment of architectural fees. Homeowner clients use the residential route. The copy does not impose a preferred project-size band.

Discovery includes reciprocal topic links, contextual links from existing CRE pages, bilingual canonicals and language alternates, sitemap entries, service and webpage structured data, and factual AI discovery pointers. No ranking or indexing result is claimed.

Validation: all 110 tests and site checks pass across 402 pages and 340 sitemap URLs. All 13 generators replay with no drift. Browser checks covered all six pages at 1280px and 320px, with no horizontal overflow, one primary heading and one form per page, labeled controls and centered submit buttons. The optional project section was checked expanded on desktop and mobile; mobile controls use 16px text. The English and Spanish homepage files are unchanged. A submission regression test covers general introductions and active projects on all six forms with mocked delivery, including private context retention and analytics exclusions.
