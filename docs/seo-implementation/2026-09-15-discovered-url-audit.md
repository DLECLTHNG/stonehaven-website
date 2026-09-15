# Search Console discovered URL audit, 2026-09-15

The owner supplied 25 URLs reported as “Discovered, currently not indexed”, with no recorded crawl date. Live HTTPS GETs returned 200 for all 25. Every page has an exact self-referencing canonical, no meta noindex, and no X-Robots-Tag response header. All 25 appear in the checked-in production sitemap. Live robots.txt permits crawling and declares the sitemap.

Local crawlable HTML link analysis found no orphan pages. The supplied pages are reachable within one to four link steps from the English homepage. Counts include language switch links, but exclude noindex sources and self-links. This does not establish Googlebot access from Google's network, actual Google crawl scheduling, or indexing quality decisions.

## Change

Add a visible guides section to both DSCR hubs through the final search-navigation generator. Link directly to the program calculator, DSCR explainer, qualifying-rent guide and Florida bridge-payoff case study. The Florida article previously had only the blog index and translated article as inbound sources. Calculator shortest link depth improves from three to two on English and four to three on Spanish.

No URL, canonical, indexing directive, publication date, sitemap lastmod, lead form, or tracking changes were needed. A crawl queue is not evidence that Google rejected content it has not crawled.

## Live URL results before release

| URL | HTTP | Canonical | Noindex | In sitemap |
| --- | --- | --- | --- | --- |
| /blog | 200 | Self | No | Yes |
| /blog/dscr-loans-explained | 200 | Self | No | Yes |
| /blog/dscr-program-calculator-qualifying-rent | 200 | Self | No | Yes |
| /blog/florida-dscr-cash-out-refinance-75-ltv-hard-money-payoff | 200 | Self | No | Yes |
| /cash-out-refinance | 200 | Self | No | Yes |
| /commercial/multifamily | 200 | Self | No | Yes |
| /dscr-program-calculator | 200 | Self | No | Yes |
| /es/blog/dscr-loans-explained | 200 | Self | No | Yes |
| /es/blog/dscr-program-calculator-qualifying-rent | 200 | Self | No | Yes |
| /es/blog/florida-dscr-cash-out-refinance-75-ltv-hard-money-payoff | 200 | Self | No | Yes |
| /es/cash-out-refinance | 200 | Self | No | Yes |
| /es/dscr-program-calculator | 200 | Self | No | Yes |
| /es/residential | 200 | Self | No | Yes |
| /residential/alabama | 200 | Self | No | Yes |
| /residential/florida | 200 | Self | No | Yes |
| /residential/north-carolina | 200 | Self | No | Yes |
| /residential/south-carolina | 200 | Self | No | Yes |
| /residential/tennessee | 200 | Self | No | Yes |
| /es/residential/alabama | 200 | Self | No | Yes |
| /es/residential/florida | 200 | Self | No | Yes |
| /es/residential/north-carolina | 200 | Self | No | Yes |
| /es/residential/south-carolina | 200 | Self | No | Yes |
| /es/residential/tennessee | 200 | Self | No | Yes |
| /resources/commercial | 200 | Self | No | Yes |
| /resources/sba | 200 | Self | No | Yes |

## Verification and next action

All 65 tests and the site content/SEO checks pass. Confirm the new links on production after deploy. Search Console live URL Inspection is still needed to test Google access and request indexing for the priority URLs. No Search Console request has been submitted by this audit. Google controls indexing and no timing or inclusion is guaranteed.

Sources: [Google Page indexing report](https://support.google.com/webmasters/answer/7440203?hl=en), [URL Inspection](https://support.google.com/webmasters/answer/9012289?hl=en), [Crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable).
