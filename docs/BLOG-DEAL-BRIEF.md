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
- No interest rates, no APRs, no pricing (sitewide rule + sentinel gate).
- No "approved in X days" promises, no "guaranteed", no "lowest".
- Post is descriptive of one closed deal, never an offer. Disclaimer block auto-appended.
- Third-party capital: always "arranged through" — Stonehaven is not the lender.
- ES mirror ships with every EN post; sentence case (lint-es-casing.mjs).
