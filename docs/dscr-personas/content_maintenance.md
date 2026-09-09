# Content maintenance plan - DSCR subsection pages

Ownership: site owner (Chris) with specialist reviewer TBD. Edit copy in
scripts/dscr_lp_config_a.py / _b.py, then run scripts/build-dscr-personas.py and
scripts/lint-dscr-personas.mjs. Never hand-edit the generated files.

Recommended cadence (recommendations only; no automation created, no monitoring active):
- On any program change (lender added/dropped, STR/entity/seasoning rules change):
  same-week review of the affected pages against claims_register.md.
- Monthly (first weeks after launch): Search Console query/coverage check for /dscr/*;
  fix crawl anomalies; compare manifest query hypotheses with observed queries.
- Quarterly: full read of the 4 overlap groups for drift; refresh any dated examples;
  re-run lint suite; review Bing AI Performance citations where supported.
- Annually: full claims re-verification pass and reviewed-date update only if a real
  review occurred.
