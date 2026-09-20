# Contextual article discovery

Implemented September 20, 2026.

A crawl of the current site found four English/Spanish article pairs that were reachable through the blog indexes and their translated counterparts but lacked a relevant contextual link from another page's body content. These were not orphaned pages, and this finding does not establish why Google has or has not indexed a particular URL.

The shared search-navigation generator now adds 15 contextual links across related product, state and educational pages:

- Charlotte five-to-eight-unit DSCR financing, from the small multifamily guide and North Carolina investor guide in both languages.
- A DSCR HELOC scenario for a paid-off rental, from the DSCR product page and rental-equity article in both languages.
- The company-reported Georgia cash-out refinance closing, from the cash-out refinance and Georgia residential pages in both languages.
- Tampa Bay short-term rental DSCR qualification, from the Florida investor guide in both languages and the English short-term rental product page.

The generated paragraphs distinguish educational scenarios from company-reported transactions and link to the matching language. They preserve the broad homepage, existing inquiry routing, intentional noindex decisions and Family privacy behavior.

Validation: all 110 automated tests and site/content checks passed, covering 402 public HTML pages and 340 sitemap URLs. All 13 generators reproduced their output without drift. Search Console account exports and private performance analysis are retained outside this public repository.
