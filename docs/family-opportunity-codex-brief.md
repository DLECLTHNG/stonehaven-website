> **SUPERSEDED 2026-09-12.** This brief covered only the Family Opportunity work.
> For a handoff of the whole project, use `docs/CODEX-BRIEF.md` and
> `docs/PROJECT-HANDOFF.md`. This file is kept because its Family-specific
> framing is still correct, but it is no longer the place to start.

# Codex kickoff brief: Family Opportunity Mortgage

Paste this in as the opening message, then let the agent read the full
engineering handoff at `docs/family-opportunity-handoff.md`.

---

You are taking over the Family Opportunity Mortgage work on the Stonehaven
Lending marketing site. Read `docs/family-opportunity-handoff.md` first and in
full before changing anything. It is accurate as of 2026-09-11.

**What exists.** Four generated pages are live in production: a neutral
`/family-home-financing` that ad traffic lands on, `/buy-a-home-for-parents`,
`/family-housing-options`, and a shared `/request-received` confirmation page. They are served by Netlify from the
`main` branch of `github.com/DLECLTHNG/stonehaven-website`. A Netlify Function at
`/.netlify/functions/family-inquiry` validates and stores inquiries. There is a
generator, a compliance linter, and ten passing endpoint tests.

**How to work on it.** Never edit the generated HTML. Edit
`scripts/family_lp_config.py`, then run:

```bash
python3 scripts/build-family-lps.py
node scripts/lint-family-lps.mjs
node --test tests/family-inquiry.test.mjs
node scripts/family-dev-server.mjs 8902   # local preview, dry run
```

Pushing to `main` deploys to production immediately. There is no staging step.
Confirm with the owner before pushing.

**The one thing you must understand before touching tracking code.**
`/family-housing-options` is about financing a home for an adult child with a
disability. It carries no Meta Pixel, no Conversions API, and no retargeting,
and that block is enforced in two independent places plus a test. This is not an
oversight or a config default. Section 4 of the handoff explains the reasoning,
including Meta's own Business Tools Terms and Fair Housing Act exposure.

The owner has asked for the Pixel to be added to that page. The previous agent
did not implement it and set out why. Treat this as an open decision that needs
the owner and their legal adviser, not as a backlog ticket to clear. If the
decision is made to proceed, section 4 lists every place that has to change,
including the consent notice and its version stamp.

**Highest value work available**, detail in section 8:

1. Meta Conversions API on the parents page. Code is done, needs a token.
2. CRM integration, which is blocked by a real incompatibility described in
   section 7. Do not just set the environment variable, it will fail closed.
3. Flipping the pages out of `noindex`.

**Credentials.** None are in the repository. Section 5 lists what is needed and
who supplies it. Do not paste the Meta Conversions API token yourself, have the
owner set it in Netlify.

**House copy rules**, enforced by the linter and the build: no em or en dashes,
no rate or percentage or dollar figures, no credit score numbers, no
"guaranteed" or "loophole" phrasing, no trailing periods on headings. The
Netlify build greps published HTML for prohibited claims and fails on a match.
