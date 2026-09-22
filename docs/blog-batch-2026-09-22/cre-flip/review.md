# Brief review, September 22, 2026

Five bilingual JSON briefs are ready for the parent publishing workflow. No generator, index, sitemap, HTML page or shared script was modified by this content subtask.

| Slug | English words | Spanish words | Brief checks |
| --- | ---: | ---: | --- |
| commercial-refinance-cash-in-gap | 973 | 994 | Pass |
| construction-loan-interest-reserve-vs-contingency | 934 | 968 | Pass |
| fix-and-flip-rehab-draw-cash-flow | 999 | 964 | Pass |
| fix-and-flip-rental-exit-refinance | 988 | 948 | Pass |
| subdivision-loan-lot-release-prices | 1014 | 1026 | Pass |

Word counts cover body text and headings after stripping HTML tags. The overview terms are additional.

## Completed checks

- Reviewed `scripts/new-post.mjs`, `docs/BLOG-DEAL-BRIEF.md`, `docs/STYLE-es.md`, existing blog filenames and the current investor-guide/service-page source libraries before topic selection.
- Parsed all five JSON files; verified exact publication date, permitted type and product, matching EN/ES body structure, terms pairs and complete required metadata.
- Checked every body HTML fragment for balanced tags. All tables include captions and column header scope. Lists and tables begin with their block tag and will not be wrapped in publisher paragraphs.
- Checked all internal links against existing HTML paths. Corrected the unavailable Spanish commercial-refinance resource link to its English counterpart with an explicit Spanish-language label.
- Independently calculated and asserted every worked example's main arithmetic, including sensitivity cases and the distinction between temporary working float and construction cost.
- Confirmed no em dashes, fabricated completed transactions, lender identities from private transactions, advertised interest rates, universal reserve thresholds or guaranteed financing.
- Reviewed Spanish as full mirrors with consistent usted and sentence-case headings. This is an editorial check, not a claimed review by a named or licensed translator.
- `git diff --check` for this owned directory passed.

## Integration notes

- Preserve standalone tables and lists when publishing.
- Existing Commercial publisher CTA says construction project on every Commercial article. Use a broader commercial review CTA for `commercial-refinance-cash-in-gap`; the flip articles should use fix-and-flip/project review wording. The subdivision article benefits from a land-development review CTA. Body links already lead to suitable product pages.
- Run the standard generated-page site checks, Spanish lint and browser formatting checks after integration. No browser rendering is claimed at the brief stage.
- Source evidence and exact numerical assumptions are recorded in `sources.md` in this directory.
