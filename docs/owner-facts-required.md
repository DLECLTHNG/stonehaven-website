# Owner facts required (NON-PUBLIC — stripped from deploys by netlify.toml)
Sentinels follow the STONEHAVEN_OWNER_FACT_REQUIRED: convention. The build
fails if a sentinel ever reaches rendered public HTML.

| Sentinel | Blocks | Owner action |
|---|---|---|
| STONEHAVEN_OWNER_FACT_REQUIRED:LEGAL_ENTITY | /about, footer legal name, Organization schema legalName | Provide registered legal entity + any d/b/a; approve naming matrix (live brand "Stonehaven Lending" vs project "Stonehaven Commercial") |
| STONEHAVEN_OWNER_FACT_REQUIRED:PHONE | Phone UI sitewide (js/site-config.js `phone`) | Provide verified business number |
| STONEHAVEN_OWNER_FACT_REQUIRED:ADDRESS | LocalBusiness eligibility, ad disclosures | Provide real business address or confirm service-area-only |
| STONEHAVEN_OWNER_FACT_REQUIRED:LICENSES | /licensing-and-availability, state-availability matrix, NMLS display | Provide license/NMLS identifiers + permitted states per activity |
| STONEHAVEN_OWNER_FACT_REQUIRED:AUTHOR | Publishing /resources/dscr hub + guides A–C (briefs ready) | Name a real content author with visible profile |
| STONEHAVEN_OWNER_FACT_REQUIRED:REVIEWER | Same as AUTHOR + rates-content gate | Name a qualified reviewer (credentials verifiable) |
| STONEHAVEN_OWNER_FACT_REQUIRED:TEAM_BIOS | /team, adviser profiles, Person schema | Provide real bios, roles, photos, professional links |
| STONEHAVEN_OWNER_FACT_REQUIRED:PROOF | Case studies, testimonials, funded volume, capital-source counts | Provide verifiable instances with consent |
| STONEHAVEN_OWNER_FACT_REQUIRED:ANALYTICS_IDS | GA4/Pixel/intake activation (js/site-config.js) | Provide measurement IDs + CRM endpoint |
| STONEHAVEN_OWNER_FACT_REQUIRED:SCHEDULER | True calendar booking on /book | Provide scheduling-provider URL |
| STONEHAVEN_OWNER_FACT_REQUIRED:ES_REVIEWER | Publishing new/translated Spanish resource content | Name native U.S.-Spanish human reviewer + confirm bilingual follow-up ops |

Blocked-by-facts backlog (no public routes, drafts, links or sitemap entries exist):
/resources/dscr hub; guides A (loan-requirements), B (how-to-calculate-dscr),
C (cash-out-refinance) and D–R; /about; /team; /licensing-and-availability;
DSCR-specific 1200×630 OG image (design asset); Spanish resource parity.
