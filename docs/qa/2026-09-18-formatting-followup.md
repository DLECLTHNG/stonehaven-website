# Formatting follow-up, September 18, 2026

Reviewed the complete 390-page website after the CRE search release (`baa4913`). This pass covers presentation and preserves financing copy, calculations, form fields and submission destinations.

## Fixes

- Made the final discovery-source field full width on the English and Spanish construction, fix-and-flip and builder capital announcement forms. Bridge forms retain their even final row.
- Aligned the completed-value and project-type input row when the longer labels wrap. Darkened the author/date bylines on the three commercial guides.
- Gave the English and Spanish DSCR program calculator unit fields a readable two-column layout, with a single column at 400px and below. Labels wrap instead of clipping, and mobile controls use 16px text.
- Kept figures intact in the six dense DSCR article comparisons. The tables use natural column widths inside bounded, named, keyboard-focusable scroll regions, with localized mobile swipe hints. Two-column summary tables retain their existing layout.
- Stacked the Family contact cards on small screens so the email and biography remain inside the card.
- Added mobile gutters to direct interior-hero paragraphs.
- Stacked and centered the HELOC wizard's save-estimate panel at every width. The phone field uses the available width, and the button can wrap. The closed panel is now hidden from keyboard navigation as well as visually offscreen.

## Verification

Every one of the 390 pages was rendered at **1280px and 320px**, with an explicit reload and completed load before measuring. Both final passes found zero document overflow, zero uncontained horizontal content overflow, zero missing visible images and zero off-center visible submit buttons. Intentional horizontal table scrolling and hidden controls were excluded from failures.

Ten representative pages were additionally checked at **768px and 1024px**: home, Commercial, new CRE services, the Spanish builder form, both program calculators, the loan-sizing guide, Family and Residential. All 20 checks passed.

Inspected mobile screenshots and measured the corrected Family card, calculator labels, Spanish CRE rows and comparison table. Walked the English HELOC wizard using hypothetical values to open the save-estimate panel. At 320px, its phone field occupied the full 284px form width and the submit button was centered. Closing the panel restored hidden visibility. No name, email or phone was entered and no inquiry was submitted.

All 99 automated tests and existing site/content checks passed. All ten generators reproduced their tracked output without drift. Shared asset versions were updated in pages and source templates: `styles.css?v=polish-20260918`, `family.css?v=polish-20260918` and `heloc-lp.js?v=12`.

These were Chromium responsive checks, not physical-device Safari/Firefox tests. No search-performance or financial-content claim is made by this formatting review. Sitemap modification dates were preserved because the changes are presentational.
