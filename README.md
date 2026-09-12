# Stonehaven Lending website

Static HTML, CSS, JavaScript and Python page generators for the live mortgage brokerage site at https://stonehavencre.com. English pages live at the root and Spanish pages under `es/`.

## Development

Run `python3 scripts/dev-server.py 8125`, then open http://127.0.0.1:8125. This server supports clean page URLs. Use `node scripts/family-dev-server.mjs 8902` for local Family form testing.

Run `node scripts/check-site.mjs` for all tests, four linters and the release content gate. No npm dependencies are required. CI uses Node 22 and Python 3.12. Netlify runs the same checks before removing internal files and publishing. GitHub checks also verify generator output matches the committed pages.

## Page ownership

Read `docs/PROJECT-HANDOFF.md` before editing. Family, DSCR persona and HELOC landing pages are generated. Rebuild in this order:

```sh
python3 scripts/build-family-lps.py
python3 scripts/build-dscr-personas.py
python3 scripts/build-heloc-personas.py
python3 scripts/build-heloc-ads.py
```

The DSCR generator also owns a marked block in `dscr.html`. DSCR and HELOC generators read the footer in `residential.html`. Update generators when changing generated markup or asset cache keys.

## Blog publishing

Run `node scripts/new-post.mjs path/to/brief.json`. A brief requires `slug`, `date`, `type` (`guide` or `closing`), and `en` and `es` objects containing `title`, `desc`, `eyebrow`, `body` and `terms`. The type selects the disclosure. The script validates both languages and rejects an existing slug before making changes, preventing duplicate cards, redirects and sitemap entries. It saves new source briefs under `docs/blog-briefs/`; commit them with the output.

Older posts have no saved briefs. Edit those published pages in both languages. Do not rerun the new-post command to update an existing post.

## Release and integrations

Pushing to upstream `main` publishes immediately on Netlify. Review a feature branch before release. Response headers and CSP belong in `_headers`. Internal docs, scripts, tests and withdrawn downloads are removed during the build.

Public contact details are in `js/site-config.js`. Leads use Netlify Forms so existing office email alerts continue. A signed Netlify event forwards saved inquiries to the CRM, including Residential, HELOC and Family Opportunity. Netlify capture and office email alerts remain enabled. See `docs/WEBSITE-CRM-RELAY.md`. HELOC forms share `js/heloc-fields.js`; all three financial estimates are required, and comparison forms enable them when HELOC is selected.
