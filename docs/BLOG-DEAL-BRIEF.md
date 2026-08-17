# Closings blog — deal brief format & compliance rules (2026-08-17)

Owner sends a brief (chat is fine); Claude writes EN + ES posts with
`scripts/new-post.mjs`, which builds `blog/<slug>.html`, `es/blog/<slug>.html`,
inserts cards into both indexes, adds sitemap/_redirects lines.

## What to send per deal
- Product/desk: commercial | SBA 7(a)/504 | DSCR | residential (purchase/refi/FHA/VA/HELOC)
- Property type + metro/state (never the address)
- Loan amount (round to nearest $25k–$100k), leverage (LTV/LTC/CLTV), term, amortization, recourse, prepay
- Purpose (acquisition, cash-out, rate/term, construction, bridge-to-perm)
- What was hard and how it was solved (the SEO/LLM value lives here)
- Time to close, borrower profile in generic terms ("first-time investor", "operator")
- Borrower consent to publish (required — say "consented")

## Hard rules
- No borrower, guarantor, lender, seller, or broker names. No addresses, parcel IDs, or photos.
- Rates ARE allowed on blog posts (owner ruling 2026-08-17): they are facts of a closed deal, not an offer.
  * Commercial / DSCR / SBA (business-purpose): state note rate, index+spread, fixed period freely.
  * Residential (consumer-purpose: purchase, refi, FHA, VA, HELOC): a stated rate is a Reg Z
    trigger term even in a "closings" post -> ALWAYS pair it as "note rate X.XX% / APR Y.YY%,
    as closed on <date>", ARM -> add "rate may increase after the fixed period", plus the
    auto-appended "historical, not an offer" line. Never a rate without its APR on residential.
  * Every rate carries its closing date. Never present a closed rate as currently available.
- No pricing anywhere else on the site (the "no rates" rule still applies outside /blog).
- No "approved in X days" promises, no "guaranteed", no "lowest".
- Post is descriptive of one closed deal, never an offer. Disclaimer block auto-appended.
- Third-party capital: always "arranged through" — Stonehaven is not the lender.
- ES mirror ships with every EN post; sentence case (lint-es-casing.mjs).
