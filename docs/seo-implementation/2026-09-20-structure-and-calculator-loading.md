# Wave two: answer placement, heading hierarchy and calculator loading

Implemented September 20, 2026 against main `978bf8f`.

## Verified baseline

- The English DSCR pillar put the introductory `first-review` section before its direct-answer paragraph. There was no inquiry form above the answer in this revision. Its Spanish mirror already placed the answer directly after the hero and proof strip.
- 345 public HTML pages contained 1,049 footer column labels marked as `h5`. The other public pages use different footer structures.
- The named landing pages, resource hubs and calculators had 19 affected routes including existing Spanish mirrors. Their first content-card headings skipped from `h1` to `h3`.
- Seven English calculator routes and their five existing Spanish mirrors loaded a calculator math bundle synchronously in the head.
- Both DSCR program-calculator pages also contained a stale copy of the separate DSCR analyzer's inline controller. It referenced controls absent from these pages and threw during initialization.

## Changes

The English DSCR direct answer now precedes the review introduction. The Spanish page keeps its existing order and gains the matching `answer` anchor. The answer text, financing claims and inquiry destinations were preserved.

Footer navigation labels now use `p.footer-label`. The shared style preserves their previous presentation without placing navigation labels in the page's heading outline. The top-level cards on the 19 affected routes use `h2`, and the existing card/calculator styles apply to both heading levels to preserve typography.

All 12 calculator math script tags now use `defer`. Inline controllers register their initialization for `DOMContentLoaded`, which follows ordered deferred script execution. The real DSCR program calculator initializes once at that point. The unrelated analyzer controller was removed from both program pages. HELOC's math bundle remains ahead of its already deferred estimate controller.

The DSCR/HELOC generators obtain their footer from `residential.html`; product and article generators clone the relevant residential, commercial or blog shell. Those owning source pages were updated together with existing output. No generated content block was edited. A final generator replay and shared CSS cache-version change are required as part of release integration.

## Validation completed

- Eight targeted Node tests/fixtures passed, including both languages' program-calculator initialization with the math library deliberately unavailable until after inline scripts execute. Strict missing-element lookup catches a reintroduced stale controller. Commercial/SBA engagement tests also now simulate the deferred dependency arriving after inline controller registration.
- Browser checks used freshly reloaded local routes on `127.0.0.1:8142`, with hypothetical calculator inputs only. All 12 calculator routes rendered their defaults and recalculated after input. No lead forms were submitted.
- Both program calculators produced `1.24x` from the default payment assumptions and $3,600 rent. Switching the Spanish program selector to five to eight units created five unit rows.
- Representative results changed as expected: DSCR analyzer `1.17x` to `1.30x`; mortgage payment `$2,825/mo` to `$3,584/mo`; refinance break-even 30 to 20 months; commercial proceeds `$2,100,000` to `$1,603,281`; SBA injection `$100,000` to `$120,000`; HELOC illustrative range `$110,000 - $155,000` to `$150,000 - $200,000`.
- No calculator console errors were captured in those checks. The targeted heading outlines begin `h1`, `h2`, and footer `h5` labels are absent after the change.

These are functional and structural checks. They are not field Core Web Vitals or evidence of a ranking change. Full site checks, generator reproducibility, responsive release review and production verification remain part of the combined release.
